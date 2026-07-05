/**
 * Scroll Animations
 * Scroll-controlled reveal animations for all sections
 */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    // Check if GSAP and ScrollTrigger are loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded - scroll animations disabled');
      return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Skip elements in these containers
    function shouldSkip(el) {
      return el.closest('.navbar') ||
             el.closest('.w-nav') ||
             el.closest('header') ||
             el.closest('.footer') ||
             el.closest('.footer-wrappnew') ||
             el.dataset.animated === 'true';
    }

    // ========================================
    // Section-based scroll reveal
    // ========================================

    var sections = document.querySelectorAll('.wrapper-section, .section_full-width, .padding-section-large, .section-testimonials, .section-compliance, .section-faq');

    sections.forEach(function(section) {
      if (shouldSkip(section)) return;

      // Find animatable elements within this section
      var elements = section.querySelectorAll(
        '.heading-h1, .heading-h2, .heading-h3, .heading-hero, ' +
        '.eyebrow-text, .text-size-large, .text-size-medium, ' +
        '.button-group, .solution-pointers, .problem-pointers, ' +
        '.card-compliance, .bento-card, .feature-card, ' +
        '.sokosumi-agnets, .problem-content, ' +
        '.uui-layout06_image-wrapper, .video-showcase, ' +
        '.features-tab-wrapper, .faq-item, ' +
        '.agent-card-wrapper, .card-task'
      );

      if (elements.length === 0) return;

      // Set initial state
      elements.forEach(function(el) {
        if (shouldSkip(el)) return;
        el.dataset.animated = 'true';

        gsap.set(el, {
          opacity: 0,
          y: 30,
          visibility: 'visible'
        });
      });

      // Create scroll-controlled timeline for this section
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 20%',
          scrub: 0.8
        }
      });

      // Add elements to timeline with stagger
      elements.forEach(function(el, index) {
        if (shouldSkip(el) && el.dataset.animated !== 'true') return;

        tl.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out'
        }, index * 0.15);
      });
    });

    // ========================================
    // Logo grid - special scroll reveal
    // ========================================

    var logoGrid = document.querySelector('.grid-container-5x1.logos');
    if (logoGrid) {
      var logos = logoGrid.querySelectorAll('img');

      gsap.set(logos, {
        opacity: 0,
        scale: 0.85,
        visibility: 'visible'
      });

      var logoTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: logoGrid,
          start: 'top 90%',
          end: 'bottom 65%',
          scrub: 0.5
        }
      });

      logos.forEach(function(logo, index) {
        logo.dataset.animated = 'true';

        logoTimeline.to(logo, {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power2.out'
        }, index * 0.2);
      });
    }

    // ========================================
    // Grid items - staggered scroll reveal
    // ========================================

    var grids = document.querySelectorAll('.bento-grid, .compliance-cards-grid, .agents-listing-grid');

    grids.forEach(function(grid) {
      if (shouldSkip(grid)) return;

      var items = grid.children;
      if (items.length === 0) return;

      gsap.set(items, {
        opacity: 0,
        y: 40,
        visibility: 'visible'
      });

      var gridTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
          end: 'center 50%',
          scrub: 0.6
        }
      });

      Array.from(items).forEach(function(item, index) {
        item.dataset.animated = 'true';

        gridTimeline.to(item, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out'
        }, index * 0.2);
      });
    });

    // ========================================
    // Hero section - immediate animation on load
    // ========================================

    var heroSection = document.querySelector('.section-hero, .hero-section, .section-hero-home-2');
    if (heroSection) {
      var heroElements = heroSection.querySelectorAll(
        'h1, .heading-hero, .text-size-large, .hero-sub-text-home-2, ' +
        '.button-group, .search-form-wrapper, .hero-text-wrapper > *'
      );

      heroElements.forEach(function(el, index) {
        if (el.dataset.animated === 'true') return;
        el.dataset.animated = 'true';

        gsap.fromTo(el,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: 0.15 + (index * 0.1),
            ease: 'power2.out'
          }
        );
      });
    }

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();

    // Refresh on window resize (debounced)
    var resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        ScrollTrigger.refresh();
      }, 250);
    });
  });
})();
