/**
 * Gallery Plugin - Image Slider and Pagination Handler
 * Manages carousel animations and scroll position preservation
 */

(function($) {
  'use strict';

  // Configuration
  const config = {
    sliderDelay: 4000, // milliseconds between slides
    imageAnimationTop: -200,
    imageRestingTop: 20,
  };

  let sliderIntervalId;

  /**
   * Animate slide carousel movement
   * Moves slides left with image animation effects
   *
   * @param {number} panelWidth - Width of each slide panel
   * @param {number} maxLeftPosition - Maximum left position before reset
   */
  function animateSlide(panelWidth, maxLeftPosition) {
    let leftValue = jQuery('#mover').css('left');

    // Handle IE edge case
    if (leftValue === 'auto') {
      leftValue = 0;
    }

    const movement = parseFloat(leftValue, 10) - panelWidth;
    const isAtEnd = movement === maxLeftPosition;
    const targetLeft = isAtEnd ? 0 : movement;

    // Animate: image up → slide left → image down
    jQuery('.slide img').animate({ top: config.imageAnimationTop }, () => {
      jQuery('#mover').animate({ left: targetLeft }, () => {
        jQuery('.slide img').animate({ top: config.imageRestingTop });
      });
    });
  }

  /**
   * Initialize automatic slide carousel
   */
  function initializeSlideshow() {
    const $slide = jQuery('#slide-1');
    if ($slide.length === 0) return;

    // Calculate total panel width including padding
    const panelWidth = parseFloat($slide.css('width'), 10) +
                       parseFloat($slide.css('paddingLeft'), 10) +
                       parseFloat($slide.css('paddingRight'), 10);

    const slideCount = jQuery('.slide').length;
    const maxLeftPosition = -(panelWidth * slideCount);
    const totalWidth = slideCount * panelWidth;

    // Set mover container width
    jQuery('#mover').css('width', totalWidth);

    // Start automatic slide animation
    sliderIntervalId = setInterval(() => {
      animateSlide(panelWidth, maxLeftPosition);
    }, config.sliderDelay);

    // Toggle play/pause on stop button
    jQuery('#slider-stopper').on('click', function() {
      const $button = jQuery(this);
      const isRunning = $button.text() === 'Stop';

      if (isRunning) {
        clearInterval(sliderIntervalId);
        $button.text('Start');
      } else {
        sliderIntervalId = setInterval(() => {
          animateSlide(panelWidth, maxLeftPosition);
        }, config.sliderDelay);
        $button.text('Stop');
      }
    });
  }

  /**
   * jQuery plugin: Preserve scroll position across pagination
   * Stores current scroll position in localStorage, restores after page reload
   *
   * @returns {boolean} true if localStorage available, false otherwise
   */
  $.fn.preserveScrollPosition = function() {
    if (!localStorage) {
      return false;
    }

    // Restore previous scroll position if available
    const savedPosition = localStorage.getItem('scrollPosition');
    if (savedPosition) {
      $(window).scrollTop(parseInt(savedPosition, 10));
      localStorage.removeItem('scrollPosition');
    }

    // Save scroll position when this element is clicked
    this.on('click', () => {
      localStorage.setItem('scrollPosition', $(window).scrollTop());
    });

    return true;
  };

  /**
   * Initialize gallery on document ready
   */
  jQuery(document).ready(function() {
    // Initialize slideshow
    initializeSlideshow();

    // Enable scroll position preservation for pagination links
    $('.paginate2, .paginate3, .paginate4, .paginate5, .video_view9_cont_wrapper')
      .preserveScrollPosition();
  });

}(jQuery));

