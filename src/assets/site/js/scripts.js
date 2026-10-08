/**
 * Albertsmaheert Theme - Main Interactions
 * Handles menus, accordions, tabs, maps, and other UI interactions
 */

(function($) {
  'use strict';

  // ========================================
  // Initialize UI Components on DOM Ready
  // ========================================
  $(document).ready(function() {
    initializeNavMenus();
    initializeAccordions();
    initializeToggles();
    initializeTabs();
    initializeLightbox();
    initializeSearch();
    initializeMobileMenu();
    initializeHeaderMap();
  });

  // ========================================
  // Navigation Menus
  // ========================================
  function initializeNavMenus() {
    const menuConfig = {
      delay: 600,
      animation: { opacity: 'show', height: 'show' },
      speed: 'fast',
      autoArrows: true,
      dropShadows: false
    };

    // Main navigation menu
    $('#navigation').superfish(menuConfig);

    // Language selection menu
    $('#language-selection').superfish(menuConfig);
  }

  // ========================================
  // Accordions
  // ========================================
  function initializeAccordions() {
    $('.accordion').accordion({
      heightStyle: 'content'
    });
  }

  // ========================================
  // Toggle Content Sections
  // ========================================
  function initializeToggles() {
    const $toggleInner = $('.toggle > .inner');
    $toggleInner.hide();

    $('.toggle .title').on('click', function() {
      const $toggle = $(this).closest('.toggle');
      const $inner = $toggle.find('.inner');
      const isActive = $(this).toggleClass('active').hasClass('active');

      if (isActive) {
        $inner.slideDown(200, 'easeOutCirc');
      } else {
        $inner.slideUp(200, 'easeOutCirc');
      }
    });
  }

  // ========================================
  // Tabs with Map Support
  // ========================================
  function initializeTabs() {
    $('.tabs').tabs();
  }

  // ========================================
  // Lightbox / Pretty Photo
  // ========================================
  function initializeLightbox() {
    $('a[rel^="prettyPhoto"]').prettyPhoto({
      social_tools: false
    });
  }

  // ========================================
  // Search Field Toggle
  // ========================================
  function initializeSearch() {
    $('.menu-search-button').on('click', function() {
      $('.menu-search-field').toggleClass('menu-search-focus', 200);
    });
  }

  // ========================================
  // Mobile Menu
  // ========================================
  function initializeMobileMenu() {
    $('.mobile-menu-button, .mobile-menu-title').on('click', function() {
      $('.mobile-menu-inner').stop().slideToggle(350);
      return false;
    });
  }

  // ========================================
  // Header Map Toggle
  // ========================================
  function initializeHeaderMap() {
    $('.gmap-button').on('click', function() {
      $(this).toggleClass('gmap-button-hover');
      $('#header-gmap').slideToggle(900);
      return false;
    });
  }

})(jQuery);

jQuery(window).load(function(){
	
	"use strict";
	
	// Main Slider
	jQuery('.slider, .slideshow-shortcode').flexslider({
		animation: "fade",
		controlNav: false,
		directionNav: true,
		slideshow: slideshow_autoplay,
		start: function(slider){
			jQuery('body').removeClass('loading');
		},
		prevText: "",
		nextText: "",
		smoothHeight: true
	});
	
	// Text Slider
	jQuery('.text-slider').flexslider({
		animation: "fade",
		controlNav: false,
		directionNav: true,
		slideshow: true,
		start: function(slider){
			jQuery('body').removeClass('loading');
		},
		prevText: "",
		nextText: ""
	});

});