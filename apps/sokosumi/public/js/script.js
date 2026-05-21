/**
 * Main JavaScript
 *
 * This file contains custom JavaScript for the project.
 * Organized by feature/component for maintainability.
 */

'use strict';

/* ==========================================================================
   Constants & Configuration
   ========================================================================== */

const CONFIG = {
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1280
  },
  animation: {
    duration: 300,
    easing: 'ease'
  }
};

/* ==========================================================================
   Utility Functions
   ========================================================================== */

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 100) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 100) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if element is in viewport
 * @param {Element} element - DOM element to check
 * @returns {boolean} Whether element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/* ==========================================================================
   DOM Ready Handler
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initNavbarScroll();
  initSmoothScroll();
  initLazyLoading();

  console.log('Scripts initialized');
});

/* ==========================================================================
   Navbar Scroll Animation
   ========================================================================== */

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');

  if (!navbar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  const scrollThreshold = 10; // Minimum scroll amount to trigger hide/show

  function updateNavbar() {
    const currentScrollY = window.scrollY;

    // Don't hide navbar at the very top of the page
    if (currentScrollY < 50) {
      navbar.classList.remove('nav-hidden');
      navbar.classList.add('nav-visible');
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    // Check scroll direction
    if (currentScrollY > lastScrollY + scrollThreshold) {
      // Scrolling down - hide navbar
      navbar.classList.add('nav-hidden');
      navbar.classList.remove('nav-visible');
    } else if (currentScrollY < lastScrollY - scrollThreshold) {
      // Scrolling up - show navbar
      navbar.classList.remove('nav-hidden');
      navbar.classList.add('nav-visible');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });
}

/* ==========================================================================
   Navigation
   ========================================================================== */

function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-open');
    });
  }

  // Close menu on outside click
  document.addEventListener('click', function(event) {
    if (navMenu && navMenu.classList.contains('is-open')) {
      if (!event.target.closest('.nav-menu') && !event.target.closest('.nav-toggle')) {
        navMenu.classList.remove('is-open');
        if (navToggle) {
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });
}

/* ==========================================================================
   Smooth Scroll
   ========================================================================== */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');

      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* ==========================================================================
   Lazy Loading
   ========================================================================== */

function initLazyLoading() {
  // Native lazy loading is used via loading="lazy" attribute
  // This function can be extended for custom lazy loading behavior

  if ('IntersectionObserver' in window) {
    const lazyElements = document.querySelectorAll('[data-lazy]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          element.classList.add('is-visible');
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    lazyElements.forEach(element => observer.observe(element));
  }
}

/* ==========================================================================
   Exports (for module usage)
   ========================================================================== */

// Uncomment if using modules
// export { debounce, throttle, isInViewport, CONFIG };
