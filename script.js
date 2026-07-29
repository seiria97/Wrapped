/* ==========================================================================
   WRAPPED — GLOBAL SCRIPT
   Shared behaviour for every page. Extracted directly from index.html's
   inline script, generalized slightly so it's safe to include on pages
   that don't have every element (each block guards for its own element).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initFooterYear();
  initNavbarScrollState();
  initMobileMenu();
  initScrollReveal();
});

/* ---------- Footer copyright year ---------- */
function initFooterYear() {
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ---------- Navbar: adds a blurred background once the page scrolls ---------- */
function initNavbarScrollState() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;

  function updateNavbarState() {
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  }

  window.addEventListener('scroll', updateNavbarState);
  updateNavbarState();
}

/* ---------- Mobile menu toggle ---------- */
function initMobileMenu() {
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', function () {
    mobileMenu.classList.toggle('open');
  });
}

/* ---------- Scroll-reveal: fades/rises .reveal elements into view ---------- */
function initScrollReveal() {
  var revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(function (el) { observer.observe(el); });
}
