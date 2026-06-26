// ==================== Dashboard Page JavaScript ==================== 

// DOM Elements
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const dashboardSections = document.querySelectorAll('.dashboard-section');
const bookingItems = document.querySelectorAll('.booking-card');
const assetItems = document.querySelectorAll('.asset-item');
const bookingsContainer = document.querySelector('.bookings-container');
const bookingSearchInput = document.getElementById('booking-search-input');
const recentBookingsList = document.getElementById('recent-bookings-list');
const activeBookingsCount = document.getElementById('active-bookings-count');
const earningsThisMonth = document.getElementById('earnings-this-month');
const dashboardSidebar = document.querySelector('.dashboard-sidebar');
let currentDashboardUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = window.requireAuth ? window.requireAuth() : null;
    if (!currentUser) return;

    currentDashboardUser = currentUser;
    console.log('Dashboard Page Loaded');
    renderPersistedBookings(currentUser);
    setupDashboardEventListeners();
    addDashboardAnimations();
    setupCharts();
    simulateLiveUpdates();
});

// ==================== Setup Event Listeners ==================== 
function setupDashboardEventListeners() {
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', handleSectionNavigation);
    });

    // Booking search
    if (bookingSearchInput) {
        bookingSearchInput.addEventListener('input', handleBookingSearchInput);
    }

    // Booking action buttons
    setupBookingActionListeners();

    // Add hover effects
    setupHoverEffects();
}

function handleBookingSearchInput(e) {
    const query = e.target.value.trim();
    renderPersistedBookings(currentDashboardUser, query);
}

// ==================== Handle Section Navigation ==================== 
function handleSectionNavigation(e) {
    const href = this.getAttribute('href');
    if (!href || !href.startsWith('#')) {
        return; // allow navigation to separate pages
    }

    const targetSection = document.querySelector(href);
    if (!targetSection) {
        return;
    }

    e.preventDefault();

    // Remove active class from all links and sections
    sidebarLinks.forEach(link => link.classList.remove('active'));
    dashboardSections.forEach(section => section.classList.remove('active'));

    // Add active class to clicked link and corresponding section
    this.classList.add('active');
    targetSection.classList.add('active');

    // Add animation
    targetSection.style.animation = 'fadeInUp 0.5s ease-out';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== Show Modify Booking Modal ==================== 
function showModifyBookingModal(bookingItem) {
    const assetName = bookingItem.querySelector('.booking-header h3, .booking-header h4')?.textContent || 'Selected Asset';
    const bookingDate = bookingItem.querySelector('.booking-details p')?.textContent || 'Current dates unavailable';

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-header">
                <h2>Modify Booking</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p><strong>Asset:</strong> ${assetName}</p>
                <p><strong>Current Dates:</strong> ${bookingDate}</p>
                <div class="form-group">
                    <label for="new-check-in">New Check-In Date</label>
                    <input type="date" id="new-check-in" required>
                </div>
                <div class="form-group">
                    <label for="new-check-out">New Check-Out Date</label>
                    <input type="date" id="new-check-out" required>
                </div>
                <div class="form-group">
                    <label for="modification-reason">Reason for Modification</label>
                    <textarea id="modification-reason" rows="3" placeholder="Please explain why you need to modify this booking..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-primary">Update Booking</button>
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: backdropFadeIn 0.3s ease-out;
    `;

    const modalDialog = modal.querySelector('.modal-dialog');
    modalDialog.style.cssText = `
        background: white;
        border-radius: 1rem;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 90%;
        animation: modalFadeIn 0.3s ease-out;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;

    const modalHeader = modal.querySelector('.modal-header');
    modalHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
    `;

    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
        transition: color 0.3s ease;
    `;

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.color = '#111827';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.color = '#6b7280';
    });

    const modalBody = modal.querySelector('.modal-body');
    modalBody.style.cssText = `
        padding: 1.5rem;
        max-height: 400px;
        overflow-y: auto;
    `;

    const modalFooter = modal.querySelector('.modal-footer');
    modalFooter.style.cssText = `
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding: 1.5rem;
        border-top: 1px solid #e5e7eb;
    `;

    const updateBtn = modal.querySelector('.modal-footer .btn-primary');
    updateBtn.addEventListener('click', () => {
        showNotification('Booking updated successfully!', 'success');
        modal.remove();
    });

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ==================== Show Cancel Confirmation ==================== 
function showCancelConfirmation(bookingItem) {
    const assetName = bookingItem.querySelector('h4').textContent;
    const refundInfo = '90% will be refunded to your account';

    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirm-dialog';
    confirmDialog.innerHTML = `
        <div class="dialog-content">
            <div class="warning-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Cancel Booking?</h2>
            <p>Are you sure you want to cancel this booking for <strong>${assetName}</strong>?</p>
            <div class="refund-info">
                <i class="fas fa-info-circle"></i>
                <span>${refundInfo}</span>
            </div>
            <div class="dialog-buttons">
                <button class="btn btn-secondary" onclick="this.closest('.confirm-dialog').remove()">Keep Booking</button>
                <button class="btn btn-danger">Yes, Cancel Booking</button>
            </div>
        </div>
    `;

    confirmDialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: backdropFadeIn 0.3s ease-out;
    `;

    const content = confirmDialog.querySelector('.dialog-content');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        max-width: 400px;
        text-align: center;
        animation: modalFadeIn 0.3s ease-out;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
    `;

    const warningIcon = confirmDialog.querySelector('.warning-icon');
    warningIcon.style.cssText = `
        font-size: 3rem;
        color: #f59e0b;
        margin-bottom: 1rem;
    `;

    const refundBox = confirmDialog.querySelector('.refund-info');
    refundBox.style.cssText = `
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #92400e;
        font-size: 0.9rem;
    `;

    const buttons = confirmDialog.querySelector('.dialog-buttons');
    buttons.style.cssText = `
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    `;

    const cancelBtn = confirmDialog.querySelector('.btn-danger');
    cancelBtn.addEventListener('click', () => {
        showNotification('Booking cancelled. Refund will be processed within 5-7 business days.', 'success');
        bookingItem.style.animation = 'slideOutLeft 0.5s ease-out';
        setTimeout(() => {
            bookingItem.remove();
            confirmDialog.remove();
        }, 500);
    });

    document.body.appendChild(confirmDialog);

    // Close on backdrop click
    confirmDialog.addEventListener('click', (e) => {
        if (e.target === confirmDialog) {
            confirmDialog.remove();
        }
    });
}

// ==================== Notification ==================== 
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

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
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== Add Dashboard Animations ==================== 
function addDashboardAnimations() {
    // Animate stats cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animation = `slideInLeft 0.6s ease-out`;
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animationFillMode = 'both';
    });

    // Animate booking items
    const bookingCards = document.querySelectorAll('.booking-card');
    bookingCards.forEach((item, index) => {
        item.style.animation = `fadeInUp 0.6s ease-out`;
        item.style.animationDelay = `${index * 0.1}s`;
        item.style.animationFillMode = 'both';
    });

    // Animate asset items
    assetItems.forEach((item, index) => {
        item.style.animation = `fadeInUp 0.6s ease-out`;
        item.style.animationDelay = `${index * 0.1}s`;
        item.style.animationFillMode = 'both';
    });

    // Add hover effects to dashboard cards
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.1)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
}

// ==================== Setup Hover Effects ==================== 
function setupHoverEffects() {
    const interactiveElements = document.querySelectorAll('.booking-actions .btn, .btn-link');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-2px)';
        });
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
        });
    });
}

// ==================== Booking Persistence Helpers ====================
function getStoredBookings() {
    try {
        const stored = localStorage.getItem('rhBookings');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error reading persisted bookings:', e);
        return [];
    }
}

function createBookingCard(booking, index = 0) {
    const card = document.createElement('div');
    card.className = 'booking-card fade-in-up';
    card.style.animationDelay = `${index * 0.1}s`;
    card.innerHTML = `
        <div class="booking-header">
            <h3>${booking.assetName}</h3>
            <span class="badge status-${booking.status.toLowerCase().replace(/\s+/g, '-')}">${booking.status}</span>
        </div>
        <div class="booking-details">
            <p><strong>Dates:</strong> ${formatDateDisplay(booking.checkIn)} - ${formatDateDisplay(booking.checkOut)} (${booking.days} days)</p>
            <p><strong>Owner:</strong> ${booking.owner}</p>
            <p><strong>Total Cost:</strong> ${booking.total} (rental + fees)</p>
            <p><strong>Damage Deposit:</strong> ${booking.damageDeposit}${booking.status.toLowerCase() === 'confirmed' ? ' (held in escrow)' : ''}</p>
        </div>
        <div class="booking-actions">
            <button class="btn btn-secondary btn-small">Modify Dates</button>
            <button class="btn btn-danger btn-small">Cancel Booking</button>
        </div>
    `;
    return card;
}

function formatDateDisplay(rawDate) {
    try {
        const date = new Date(rawDate);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return rawDate;
    }
}

function renderPersistedBookings(currentUser, searchQuery = '') {
    if (!bookingsContainer) return;
    const persisted = getStoredBookings();
    const userBookings = currentUser && currentUser.role === 'user'
        ? persisted.filter(booking => booking.username === currentUser.username)
        : persisted;

    const query = (searchQuery || '').trim().toLowerCase();
    const filteredBookings = query
        ? userBookings.filter(booking => {
            const bookingText = [
                booking.assetName,
                booking.owner,
                booking.username,
                booking.status,
                booking.location,
                booking.checkIn,
                booking.checkOut,
                booking.total
            ].join(' ').toLowerCase();
            return bookingText.includes(query);
        })
        : userBookings;

    const activeBookings = filteredBookings.filter(booking => booking.status.toLowerCase() !== 'cancelled').length;
    const totalEarnings = filteredBookings.reduce((sum, booking) => {
        const value = Number(String(booking.total).replace(/[^0-9.-]+/g, '')) || 0;
        return sum + value;
    }, 0);
    const totalDeposits = filteredBookings.reduce((sum, booking) => {
        const value = Number(String(booking.damageDeposit).replace(/[^0-9.-]+/g, '')) || 0;
        return sum + value;
    }, 0);

    if (activeBookingsCount) {
        activeBookingsCount.textContent = activeBookings;
    }
    if (earningsThisMonth) {
        earningsThisMonth.textContent = formatCurrency(totalEarnings);
    }
    if (depositsHeld) {
        depositsHeld.textContent = formatCurrency(totalDeposits);
    }

    bookingsContainer.innerHTML = '';
    if (filteredBookings.length === 0) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'booking-card fade-in-up';
        emptyCard.innerHTML = `
            <div class="booking-header">
                <h3>No bookings match your search</h3>
                <span class="badge status-pending">No results</span>
            </div>
            <div class="booking-details">
                <p>Try a different asset name, renter, status, or date.</p>
            </div>
        `;
        bookingsContainer.appendChild(emptyCard);
    } else {
        filteredBookings.forEach((booking, index) => {
            const bookingCard = createBookingCard(booking, index + 2);
            bookingsContainer.appendChild(bookingCard);
        });
    }

    if (recentBookingsList) {
        recentBookingsList.innerHTML = '';
        const recent = filteredBookings.slice(-3).reverse();
        if (recent.length === 0) {
            recentBookingsList.innerHTML = `
                <div class="booking-item empty-state">
                    <div class="booking-info">
                        <h4>No recent bookings yet</h4>
                        <p>Complete a booking to see it appear here.</p>
                    </div>
                </div>
            `;
        } else {
            recent.forEach(booking => {
                const item = document.createElement('div');
                item.className = 'booking-item';
                item.innerHTML = `
                    <div class="booking-info">
                        <h4>${booking.assetName}</h4>
                        <p class="booking-date">${formatDateDisplay(booking.checkIn)} - ${formatDateDisplay(booking.checkOut)}</p>
                        <p class="booking-renter">Renter: ${booking.owner}</p>
                    </div>
                    <span class="badge status-${booking.status.toLowerCase().replace(/\s+/g, '-')}">${booking.status}</span>
                `;
                recentBookingsList.appendChild(item);
            });
        }
    }
}

function setupBookingActionListeners() {
    const bookingCards = document.querySelectorAll('.booking-card');
    bookingCards.forEach(item => {
        const modifyBtn = item.querySelector('.booking-actions .btn-secondary');
        const cancelBtn = item.querySelector('.booking-actions .btn-danger');

        if (modifyBtn) {
            modifyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showModifyBookingModal(item);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showCancelConfirmation(item);
            });
        }
    });
}

// ==================== Setup Charts (Mock) ==================== 
function setupCharts() {
    // Placeholder for chart setup
    // In a real application, you would use Chart.js or similar library
    console.log('Charts initialized');
}

// ==================== Simulate Live Updates ==================== 
function simulateLiveUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
        updateBookingStatus();
        updateActivityLog();
    }, 30000);
}

// ==================== Update Booking Status ==================== 
function updateBookingStatus() {
    // Mock function to update booking status
    console.log('Checking for booking status updates...');
}

// ==================== Update Activity Log ==================== 
function updateActivityLog() {
    // Mock function to update activity log
    console.log('Updating activity log...');
}

// ==================== Export Data Functions ==================== 
function exportBookingData() {
    const bookingData = [];
    bookingItems.forEach(item => {
        bookingData.push({
            asset: item.querySelector('h3').textContent,
            dates: item.querySelector('.booking-date').textContent,
            status: item.querySelector('.badge').textContent
        });
    });

    const dataStr = JSON.stringify(bookingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showNotification('Booking data exported successfully', 'success');
}

// ==================== Print Dashboard ==================== 
function printDashboard() {
    window.print();
}

// ==================== Keyboard Shortcuts ==================== 
document.addEventListener('keydown', (e) => {
    // Alt + B: Go to bookings
    if (e.altKey && e.key === 'b') {
        const bookingsLink = document.querySelector('a[href="#bookings"]');
        if (bookingsLink) {
            bookingsLink.click();
        }
    }

    // Alt + A: Go to assets
    if (e.altKey && e.key === 'a') {
        const assetsLink = document.querySelector('a[href="#assets"]');
        if (assetsLink) {
            assetsLink.click();
        }
    }

    // Alt + D: Go to deposits
    if (e.altKey && e.key === 'd') {
        const depositsLink = document.querySelector('a[href="#deposits"]');
        if (depositsLink) {
            depositsLink.click();
        }
    }
});

// ==================== Format Currency ==================== 
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

// ==================== Calculate Trust Score Color ==================== 
function getTrustScoreColor(score) {
    if (score >= 4.5) return '#10b981';
    if (score >= 3.5) return '#3b82f6';
    if (score >= 2.5) return '#f59e0b';
    return '#ef4444';
}

// ==================== Logout Function ==================== 
const logoutBtn = document.querySelector('button:has-text("Logout")') || 
                   document.evaluate(
                       "//button[contains(text(), 'Logout')]",
                       document,
                       null,
                       XPathResult.FIRST_ORDERED_NODE_TYPE,
                       null
                   ).singleNodeValue;

if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const confirmLogout = confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        }
    });
}

// ==================== Responsive Sidebar ==================== 
function setupResponsiveSidebar() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    
    if (window.innerWidth <= 768) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #6366f1;
            color: white;
            border: none;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            font-size: 1.2rem;
        `;

        toggleBtn.addEventListener('click', () => {
            sidebar.style.transform = sidebar.style.transform === 'translateX(-100%)' 
                ? 'translateX(0)' 
                : 'translateX(-100%)';
        });

        document.body.appendChild(toggleBtn);
    }
}

setupResponsiveSidebar();

console.log('%cDashboard Ready', 'color: #6366f1; font-weight: bold;');
