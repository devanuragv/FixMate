/**
 * FixMate — 3D Playing Cards Deck & Instagram Dots Engine
 * Fast 1.3s Shape Technician + Card Stack Dealing & Pagination
 */

const TECHNICIAN_ROLES = [
  {
    id: "tool-painter",
    bgText: "PAINTER",
    number: "01 / 08",
    title: "Wall Painting Specialist",
    desc: "Precision wall roll painting, waterproof damp treatment, and clean border tape masking.",
    price: "From ₹199",
    time: "⏱ 45 mins",
    rating: "★ 4.9 (1.2k)"
  },
  {
    id: "tool-carpenter",
    bgText: "CARPENTER",
    number: "02 / 08",
    title: "Precision Carpenter",
    desc: "Door lock fixing, cabinet hinges, wardrobe latch adjustment, and custom woodcraft.",
    price: "From ₹149",
    time: "⏱ 35 mins",
    rating: "★ 4.8 (950)"
  },
  {
    id: "tool-electrician",
    bgText: "ELECTRICIAN",
    number: "03 / 08",
    title: "Certified Electrician",
    desc: "Switchboard repairs, tripping MCB circuits, ceiling fan mounting, and wiring checks.",
    price: "From ₹79",
    time: "⏱ 25 mins",
    rating: "★ 4.9 (3.4k)"
  },
  {
    id: "tool-plumber",
    bgText: "PLUMBER",
    number: "04 / 08",
    title: "Licensed Plumber",
    desc: "Tap & pipe leakage fixing, unclogging drain pipes, and bathroom fixture installation.",
    price: "From ₹99",
    time: "⏱ 30 mins",
    rating: "★ 4.8 (2.1k)"
  },
  {
    id: "tool-ac",
    bgText: "AC REPAIR",
    number: "05 / 08",
    title: "AC Foam Jet Mechanic",
    desc: "High-pressure jet servicing, gas leakage detection, and summer cooling tune-up.",
    price: "From ₹399",
    time: "⏱ 45 mins",
    rating: "★ 4.9 (4.2k)"
  },
  {
    id: "tool-cleaner",
    bgText: "CLEANER",
    number: "06 / 08",
    title: "Deep Sanitization Pro",
    desc: "Intensive bathroom scrubbing, kitchen tile degreasing, and sofa shampooing.",
    price: "From ₹299",
    time: "⏱ 60 mins",
    rating: "★ 4.8 (1.8k)"
  },
  {
    id: "tool-appliance",
    bgText: "APPLIANCE",
    number: "07 / 08",
    title: "Appliance Engineer",
    desc: "Washing machine spinning issues, refrigerator defrost fixes, and microwave repair.",
    price: "From ₹199",
    time: "⏱ 40 mins",
    rating: "★ 4.8 (880)"
  },
  {
    id: "tool-pest",
    bgText: "PEST PRO",
    number: "08 / 08",
    title: "Pest Exterminator",
    desc: "Odorless cockroach gel baiting, anti-termite wood treatment, and bedbug clearing.",
    price: "From ₹499",
    time: "⏱ 50 mins",
    rating: "★ 4.9 (1.1k)"
  }
];

let currentHeroIndex = 0;
let heroCycleTimer = null;
const CYCLE_SPEED_MS = 1300; // 1.3 Seconds Fast Cycle

// Playing Card Deck State
let activeCardIndex = 0;
const totalCards = 8;
let currentAuthRole = 'customer';

document.addEventListener('DOMContentLoaded', () => {
  startHeroCycle();
  initPlayingCardsDeck();
});

/* ==========================================================================
   1. HERO TECHNICIAN MOTION & GIANT TEXT CYCLE
   ========================================================================== */
function startHeroCycle() {
  renderHeroRole(currentHeroIndex);
  
  heroCycleTimer = setInterval(() => {
    currentHeroIndex = (currentHeroIndex + 1) % TECHNICIAN_ROLES.length;
    renderHeroRole(currentHeroIndex);
  }, CYCLE_SPEED_MS);
}

function renderHeroRole(index) {
  const role = TECHNICIAN_ROLES[index];

  // Animate Giant Watermark Text
  const giantTextEl = document.getElementById('giantBgText');
  if (giantTextEl) {
    giantTextEl.classList.add('text-animating');
    setTimeout(() => {
      giantTextEl.textContent = role.bgText;
      giantTextEl.classList.remove('text-animating');
    }, 140);
  }

  // Display Active Tool
  document.querySelectorAll('.tool-group').forEach(el => el.style.display = 'none');
  const activeTool = document.getElementById(role.id);
  if (activeTool) activeTool.style.display = 'block';

  // Update Companion Overview
  document.getElementById('roleNumber').textContent = role.number;
  document.getElementById('roleTitle').textContent = role.title;
  document.getElementById('roleDesc').textContent = role.desc;
  document.getElementById('rolePrice').textContent = role.price;
  document.getElementById('roleTime').textContent = role.time;
  document.getElementById('roleRating').textContent = role.rating;
}

window.scrollToDeck = function() {
  document.getElementById('servicesDeck').scrollIntoView({ behavior: 'smooth' });
};

/* ==========================================================================
   2. 3D PLAYING CARDS DECK & INSTAGRAM POST DOTS
   ========================================================================== */
function initPlayingCardsDeck() {
  updateDeckPositions();
}

window.nextCard = function(e) {
  if (e) e.stopPropagation();
  const cards = document.querySelectorAll('.deck-card');
  const total = cards.length || 8;
  activeCardIndex = (activeCardIndex + 1) % total;
  updateDeckPositions();
};

window.prevCard = function(e) {
  if (e) e.stopPropagation();
  const cards = document.querySelectorAll('.deck-card');
  const total = cards.length || 8;
  activeCardIndex = (activeCardIndex - 1 + total) % total;
  updateDeckPositions();
};

window.jumpToCard = function(targetIndex) {
  activeCardIndex = targetIndex;
  updateDeckPositions();
};

function updateDeckPositions() {
  const cards = document.querySelectorAll('.deck-card');
  if (!cards.length) return;

  const total = cards.length;

  cards.forEach((card, i) => {
    // Clean all classes so no card gets stuck invisible
    card.classList.remove('active', 'next-1', 'next-2', 'hidden', 'prev-flyout');

    if (i === activeCardIndex) {
      card.classList.add('active');
    } else if (i === (activeCardIndex + 1) % total) {
      card.classList.add('next-1');
    } else if (i === (activeCardIndex + 2) % total) {
      card.classList.add('next-2');
    } else {
      card.classList.add('hidden');
    }
  });

  // Update Instagram Dots
  const dots = document.querySelectorAll('.insta-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === activeCardIndex);
  });
}

/* ==========================================================================
   3. FEATURE SHOWCASE MODAL (NO PERSONAL ADDRESS FORM)
   ========================================================================== */
window.showFeaturePreview = function(featureName) {
  document.getElementById('featureTitle').textContent = featureName;
  document.getElementById('featureModal').classList.add('active');
};

window.closeFeatureModal = function() {
  document.getElementById('featureModal').classList.remove('active');
};

/* ==========================================================================
   4. MULTI-ROLE AUTH MODAL
   ========================================================================== */
window.openLoginModal = function(role = 'customer') {
  document.getElementById('authModal').classList.add('active');
  switchAuthRole(role);
};

window.closeLoginModal = function() {
  document.getElementById('authModal').classList.remove('active');
};

window.switchAuthRole = function(role) {
  currentAuthRole = role;

  document.getElementById('btnCustomer').classList.toggle('active', role === 'customer');
  document.getElementById('btnTechnician').classList.toggle('active', role === 'technician');
  document.getElementById('btnAdmin').classList.toggle('active', role === 'admin');

  const title = document.getElementById('authModalTitle');
  const sub = document.getElementById('authModalSubtitle');
  const label = document.getElementById('authIdLabel');
  const adminRow = document.getElementById('adminCodeRow');

  if (role === 'customer') {
    title.textContent = "Customer Sign In";
    sub.textContent = "Book & track services";
    label.textContent = "Mobile or Email";
    adminRow.style.display = 'none';
  } else if (role === 'technician') {
    title.textContent = "Technician Portal";
    sub.textContent = "Assigned jobs & daily payouts";
    label.textContent = "Technician ID / Mobile";
    adminRow.style.display = 'none';
  } else if (role === 'admin') {
    title.textContent = "FixMate Admin";
    sub.textContent = "Platform controls & oversight";
    label.textContent = "Admin ID";
    adminRow.style.display = 'block';
  }
};

window.submitAuth = function(e) {
  e.preventDefault();
  closeLoginModal();

  if (currentAuthRole === 'technician') {
    showToast("Redirecting to Technician Dashboard...");
    setTimeout(() => {
      window.location.href = "http://localhost:5000/technician-dashboard.html";
    }, 600);
  } else if (currentAuthRole === 'admin') {
    showToast("Redirecting to Admin Console...");
    setTimeout(() => {
      window.location.href = "http://localhost:5000/admin-dashboard.html";
    }, 600);
  } else {
    showToast("Signed into Customer Account successfully!");
  }
};

/* ==========================================================================
   5. TOAST NOTIFICATION
   ========================================================================== */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2200);
}
