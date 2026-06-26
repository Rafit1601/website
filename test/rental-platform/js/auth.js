// ==================== Authentication Script ====================

const authBasePath = window.location.pathname.includes('/pages/') ? './' : 'pages/';
const authLoginUrl = `${authBasePath}login.html`;
const authDashboardUrl = `${authBasePath}dashboard.html`;
const authIndexUrl = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('rhUsers') || '[]');
    } catch (e) {
        console.error('Error reading users from storage:', e);
        return [];
    }
}

function saveUsers(users) {
    try {
        localStorage.setItem('rhUsers', JSON.stringify(users));
    } catch (e) {
        console.error('Error saving users to storage:', e);
    }
}

function seedDefaultUsers() {
    const users = getUsers();
    if (users.length === 0) {
        const defaultUsers = [
            {
                username: 'user',
                password: 'user123',
                role: 'user',
                fullName: 'Default User',
                email: 'user@example.com'
            },
            {
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                fullName: 'Platform Admin',
                email: 'admin@example.com'
            }
        ];
        saveUsers(defaultUsers);
    }
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('rhCurrentUser') || 'null');
    } catch (e) {
        console.error('Error reading current user from storage:', e);
        return null;
    }
}

function setCurrentUser(user) {
    try {
        localStorage.setItem('rhCurrentUser', JSON.stringify(user));
    } catch (e) {
        console.error('Error saving current user:', e);
    }
}

function clearCurrentUser() {
    localStorage.removeItem('rhCurrentUser');
}

function authenticate(username, password) {
    const users = getUsers();
    return users.find(user => user.username === username && user.password === password) || null;
}

function createUser({ fullName, email, username, password }) {
    const users = getUsers();
    if (!fullName || !email || !username || !password) {
        return { success: false, message: 'Please complete all fields.' };
    }

    const usernameExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());
    const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

    if (usernameExists) {
        return { success: false, message: 'Username already exists.' };
    }
    if (emailExists) {
        return { success: false, message: 'Email already exists.' };
    }

    const newUser = {
        username,
        password,
        role: 'user',
        fullName,
        email
    };
    users.push(newUser);
    saveUsers(users);
    return { success: true, user: newUser };
}

function updateAuthNav() {
    const navAuth = document.querySelector('.nav-auth');
    if (!navAuth) return;

    const currentUser = getCurrentUser();
    if (currentUser) {
        const profileUrl = `${authBasePath}profile.html`;
        navAuth.innerHTML = `
            <span class="nav-user">Hi, ${currentUser.fullName || currentUser.username}</span>
            <a href="${profileUrl}" class="btn btn-secondary btn-small">Profile</a>
            <button id="logout-button" class="btn btn-secondary">Logout</button>
        `;

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                clearCurrentUser();
                window.location.href = authLoginUrl;
            });
        }
    } else {
        navAuth.innerHTML = `
            <a href="${authLoginUrl}" class="btn btn-login">Login</a>
            <a href="${authBasePath}login.html#register" class="btn btn-signup">Sign Up</a>
        `;
    }

    updateDashboardLinkVisibility(currentUser);
}

function updateDashboardLinkVisibility(currentUser) {
    const navLinks = document.querySelectorAll('a.nav-link');
    navLinks.forEach(link => {
        if (link.href && link.href.includes('dashboard.html')) {
            if (currentUser && currentUser.role === 'admin') {
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
        }
    });
}

function showAuthNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 110px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        z-index: 2000;
        box-shadow: 0 10px 15px rgba(0,0,0,0.12);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('login-username')?.value.trim();
    const password = document.getElementById('login-password')?.value.trim();

    if (!username || !password) {
        showAuthNotification('Enter username and password.', 'error');
        return;
    }

    const user = authenticate(username, password);
    if (!user) {
        showAuthNotification('Invalid credentials. Try again.', 'error');
        return;
    }

    setCurrentUser(user);
    showAuthNotification('Login successful!', 'success');
    setTimeout(() => {
        if (user.role === 'admin') {
            window.location.href = authDashboardUrl;
        } else {
            window.location.href = authIndexUrl;
        }
    }, 600);
}

function handleRegisterSubmit(event) {
    event.preventDefault();
    const fullName = document.getElementById('register-fullname')?.value.trim();
    const email = document.getElementById('register-email')?.value.trim();
    const username = document.getElementById('register-username')?.value.trim();
    const password = document.getElementById('register-password')?.value.trim();
    const confirmPassword = document.getElementById('register-confirm-password')?.value.trim();

    if (password !== confirmPassword) {
        showAuthNotification('Passwords do not match.', 'error');
        return;
    }

    const result = createUser({ fullName, email, username, password });
    if (!result.success) {
        showAuthNotification(result.message, 'error');
        return;
    }

    setCurrentUser(result.user);
    showAuthNotification('Account created successfully!', 'success');
    setTimeout(() => {
        if (result.user.role === 'admin') {
            window.location.href = authDashboardUrl;
        } else {
            window.location.href = authIndexUrl;
        }
    }, 600);
}

function initAuthPage() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');

    if (loginTab && registerTab && loginPanel && registerPanel) {
        const showLogin = () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginPanel.style.display = 'block';
            registerPanel.style.display = 'none';
        };
        const showRegister = () => {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
            loginPanel.style.display = 'none';
            registerPanel.style.display = 'block';
        };

        loginTab.addEventListener('click', showLogin);
        registerTab.addEventListener('click', showRegister);

        if (window.location.hash === '#register') {
            showRegister();
        } else {
            showLogin();
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
}

function redirectToLogin() {
    window.location.href = authLoginUrl;
}

function requireAuth() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        redirectToLogin();
        return null;
    }
    return currentUser;
}

seedDefaultUsers();
updateAuthNav();

document.addEventListener('DOMContentLoaded', () => {
    updateAuthNav();
    initAuthPage();
});

window.getCurrentUser = getCurrentUser;
window.requireAuth = requireAuth;
window.logoutUser = () => {
    clearCurrentUser();
    redirectToLogin();
};
