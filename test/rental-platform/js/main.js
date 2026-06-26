// ==================== Main JavaScript ==================== 

// DOM Elements
const priceSlider = document.querySelector('.price-slider');
const priceValue = document.getElementById('price-value');
const checkInInput = document.getElementById('check-in');
const checkOutInput = document.getElementById('check-out');
const assetTypeInput = document.getElementById('asset-type');
const locationInput = document.getElementById('location');
const searchButton = document.querySelector('.btn-search');
const searchResultsGrid = document.getElementById('search-results-grid');
const noSearchResults = document.getElementById('no-search-results');
const navLinks = document.querySelectorAll('.nav-link');
const viewButtons = document.querySelectorAll('.view-btn');
const favoriteButtons = document.querySelectorAll('.btn-favorite');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('RentalHub Website Loaded');
    setupEventListeners();
    setupAnimationObserver();
    setMinimumDates();
});

// ==================== Event Listeners ==================== 

function setupEventListeners() {
    // Price slider
    if (priceSlider) {
        priceSlider.addEventListener('input', updatePriceDisplay);
    }

    // Check-in/Check-out dates
    if (checkInInput && checkOutInput) {
        checkInInput.addEventListener('change', validateDates);
        checkOutInput.addEventListener('change', validateDates);
    }

    // Navigation links smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // View buttons toggle
    if (viewButtons.length > 0) {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', handleViewToggle);
        });
    }

    // Search button
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }

    // Favorite buttons
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', handleFavorite);
    });

    // Mobile menu toggle
    setupMobileMenu();
}

// ==================== Price Display ==================== 
function updatePriceDisplay() {
    if (priceValue) {
        priceValue.textContent = `$${priceSlider.value}`;
    }
}

// ==================== Date Validation ==================== 
function validateDates() {
    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);

    if (checkOut <= checkIn) {
        alert('Check-out date must be after check-in date');
        checkOutInput.value = '';
    }
}

// ==================== Set Minimum Dates ==================== 
function setMinimumDates() {
    const today = new Date().toISOString().split('T')[0];
    
    if (checkInInput) {
        checkInInput.setAttribute('min', today);
    }
    if (checkOutInput) {
        checkOutInput.setAttribute('min', today);
    }
}

// ==================== Navigation ==================== 
function handleNavigation(e) {
    const href = this.getAttribute('href');
    
    // Remove active class from all links
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to clicked link
    this.classList.add('active');

    // If internal anchor link, prevent default and smooth scroll
    if (href.startsWith('#')) {
        e.preventDefault();
        const section = document.querySelector(href);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// ==================== View Toggle ==================== 
function handleViewToggle(e) {
    const assetsGrid = document.querySelector('.assets-grid');
    if (!assetsGrid) return;

    // Remove active class from all buttons
    viewButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    e.currentTarget.classList.add('active');

    // Toggle grid layout
    if (e.currentTarget.classList.contains('fa-list')) {
        assetsGrid.style.gridTemplateColumns = '1fr';
    } else {
        assetsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    }
}

// ==================== Favorite Toggle ==================== 
function handleFavorite(e) {
    const icon = e.currentTarget.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        e.currentTarget.style.color = '#ec4899';
        showNotification('Added to favorites!', 'success');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        e.currentTarget.style.color = '#6b7280';
        showNotification('Removed from favorites', 'info');
    }
}

function handleSearch(e) {
    if (e) e.preventDefault();

    const selectedType = assetTypeInput ? assetTypeInput.value.trim() : 'All Types';
    const locationQuery = locationInput ? locationInput.value.trim().toLowerCase() : '';

    const filteredAssets = rentalAssets.filter(asset => {
        const matchesType = selectedType === 'All Types' || asset.type === selectedType;
        const matchesLocation = !locationQuery || asset.location.toLowerCase().includes(locationQuery);
        return matchesType && matchesLocation;
    });

    renderSearchResults(filteredAssets);
}

function renderSearchResults(assets) {
    if (!searchResultsGrid) return;

    searchResultsGrid.innerHTML = '';

    if (!assets.length) {
        noSearchResults.style.display = 'block';
        return;
    }

    noSearchResults.style.display = 'none';

    assets.forEach(asset => {
        const card = document.createElement('div');
        card.className = 'asset-card fade-in-up';
        card.innerHTML = `
            <div class="asset-image-wrapper">
                <div class="asset-image ${asset.imageClass}"></div>
                <span class="asset-badge">${asset.badge}</span>
                <button class="btn-favorite">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="asset-content">
                <div class="asset-rating">
                    ${' <i class="fas fa-star"></i>'.repeat(asset.rating)}
                    <span>(${asset.reviews} reviews)</span>
                </div>
                <h3>${asset.title}</h3>
                <p class="asset-location">
                    <i class="fas fa-map-marker-alt"></i> ${asset.location}
                </p>
                <div class="asset-condition">
                    <span class="condition-badge ${asset.conditionClass}">${asset.condition}</span>
                </div>
                <p class="asset-description">${asset.description}</p>
                <div class="asset-features">
                    ${asset.features.map(feature => `<span><i class="fas fa-circle"></i> ${feature}</span>`).join('')}
                </div>
                <div class="asset-footer">
                    <div class="asset-price">
                        <span class="price">${asset.price}</span>
                        <span class="period">/day</span>
                    </div>
                    <a href="pages/booking.html" class="btn btn-primary btn-small">Book Now</a>
                </div>
            </div>
        `;
        searchResultsGrid.appendChild(card);
    });
}

const rentalAssets = [
    {
        title: '2024 Tesla Model 3',
        type: 'Vehicles',
        location: 'San Francisco, CA',
        price: '$95',
        rating: 5,
        reviews: 245,
        badge: 'Popular',
        condition: 'Excellent',
        conditionClass: 'excellent',
        description: 'Luxury electric car, fully charged, clean interior.',
        features: ['5 seats', 'Auto', 'GPS Navigation'],
        imageClass: 'car-image'
    },
    {
        title: 'Mountain Bike Pro',
        type: 'Equipment',
        location: 'San Francisco, CA',
        price: '$25',
        rating: 4,
        reviews: 89,
        badge: 'New',
        condition: 'Excellent',
        conditionClass: 'excellent',
        description: 'High-end mountain bike with full suspension and disc brakes.',
        features: ['27.5" Wheels', '21 Speed', 'Helmet Included'],
        imageClass: 'bike-image'
    },
    {
        title: 'Luxury City Apartment',
        type: 'Property',
        location: 'New York, NY',
        price: '$120',
        rating: 5,
        reviews: 120,
        badge: 'Featured',
        condition: 'Great',
        conditionClass: 'great',
        description: 'Modern apartment near central park with premium amenities.',
        features: ['2 beds', 'Wi-Fi', 'Kitchen'],
        imageClass: 'property-image'
    },
    {
        title: 'Conference Hall Suite',
        type: 'Event Spaces',
        location: 'Los Angeles, CA',
        price: '$220',
        rating: 4,
        reviews: 64,
        badge: 'Premium',
        condition: 'Excellent',
        conditionClass: 'excellent',
        description: 'Spacious event hall with AV setup and catering options.',
        features: ['200 guests', 'Projector', 'Stage'],
        imageClass: 'event-space-image'
    }
];

// Render all assets by default in search results
if (searchResultsGrid) {
    renderSearchResults(rentalAssets);
}

// ==================== Notifications ==================== 
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        z-index: 2000;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== Mobile Menu ==================== 
function setupMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navBrand = document.querySelector('.nav-brand');

    if (!navMenu || !navBrand) return;

    let hamburger = document.querySelector('.hamburger-menu');
    if (!hamburger) {
        hamburger = document.createElement('button');
        hamburger.className = 'hamburger-menu';
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        navBrand.parentElement.insertBefore(hamburger, navBrand.nextSibling);
    }

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        hamburger.classList.toggle('open');
        const icon = hamburger.querySelector('i');
        if (navMenu.classList.contains('open')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('open');
            if (hamburger) {
                const icon = hamburger.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
}

// ==================== Intersection Observer for Animations ====================
function setupAnimationObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.animation = `${getAnimationName(entry.target)} 0.8s ease-out`;
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    document.querySelectorAll('[class*="fade-in"], [class*="slide-in"]').forEach(el => {
        observer.observe(el);
    });
}

// ==================== Get Animation Name ==================== 
function getAnimationName(element) {
    if (element.classList.contains('fade-in-down')) return 'fadeInDown';
    if (element.classList.contains('fade-in-up')) return 'fadeInUp';
    if (element.classList.contains('fade-in-left')) return 'fadeInLeft';
    if (element.classList.contains('fade-in-right')) return 'fadeInRight';
    if (element.classList.contains('slide-in-left')) return 'slideInLeft';
    if (element.classList.contains('slide-in-right')) return 'slideInRight';
    return 'fadeInUp';
}

// ==================== Scroll Effects ==================== 
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
        navbar.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }

    // Hide navbar on scroll down, show on scroll up
    if (scrollTop > lastScrollTop) {
        // Scrolling DOWN
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling UP
        navbar.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);

// ==================== Counter Animation ==================== 
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 30);
}

// Observe counters
const counters = document.querySelectorAll('.counter h3');
const observerCounter = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const text = entry.target.textContent;
            const number = parseInt(text.replace(/,/g, ''));
            if (!isNaN(number)) {
                animateCounter(entry.target, number);
            }
            observerCounter.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => observerCounter.observe(counter));

// ==================== Form Validation ==================== 
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#e5e7eb';
        }
    });

    return isValid;
}

// ==================== Handle Click Outside ==================== 
function handleClickOutside(element, callback) {
    document.addEventListener('click', (e) => {
        if (!element.contains(e.target)) {
            callback();
        }
    });
}

// ==================== Keyboard Shortcuts ==================== 
document.addEventListener('keydown', function(e) {
    // Press 'S' to focus search
    if (e.key === 's' || e.key === 'S') {
        const searchInput = document.querySelector('input[id*="search"], input[id*="location"]');
        if (searchInput) {
            searchInput.focus();
        }
    }

    // Press 'Escape' to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.open');
        modals.forEach(modal => modal.classList.remove('open'));
    }
});

// ==================== Local Storage Management ==================== 
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
}

// ==================== Theme Toggle (Optional) ==================== 
function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.style.colorScheme === 'dark';

    if (isDark) {
        root.style.colorScheme = 'light';
        saveToLocalStorage('theme', 'light');
    } else {
        root.style.colorScheme = 'dark';
        saveToLocalStorage('theme', 'dark');
    }
}

// ==================== Session Management ==================== 
function setSessionTimeout() {
    let timeoutId;
    const timeout = 30 * 60 * 1000; // 30 minutes

    function resetTimeout() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            showNotification('Session expired. Please log in again.', 'warning');
        }, timeout);
    }

    document.addEventListener('mousemove', resetTimeout);
    document.addEventListener('keypress', resetTimeout);
    document.addEventListener('click', resetTimeout);

    resetTimeout();
}

// ==================== Utility Functions ==================== 

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Calculate days between dates
function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// ==================== Console Messages ==================== 
console.log('%cWelcome to RentalHub', 'font-size: 20px; color: #6366f1; font-weight: bold;');
console.log('%cPeer-to-Peer Asset Booking Platform', 'font-size: 14px; color: #ec4899;');
console.log('%cVersion 1.0.0', 'font-size: 12px; color: #6b7280;');
