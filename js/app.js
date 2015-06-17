$(document).ready(function(){     //use document.ready() because it occurs when the document has been loaded, while the onload event occurs after content has loaded.
  var popupContent = $('#popupContent').html();
  var popupContentTemplate = Handlebars.compile(popupContent);  // Use handlebars because it's a more elegant way of formatting the data from the API

  function makeContentString(location) {   //create function that only formats content for markers 
    location.openinghours = '';
    var days = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    for (var day in location.lobbyHrs) {
      var hours = (typeof location.lobbyHrs[day] !== 'undefined' || location.lobbyHrs[day] !== null || location.lobbyHrs[day] !== '') ? location.lobbyHrs[day] : "closed";
      location.openinghours += days[day] + ': ' + hours + '<br />';
    }

    return popupContentTemplate(location);
  }

   var allInfoWindows = [];
  
  var closeAllInfowindows = function() {
    for (var i = 0; i < allInfoWindows.length; i++) {
      allInfoWindows[i].close();
    }
  };

  function makeInfowindow(map, location, marker) {  //create actual info windows for each marker
    var currentMark;
    var infowindow = new google.maps.InfoWindow({
      content: makeContentString(location)
    });
    
    allInfoWindows.push(infowindow);

    google.maps.event.addListener(marker, 'click', function() {
      closeAllInfowindows();
      infowindow.open(map, this);
      currentMark = this;
    });
  }

  function makeMarker(location, map) {    // create initial marker for geolocation
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(location.lat,location.lng),
      map: map,
      title: location.name
    });
    
    return marker;
  }

  function makeMarkers(locationData, map) {   //create multiple markers for ATM locations
    var locations = locationData.locations;
    for (var l in locations) {
      var location = locationData.locations[l];

      var marker = makeMarker(location, map);

      makeInfowindow(map, location, marker);
    }
  }

  function makeMap(data, loc) {   //load the actual map
    var myLatlng = new google.maps.LatLng(loc.lat, loc.lng);

    var map = new google.maps.Map(document.getElementById("map-canvas"), {
      zoom: 16,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROAD
    });

    google.maps.event.addDomListener(window, "resize", function() {
      var center = map.getCenter();
      google.maps.event.trigger(map, "resize");
      map.setCenter(center); 
    });

    makeMarkers(data, map);
  }

  function init(myLocation) {    //call the Chase API with geolocation and create the map
    $.getJSON('/chaseapi?lat=' + myLocation.lat + '&lng=' + myLocation.lng, function(data) {
      makeMap(data, myLocation);
    });
  }

  function createLocation(position) {   //grab the user's current location via geolocation and then call init() to build the map/call Chase API
    var loc = {'lat': position.coords.latitude, 'lng': position.coords.longitude};
    init(loc);
  }

  function getLocation() {   //checks to see if geolocation is supported (although I checked and made sure this was supported by IE6 and up) and calls back the createLocation() function to set those coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(createLocation);
    } else {
      alert("Sorry, browser does not support geolocation");
      return {'lat': 0, 'lng': 0};
    }
  }

  getLocation();

});