(function () {
  // Improve perceived performance with progressive image loading.
  var images = document.querySelectorAll('img');
  for (var i = 0; i < images.length; i += 1) {
    var img = images[i];
    if (!img.getAttribute('loading') && i > 1) {
      img.setAttribute('loading', 'lazy');
    }
    if (!img.getAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  }

  // Strengthen external-link safety defaults.
  var links = document.querySelectorAll('a[target="_blank"]');
  for (var j = 0; j < links.length; j += 1) {
    var rel = links[j].getAttribute('rel') || '';
    if (rel.indexOf('noopener') === -1) {
      links[j].setAttribute('rel', (rel + ' noopener noreferrer').trim());
    }
  }
})();
