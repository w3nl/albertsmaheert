
/**
 * WPML (Sitepress) - Multilingual Plugin Integration
 * Handles language selection and multi-language functionality
 */

const currentLanguage = typeof icl_vars !== 'undefined' ? icl_vars.current_language : 'nl';
const homeUrl = typeof icl_vars !== 'undefined' ? icl_vars.icl_home : '';

/**
 * Attach callback to window onload event
 * Works even if onload is already assigned
 *
 * @param {Function} callback - Function to execute on page load
 */
function onWindowLoad(callback) {
  const existingOnload = window.onload;

  if (typeof existingOnload !== 'function') {
    window.onload = callback;
  } else {
    window.onload = function() {
      if (existingOnload) {
        existingOnload();
      }
      callback();
    };
  }
}

/**
 * Retry machine translation for a language pair
 * Used by WPML translation interface
 *
 * @param {HTMLElement} element - Element with retry data attributes
 * @returns {boolean} false to prevent default action
 */
function retryMachineTranslation(element) {
  const elementId = element.getAttribute('id');
  const [, , languageCode, nonceValue] = elementId.split('_');

  // Clean URL of hash, existing retry params, and nonces
  let currentUrl = location.href
    .replace(/#(.*)$/, '') // Remove hash
    .replace(/(&|\?)(retry_mtr)=([0-9]+)/g, '') // Remove retry params
    .replace(/&nonce=([0-9a-z]+)(&|$)/g, ''); // Remove nonces

  // Determine URL separator
  const separator = currentUrl.indexOf('?') === -1 ? '?' : '&';

  // Build retry URL with new parameters
  const retryUrl = `${currentUrl}${separator}retry_mtr=${languageCode}&nonce=${nonceValue}`;
  location.href = retryUrl;

  return false;
}

