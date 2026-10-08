/**
 * Google Maps Integration
 * Initializes and manages map display with markers and info windows
 */

let mapInstance = null;

/**
 * Configure map styling based on theme options
 */
function configureMapStyles() {
  const styles = [];

  // Hide business POIs if configured
  if (typeof gmap_options !== 'undefined' && gmap_options.hide_businesses === 1) {
    styles.push({
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }]
    });
  }

  return styles;
}

/**
 * Initialize Google Map at specified location
 *
 * @param {number} latitude - Map center latitude
 * @param {number} longitude - Map center longitude
 */
function initialize(latitude, longitude) {
  const coordinates = new google.maps.LatLng(latitude, longitude);
  const mapConfig = {
    zoom: 15,
    center: coordinates,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    styles: configureMapStyles()
  };

  // Create map instance
  mapInstance = new google.maps.Map(
    document.getElementById('map-canvas'),
    mapConfig
  );

  // Add marker with info window
  addMarkerWithInfo(coordinates);
}

/**
 * Add marker and info window to map
 *
 * @param {google.maps.LatLng} coordinates - Marker position
 */
function addMarkerWithInfo(coordinates) {
  const markerInfo = typeof googlemapMarker !== 'undefined' ? googlemapMarker : '';
  const infoWindow = new google.maps.InfoWindow({
    content: markerInfo
  });

  const marker = new google.maps.Marker({
    position: coordinates,
    map: mapInstance
  });

  // Open info window on marker click
  marker.addListener('click', function() {
    infoWindow.open(mapInstance, marker);
  });
}


}