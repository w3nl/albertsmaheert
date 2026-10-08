/**
 * WP Spam Fighter - Anti-Spam Protection Plugin
 * Provides multiple layers of spam protection: timestamp, checkbox, reCAPTCHA, JavaScript token
 */

(function($) {
  'use strict';

  const SpamFighter = {
    /**
     * Initialize all spam protection mechanisms
     */
    init: function() {
      if (typeof window.wpsf_timestamp_enabled === 'undefined') {
        return; // Plugin not properly configured
      }

      this.initTimestampProtection();
      this.initSpammerCheckbox();
      this.initRecaptcha();
      this.attachFormValidation();
    },

    /**
     * Add timestamp fields to track form submission time
     * Prevents rapid-fire submissions from bots
     */
    initTimestampProtection: function() {
      if (!window.wpsf_timestamp_enabled) {
        return;
      }

      const $forms = $('#commentform, #setupform, #registerform');
      $forms.append($('<input>')
        .attr('type', 'hidden')
        .attr('name', 'wpsfTS1')
        .attr('id', 'wpsfTS1')
        .val('1')
      );

      $forms.append($('<input>')
        .attr('type', 'hidden')
        .attr('name', 'wpsfTS2')
        .attr('id', 'wpsfTS2')
        .val('1')
      );

      // Capture the form submission time
      $('#wpsfTS1').val(new Date().getTime());
    },

    /**
     * Add "I'm not a spammer" checkbox
     * Provides user confirmation of legitimate submission
     */
    initSpammerCheckbox: function() {
      if (!window.wpsf_not_a_spammer_enabled) {
        return;
      }

      const $container = $('#wpsf_p');
      if ($container.length === 0) {
        return;
      }

      const $checkbox = $('<input>')
        .attr('type', 'checkbox')
        .attr('id', 'wpsf_not_a_spammer')
        .attr('name', 'wpsf_not_a_spammer');

      const $label = $('<label />')
        .text(window.not_a_spammer_label)
        .append($checkbox);

      $container.append($label);
    },

    /**
     * Add Google reCAPTCHA widget
     * Provides bot detection via reCAPTCHA service
     */
    initRecaptcha: function() {
      if (!window.wpsf_recaptcha_enabled) {
        return;
      }

      const $container = $('#wpsf_p');
      if ($container.length === 0 || !window.captcha_site_key) {
        return;
      }

      const $captcha = $('<div />')
        .addClass('g-recaptcha')
        .attr('data-sitekey', window.captcha_site_key);

      $container.append($captcha);
    },

    /**
     * Attach validation handler to all comment/registration forms
     */
    attachFormValidation: function() {
      $('#commentform, #setupform, #registerform').on('submit', this.validateForm.bind(this));
    },

    /**
     * Validate form submission against spam protection rules
     * Returns false (prevents submission) if any validation fails
     *
     * @returns {boolean} true if valid, false if spam detected
     */
    validateForm: function() {
      // Check timestamp threshold
      if (window.wpsf_timestamp_enabled) {
        if (!this.validateTimestamp()) {
          return false;
        }
      }

      // Check "not a spammer" checkbox
      if (window.wpsf_not_a_spammer_enabled) {
        if (!this.validateSpammerCheckbox()) {
          return false;
        }
      }

      // Add JavaScript token to prove JavaScript is enabled
      if (window.wpsf_javascript_enabled) {
        const $forms = $('#commentform, #setupform, #registerform');
        $forms.append($('<input>')
          .attr('type', 'hidden')
          .attr('name', 'wpsf_javascript')
          .attr('value', 'WPSF_JAVASCRIPT_TOKEN')
        );
      }

      return true;
    },

    /**
     * Validate that submission was not too quick
     * Compares form load time with submission time
     *
     * @returns {boolean} true if enough time has passed, false if too quick
     */
    validateTimestamp: function() {
      const $ts1 = $('#wpsfTS1');
      const $ts2 = $('#wpsfTS2');

      if ($ts1.length === 0 || $ts2.length === 0) {
        return true; // Fields missing, skip validation
      }

      const loadTime = parseInt($ts1.val(), 10);
      const submitTime = new Date().getTime();
      $ts2.val(submitTime);

      const timeDiff = submitTime - loadTime;
      const thresholdMs = window.wpsf_threshold;
      const remainingSeconds = Math.round((thresholdMs - timeDiff) / 1000);

      if (timeDiff <= thresholdMs) {
        const message = window.wpsf_message
          .replace('%1$s', Math.round(thresholdMs / 1000))
          .replace('%2$s', remainingSeconds);
        alert(message);
        return false;
      }

      return true;
    },

    /**
     * Validate that user checked "not a spammer" checkbox
     *
     * @returns {boolean} true if checked, false otherwise
     */
    validateSpammerCheckbox: function() {
      const $checkbox = $('#wpsf_not_a_spammer');

      if ($checkbox.length === 0) {
        return true; // Checkbox missing, skip validation
      }

      if (!$checkbox.is(':checked')) {
        alert(window.not_a_spammer_user_message);
        return false;
      }

      return true;
    }
  };

  /**
   * Initialize on document ready
   */
  $(document).ready(function() {
    SpamFighter.init();
  });

}(jQuery));

