// ==================== Booking Page JavaScript ==================== 

const checkInDate = document.getElementById('check-in-date');
const checkOutDate = document.getElementById('check-out-date');
const bookingForm = document.querySelector('.booking-form');

const durationDisplay = document.getElementById('duration');
const summaryDays = document.getElementById('summary-days');
const subtotal = document.getElementById('subtotal');
const serviceFee = document.getElementById('service-fee');
const taxes = document.getElementById('taxes');
const total = document.getElementById('total');

const DAILY_RATE = 95;
const DAMAGE_DEPOSIT = 500;
const SERVICE_FEE_PERCENT = 0.10;
const TAX_RATE = 0.08;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = window.requireAuth ? window.requireAuth() : null;
    if (!currentUser) return;

    console.log('Booking Page Loaded');
    setupBookingEventListeners();
    setMinimumDate();
    addProgressIndicators();
});

// ==================== Setup Event Listeners ==================== 
function setupBookingEventListeners() {
    if (checkInDate) {
        checkInDate.addEventListener('change', updateBookingDetails);
    }
    if (checkOutDate) {
        checkOutDate.addEventListener('change', updateBookingDetails);
    }
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // Form input focus effects
    const formInputs = document.querySelectorAll('.booking-form input');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.borderColor = '#6366f1';
            input.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#e5e7eb';
            input.style.boxShadow = 'none';
        });
    });
}

// ==================== Set Minimum Date ==================== 
function setMinimumDate() {
    const today = new Date().toISOString().split('T')[0];
    if (checkInDate) {
        checkInDate.setAttribute('min', today);
    }
}

// ==================== Update Booking Details ==================== 
function updateBookingDetails() {
    if (!checkInDate.value || !checkOutDate.value) return;

    const checkIn = new Date(checkInDate.value);
    const checkOut = new Date(checkOutDate.value);

    // Validate dates
    if (checkOut <= checkIn) {
        alert('Check-out date must be after check-in date');
        checkOutDate.value = '';
        return;
    }

    // Calculate duration
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Update display
    if (durationDisplay) {
        durationDisplay.textContent = diffDays;
    }
    if (summaryDays) {
        summaryDays.textContent = diffDays;
    }

    // Calculate prices
    const rentalSubtotal = DAILY_RATE * diffDays;
    const fee = rentalSubtotal * SERVICE_FEE_PERCENT;
    const taxAmount = (rentalSubtotal + fee) * TAX_RATE;
    const totalDue = rentalSubtotal + fee + taxAmount + DAMAGE_DEPOSIT;

    // Update price breakdown
    if (subtotal) {
        subtotal.textContent = formatCurrency(rentalSubtotal);
    }
    if (serviceFee) {
        serviceFee.textContent = formatCurrency(fee);
    }
    if (taxes) {
        taxes.textContent = formatCurrency(taxAmount);
    }
    if (total) {
        total.textContent = formatCurrency(totalDue);
    }

    // Add animation
    animatePriceUpdate();
}

// ==================== Animate Price Update ==================== 
function animatePriceUpdate() {
    const priceElements = [subtotal, serviceFee, taxes, total];
    priceElements.forEach(el => {
        if (el) {
            el.style.animation = 'pulse 0.5s ease-out';
            setTimeout(() => {
                el.style.animation = 'none';
            }, 500);
        }
    });
}

// ==================== Handle Booking Submit ==================== 
function handleBookingSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateBookingForm()) {
        return;
    }

    // Show loading state
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    submitBtn.style.opacity = '0.6';

    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';

        const booking = buildBookingFromForm();
        showPaymentModal(booking);
    }, 1500);
}
// ==================== Show Payment Modal ====================
function showPaymentModal(booking) {
    const paymentModal = document.createElement('div');
    paymentModal.className = 'payment-modal';
    paymentModal.innerHTML = `
        <div class="payment-content">
            <span class="close-payment">&times;</span>
            <h2>Scan QR to Pay</h2>
            <img src="../image/ABA1.jpg" alt="ABA1" class="payment-qr">
            <h3>Total Amount: <span id="paymentAmount">${booking.total}</span></h3>
            <p>Scan this QR code using your bank mobile app to complete payment.</p>
            <button id="confirmPayment" class="btn btn-primary btn-large">I Have Paid</button>
        </div>
    `;

    paymentModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.65);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        padding: 1rem;
    `;

    const paymentContent = paymentModal.querySelector('.payment-content');
    paymentContent.style.cssText = `
        background: #fff;
        border-radius: 1rem;
        padding: 2rem;
        width: min(520px, 100%);
        text-align: center;
        position: relative;
        box-shadow: 0 25px 60px rgba(0,0,0,0.15);
    `;

    const closePayment = paymentModal.querySelector('.close-payment');
    closePayment.style.cssText = `
        position: absolute;
        top: 1rem;
        right: 1rem;
        cursor: pointer;
        font-size: 1.5rem;
        color: #6b7280;
    `;

    const paymentQr = paymentModal.querySelector('.payment-qr');
    paymentQr.style.cssText = `
        width: 220px;
        max-width: 100%;
        border-radius: 1rem;
        margin: 1rem auto;
        display: block;
    `;

    const paymentButton = paymentModal.querySelector('#confirmPayment');
    paymentButton.style.cssText = `
        margin-top: 1.5rem;
        width: 100%;
    `;

    document.body.appendChild(paymentModal);

    closePayment.addEventListener('click', () => paymentModal.remove());
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.remove();
        }
    });

    paymentButton.addEventListener('click', () => {
        completeBookingPayment(booking);
        paymentModal.remove();
    });
}

function completeBookingPayment(booking) {
    saveBookingToLocalStorage(booking);
    clearBookingDraft();
    showNotification('Payment sent to bank. Booking confirmed.', 'success');
    showBookingSuccess(booking);
}

// ==================== Validate Booking Form ==================== 
function validateBookingForm() {
    const renterName = document.getElementById('renter-name').value.trim();
    const renterEmail = document.getElementById('renter-email').value.trim();
    const renterPhone = document.getElementById('renter-phone').value.trim();
    const renterLicense = document.getElementById('renter-license').value.trim();
    const checkInValue = checkInDate.value;
    const checkOutValue = checkOutDate.value;
    const checkboxes = document.querySelectorAll('.terms-check input[type="checkbox"]');

    // Validate required fields
    if (!renterName || !renterEmail || !renterPhone || !renterLicense) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }

    if (!checkInValue || !checkOutValue) {
        showNotification('Please select check-in and check-out dates', 'error');
        return false;
    }

    const checkIn = new Date(checkInValue);
    const checkOut = new Date(checkOutValue);
    if (checkOut <= checkIn) {
        showNotification('Please select a valid check-out date after check-in', 'error');
        return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(renterEmail)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }

    // Validate phone format
    const phoneRegex = /^[\d\s\-()]+$/;
    if (!phoneRegex.test(renterPhone) || renterPhone.length < 10) {
        showNotification('Please enter a valid phone number', 'error');
        return false;
    }

    // Validate all checkboxes are checked
    let allChecked = true;
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            allChecked = false;
        }
    });

    if (!allChecked) {
        showNotification('Please agree to all terms and conditions', 'error');
        return false;
    }

    return true;
}

// ==================== Show Booking Success ==================== 
function showBookingSuccess(booking) {
    const successModal = document.createElement('div');
    successModal.className = 'success-modal';
    successModal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Booking Confirmed!</h2>
            <p>Your rental booking has been successfully confirmed.</p>
            <div class="booking-confirmation">
                <div class="confirm-item">
                    <strong>Confirmation Number:</strong>
                    <span>${booking.confirmationNumber}</span>
                </div>
                <div class="confirm-item">
                    <strong>Check-In:</strong>
                    <span>${booking.checkIn}</span>
                </div>
                <div class="confirm-item">
                    <strong>Check-Out:</strong>
                    <span>${booking.checkOut}</span>
                </div>
                <div class="confirm-item">
                    <strong>Total Amount:</strong>
                    <span>${booking.total}</span>
                </div>
            </div>
            <p class="confirmation-text">A confirmation email has been sent to your email address.</p>
            <button class="btn btn-primary btn-large" id="view-bookings-button">
                View My Bookings
            </button>
        </div>
    `;

    successModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        animation: backdropFadeIn 0.3s ease-out;
    `;

    const modalContent = successModal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        animation: modalFadeIn 0.3s ease-out;
    `;

    const successIcon = successModal.querySelector('.success-icon');
    successIcon.style.cssText = `
        font-size: 4rem;
        color: #10b981;
        margin-bottom: 1rem;
        animation: tada 0.8s ease-out;
    `;

    const bookingConfirmation = successModal.querySelector('.booking-confirmation');
    bookingConfirmation.style.cssText = `
        background: #f9fafb;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin: 1.5rem 0;
        text-align: left;
    `;

    const confirmItems = successModal.querySelectorAll('.confirm-item');
    confirmItems.forEach((item, index) => {
        item.style.cssText = `
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.8rem;
            animation: slideInLeft 0.5s ease-out;
            animation-delay: ${index * 0.1}s;
            animation-fill-mode: both;
        `;
    });

    document.body.appendChild(successModal);

    const bookingsButton = successModal.querySelector('#view-bookings-button');
    if (bookingsButton) {
        bookingsButton.addEventListener('click', () => {
            window.location.href = 'profile.html#booking';
        });
    }

    // Close modal on backdrop click
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.remove();
        }
    });
}


// ==================== Booking Persistence Helpers ====================
function getStoredBookings() {
    try {
        const item = localStorage.getItem('rhBookings');
        return item ? JSON.parse(item) : [];
    } catch (e) {
        console.error('Error reading booking storage:', e);
        return [];
    }
}

function saveBookingToLocalStorage(booking) {
    try {
        const bookings = getStoredBookings();
        bookings.push(booking);
        localStorage.setItem('rhBookings', JSON.stringify(bookings));
    } catch (e) {
        console.error('Error saving booking to storage:', e);
    }
}

function clearBookingDraft() {
    localStorage.removeItem('bookingFormData');
}

function buildBookingFromForm() {
    const assetName = document.querySelector('.booking-asset h2')?.textContent || 'Selected Asset';
    const ownerName = document.querySelector('.asset-owner h4')?.textContent || 'Owner';
    const checkIn = new Date(checkInDate.value);
    const checkOut = new Date(checkOutDate.value);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const rentalSubtotal = DAILY_RATE * diffDays;
    const fee = rentalSubtotal * SERVICE_FEE_PERCENT;
    const taxAmount = (rentalSubtotal + fee) * TAX_RATE;
    const totalDue = rentalSubtotal + fee + taxAmount ;

    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    return {
        confirmationNumber: `RH${Date.now()}`,
        assetName,
        owner: ownerName,
        username: currentUser?.username || 'guest',
        location: document.querySelector('.asset-location')?.textContent || '',
        checkIn: checkInDate.value,
        checkOut: checkOutDate.value,
        days: diffDays,
        subtotal: formatCurrency(rentalSubtotal),
        serviceFee: formatCurrency(fee),
        taxes: formatCurrency(taxAmount),
        total: formatCurrency(totalDue),
        status: 'Confirmed'
    };
}

// ==================== Format Currency ==================== 
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}
function showpaymentModal(booking) {

    document.body.appendChild(paymentModal);

    closePayment.addEventListener('click', () => paymentModal.remove());

    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.remove();
        }
    });

    // 👇 ដាក់កូដថ្មីនៅទីនេះ
    paymentButton.addEventListener('click', () => {

        window.location.href = 'abamobile://';

        setTimeout(() => {

            const paid = confirm(
                'Have you completed payment in ABA Bank?'
            );

            if (paid) {

                completeBookingPayment(booking);

                paymentModal.remove();

            }

        }, 3000);

    });
}


// ==================== Notification ==================== 
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    const iconName = type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle';
    notification.innerHTML = `
        <i class="fas fa-${iconName}"></i>
        <span>${message}</span>
    `;

    const backgroundColor = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6';
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: ${backgroundColor};
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
    }, 4000);
}

// ==================== Add Progress Indicators ==================== 
function addProgressIndicators() {
    const progressSteps = document.querySelectorAll('.progress-step');
    const sections = [
        'dates',
        'details',
        'payment',
        'confirm'
    ];

    // Mark first step as active
    if (progressSteps.length > 0) {
        progressSteps[0].classList.add('active');
    }

    // Add smooth transitions
    const forms = document.querySelectorAll('.form-section');
    forms.forEach((form, index) => {
        form.style.animation = `fadeInUp 0.5s ease-out`;
        form.style.animationDelay = `${index * 0.1}s`;
        form.style.animationFillMode = 'both';
    });
}

// ==================== Keyboard Navigation ==================== 
document.addEventListener('keydown', (e) => {
    // Tab between form fields with smooth focus
    if (e.key === 'Tab') {
        const focusedElement = document.activeElement;
        if (focusedElement) {
            focusedElement.style.transition = 'all 0.3s ease';
        }
    }

    // Enter to submit form
    if (e.key === 'Enter' && e.ctrlKey) {
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.click();
        }
    }
});

// ==================== Auto-save Form Data ==================== 
function setupAutoSave() {
    const formInputs = document.querySelectorAll('.booking-form input');
    
    formInputs.forEach(input => {
        input.addEventListener('change', () => {
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData);
            localStorage.setItem('bookingFormData', JSON.stringify(data));
        });
    });

    // Load saved data on page load
    const savedData = localStorage.getItem('bookingFormData');
    if (savedData) {
        const data = JSON.parse(savedData);
        formInputs.forEach(input => {
            if (data[input.name]) {
                input.value = data[input.name];
            }
        });
    }
}

// Initialize auto-save
setupAutoSave();

// ==================== Tooltips ==================== 
function setupTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    
    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = trigger.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #1f2937;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                font-size: 0.85rem;
                white-space: nowrap;
                z-index: 1000;
                animation: slideInUp 0.3s ease-out;
                pointer-events: none;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = trigger.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            
            trigger.addEventListener('mouseleave', () => {
                tooltip.remove();
            });
        });
    });
}

// Initialize tooltips
setupTooltips();

console.log('%cBooking Page Ready', 'color: #6366f1; font-weight: bold;');
