/**
 * FixMate — Interactive Home Services Engine
 * Handles Real-Time Search, Live Category Filtering, Role-Based Authentication Modals, & Interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSearchAndFilter();
  initDropdowns();
  initModals();
  initBackToTop();
});

/* ==========================================================================
   1. NAVBAR & MOBILE DRAWER
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const drawer = document.getElementById('mobileDrawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const backdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  // Sticky Navbar Scroll Elevation
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Open Drawer
  hamburgerBtn.addEventListener('click', () => {
    drawer.classList.add('open');
    backdrop.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  });

  // Close Drawer
  const closeDrawer = () => {
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  };

  drawerCloseBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));
}

/* ==========================================================================
   2. SEARCH & DYNAMIC CATEGORY FILTER
   ========================================================================== */
let activeCategory = 'all';

function initSearchAndFilter() {
  const searchInput = document.getElementById('serviceSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  const searchTriggerBtn = document.getElementById('searchTriggerBtn');
  const tagPills = document.querySelectorAll('.tag-pill');
  const resetBtn = document.getElementById('resetSearchBtn');

  // Real-Time Search Input
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearBtn.style.display = query.length > 0 ? 'block' : 'none';
    executeFilter();
  });

  // Clear Search
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    executeFilter();
    searchInput.focus();
  });

  // Search Button Click -> Scroll down to services
  searchTriggerBtn.addEventListener('click', () => {
    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
  });

  // Category Tag Pills Click
  tagPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tagPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category');
      executeFilter();
    });
  });

  // Reset Button when 0 results found
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      filterByCategory('all');
    });
  }
}

// Global category trigger (usable from footer or banners)
window.filterByCategory = function(category) {
  activeCategory = category;
  const tagPills = document.querySelectorAll('.tag-pill');
  tagPills.forEach(p => {
    if (p.getAttribute('data-category') === category) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
  executeFilter();
};

function executeFilter() {
  const searchInput = document.getElementById('serviceSearchInput');
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const serviceCards = document.querySelectorAll('.service-card');
  const resultsCount = document.getElementById('resultsCount');
  const noResultsBox = document.getElementById('noResultsBox');

  let visibleCount = 0;

  serviceCards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    const cardKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();
    const cardTitle = (card.querySelector('.service-card-title')?.textContent || '').toLowerCase();
    const cardDesc = (card.querySelector('.service-card-desc')?.textContent || '').toLowerCase();

    // Category matching
    const matchesCategory = (activeCategory === 'all' || cardCategory === activeCategory);

    // Search query matching (matches title, keywords, or description)
    const matchesQuery = !query || 
      cardTitle.includes(query) || 
      cardKeywords.includes(query) || 
      cardDesc.includes(query);

    if (matchesCategory && matchesQuery) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Update Results Counter & Empty State
  if (resultsCount) {
    resultsCount.textContent = `Showing ${visibleCount} service${visibleCount === 1 ? '' : 's'}`;
  }

  if (noResultsBox) {
    noResultsBox.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}

/* ==========================================================================
   3. ROLE DROPDOWN (NAVBAR)
   ========================================================================== */
function initDropdowns() {
  const dropdownBtn = document.getElementById('loginDropdownBtn');
  const dropdownWrapper = dropdownBtn.closest('.dropdown-wrapper');

  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdownWrapper.classList.contains('open');
    dropdownWrapper.classList.toggle('open', !isOpen);
    dropdownBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownWrapper.contains(e.target)) {
      dropdownWrapper.classList.remove('open');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================================
   4. ROLE-BASED AUTH MODAL (CUSTOMER / TECHNICIAN / ADMIN)
   ========================================================================== */
let currentRole = 'customer';

function initModals() {
  const authModal = document.getElementById('authModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  modalCloseBtn.addEventListener('click', () => {
    authModal.classList.remove('active');
  });

  // Close on backdrop click
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.classList.remove('active');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      authModal.classList.remove('active');
      closeBookingModal();
    }
  });
}

// Open modal with specific role pre-selected
window.openLoginModal = function(role = 'customer') {
  const authModal = document.getElementById('authModal');
  authModal.classList.add('active');
  
  // Close the nav dropdown if open
  const dropdownWrapper = document.querySelector('.dropdown-wrapper');
  if (dropdownWrapper) dropdownWrapper.classList.remove('open');

  switchModalRole(role);
};

// Switch between Customer / Technician / Admin tabs
window.switchModalRole = function(role) {
  currentRole = role;

  // Tabs UI
  document.getElementById('tabCustomer').classList.toggle('active', role === 'customer');
  document.getElementById('tabTechnician').classList.toggle('active', role === 'technician');
  document.getElementById('tabAdmin').classList.toggle('active', role === 'admin');

  // Elements to update
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const noticeBanner = document.getElementById('roleNotice');
  const noticeText = document.getElementById('roleNoticeText');
  const authIdLabel = document.getElementById('authIdLabel');
  const authIdInput = document.getElementById('authIdentifier');
  const adminSecretGroup = document.getElementById('adminSecretGroup');
  const submitBtn = document.getElementById('modalSubmitBtn');
  const footerNote = document.getElementById('modalFooterNote');

  if (role === 'customer') {
    modalTitle.textContent = "Customer Sign In";
    modalSubtitle.textContent = "Book home services and manage appointments";
    noticeBanner.style.display = 'flex';
    noticeBanner.className = 'role-notice-banner bg-blue-subtle text-primary';
    noticeText.textContent = "Sign in to view your bookings and track assigned technicians.";
    authIdLabel.textContent = "Email Address or Mobile Number";
    authIdInput.placeholder = "name@example.com or 10-digit number";
    adminSecretGroup.style.display = 'none';
    submitBtn.className = "btn btn-primary btn-block btn-lg";
    submitBtn.innerHTML = `<span>Sign In as Customer</span> <i class="fas fa-arrow-right"></i>`;
    footerNote.innerHTML = `<span>Don't have an account?</span> <a href="javascript:void(0)" onclick="showToast('Customer registration page is ready for backend hookup!')" class="text-primary font-semibold">Register as Customer</a>`;
  } 
  else if (role === 'technician') {
    modalTitle.textContent = "Technician Portal";
    modalSubtitle.textContent = "Manage daily jobs, track routes & earnings";
    noticeBanner.style.display = 'flex';
    noticeBanner.className = 'role-notice-banner bg-green-subtle text-success';
    noticeText.textContent = "Access assigned customer bookings and daily payout reports.";
    authIdLabel.textContent = "Technician ID or Registered Email";
    authIdInput.placeholder = "tech@fixmate.com or TECH-8821";
    adminSecretGroup.style.display = 'none';
    submitBtn.className = "btn btn-primary btn-block btn-lg";
    submitBtn.innerHTML = `<span>Login to Partner Console</span> <i class="fas fa-arrow-right"></i>`;
    footerNote.innerHTML = `<span>Want to join FixMate?</span> <a href="javascript:void(0)" onclick="showToast('Technician onboarding form opened!')" class="text-primary font-semibold">Apply as Partner</a>`;
  } 
  else if (role === 'admin') {
    modalTitle.textContent = "FixMate Admin Console";
    modalSubtitle.textContent = "System oversight, verification & user management";
    noticeBanner.style.display = 'flex';
    noticeBanner.className = 'role-notice-banner bg-purple-subtle text-purple';
    noticeText.textContent = "Authorized platform operators and administrators only.";
    authIdLabel.textContent = "Admin Official Username";
    authIdInput.placeholder = "admin@fixmate.internal";
    adminSecretGroup.style.display = 'block';
    submitBtn.className = "btn btn-primary btn-block btn-lg";
    submitBtn.innerHTML = `<span>Authenticate Admin</span> <i class="fas fa-shield-halved"></i>`;
    footerNote.innerHTML = `<span class="text-muted"><i class="fas fa-lock"></i> Secured with 2FA & Activity Logging</span>`;
  }
};

// Password Visibility Toggle
window.togglePasswordVisibility = function(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById('pwEyeIcon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
};

// Handle Authentication Submit Demo
window.handleAuthSubmit = function(e) {
  e.preventDefault();
  const idValue = document.getElementById('authIdentifier').value;
  
  // Simulated authentication flow
  showToast(`Signing in as ${currentRole.toUpperCase()} (${idValue})...`, 'success');
  
  setTimeout(() => {
    document.getElementById('authModal').classList.remove('active');
    showToast(`Welcome back! Logged into ${currentRole} dashboard.`, 'success');
  }, 1000);
};

/* ==========================================================================
   5. INSTANT BOOKING MODAL
   ========================================================================== */
window.openBookingModal = function(serviceTitle, price) {
  document.getElementById('bookingServiceTitle').textContent = `Book ${serviceTitle}`;
  document.getElementById('bookingServicePrice').textContent = price;
  document.getElementById('bookingModal').classList.add('active');
};

window.closeBookingModal = function() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('active');
};

window.handleBookingSubmit = function(e) {
  e.preventDefault();
  closeBookingModal();
  showToast("Booking submitted successfully! A verified technician is being assigned.", "success");
};

/* ==========================================================================
   6. TOAST NOTIFICATIONS
   ========================================================================== */
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle text-success' : 'fa-info-circle text-primary';
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

/* ==========================================================================
   7. BACK TO TOP
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}