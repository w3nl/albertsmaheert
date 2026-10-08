/**
 * Static Performance Optimizations
 * Lazy-loads images and enforces security defaults for external links
 */

(function() {
  'use strict';

  // ========================================
  // Lazy Load Images
  // ========================================
  function optimizeImageLoading() {
    const images = document.querySelectorAll('img');

    images.forEach(function(img, index) {
      // Skip first few images (above fold)
      // Add lazy loading attribute if not set
      if (!img.getAttribute('loading') && index > 1) {
        img.setAttribute('loading', 'lazy');
      }

      // Enable async decoding for better performance
      if (!img.getAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  // ========================================
  // Secure External Links
  // ========================================
  function secureExternalLinks() {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');

    externalLinks.forEach(function(link) {
      const currentRel = link.getAttribute('rel') || '';

      // Add security attributes if missing
      if (currentRel.indexOf('noopener') === -1) {
        const secureRel = (currentRel + ' noopener noreferrer').trim();
        link.setAttribute('rel', secureRel);
      }
    });
  }

  // ========================================
  // Initialize on Page Load
  // ========================================
  optimizeImageLoading();
  secureExternalLinks();

})();
