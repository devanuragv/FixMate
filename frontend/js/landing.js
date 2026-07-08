/**
 * FixMate Landing Page — JavaScript
 * Premium Interactions & Animations
 */

console.log("🚀 FixMate Landing Page Loaded");

/* ==========================================
   PAGE LOAD
   ========================================== */
const loader = document.getElementById("loader");

window.addEventListener("load", () => {
  setTimeout(() => {
    loader.classList.add("hidden");
    document.body.style.overflow = "";
    triggerHeroReveal();
  }, 1400);
});

document.body.style.overflow = "hidden";

/* ==========================================
   STICKY NAVBAR
   ========================================== */
const navbar = document.getElementById("navbar");

function updateNavbar() {
  if (window.scrollY > 20) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();

/* ==========================================
   MOBILE MENU
   ========================================== */
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("mobile-open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen.toString());
});

// Close menu when clicking a link
navLinks.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("mobile-open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove("mobile-open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }
});

/* ==========================================
   SMOOTH SCROLL
   ========================================== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
    );
    const offset = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top: offset, behavior: "smooth" });
  });
});

/* ==========================================
   ACTIVE NAVIGATION LINK
   ========================================== */
const sections = document.querySelectorAll("section[id]");
const navLinkEls = document.querySelectorAll(".nav-link");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinkEls.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${id}`
          );
        });
      }
    });
  },
  {
    rootMargin: "-40% 0px -50% 0px",
    threshold: 0,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

/* ==========================================
   SCROLL REVEAL
   ========================================== */
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);

function triggerHeroReveal() {
  revealEls.forEach((el) => revealObserver.observe(el));
}

/* ==========================================
   COUNTER ANIMATION
   ========================================== */
const counters = document.querySelectorAll(".stat-value[data-target]");

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || "";
  const isDecimal = el.dataset.decimal === "true";
  const duration = 1800;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;

    if (isDecimal) {
      el.textContent = current.toFixed(1) + suffix;
    } else if (target >= 1000) {
      el.textContent = Math.floor(current / 1000) + suffix;
    } else {
      el.textContent = Math.floor(current) + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => counterObserver.observe(counter));

/* ==========================================
   RIPPLE EFFECT
   ========================================== */
document.querySelectorAll(".ripple").forEach((el) => {
  el.addEventListener("click", function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const ripple = document.createElement("span");
    ripple.className = "ripple-wave";
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
    `;

    this.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

/* ==========================================
   ANIMATED BACKGROUND BLOBS (MOUSE MOVEMENT)
   ========================================== */
const blobs = document.querySelectorAll(".blob");
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 40;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 40;
});

function animateBlobs() {
  currentX += (mouseX - currentX) * 0.04;
  currentY += (mouseY - currentY) * 0.04;

  blobs.forEach((blob, i) => {
    const factor = (i + 1) * 0.4;
    const dir = i % 2 === 0 ? 1 : -1;
    blob.style.transform = `translate(${currentX * factor * dir}px, ${currentY * factor}px)`;
  });

  requestAnimationFrame(animateBlobs);
}

animateBlobs();

/* ==========================================
   BACK TO TOP
   ========================================== */
const backToTopBtn = document.getElementById("backToTop");

window.addEventListener(
  "scroll",
  () => {
    backToTopBtn.classList.toggle("visible", window.scrollY > 400);
  },
  { passive: true }
);

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ==========================================
   NAVBAR BUTTONS (Login / Get Started)
   ========================================== */
document.querySelectorAll(".btn-ghost").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Placeholder login action
    alert("Login feature coming soon!");
  });
});

document.querySelectorAll(".nav-cta .btn-primary").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById("services");
    if (target) {
      const navH = navbar.offsetHeight;
      const offset = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  });
});

/* ==========================================
   SERVICE CARD HOVER TILT (subtle)
   ========================================== */
document.querySelectorAll(".service-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-x", `${y * 6}deg`);
    card.style.setProperty("--tilt-y", `${-x * 6}deg`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  });
});

/* ==========================================
   STAGGERED REVEAL FOR GRIDS
   ========================================== */
function applyStagger(selector, delay = 80) {
  const items = document.querySelectorAll(selector);
  items.forEach((item, i) => {
    item.style.transitionDelay = `${i * delay}ms`;
  });
}

applyStagger(".services-grid .service-card", 60);
applyStagger(".trusted-grid .trusted-card", 80);
applyStagger(".why-grid .why-card", 80);
applyStagger(".reviews-grid .review-card", 80);
applyStagger(".steps-grid .step-card", 100);