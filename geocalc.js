 
  function showpoint(point) {
    var latdegrees = Math.abs(point.lat);
    var latdegreepart = Math.floor(latdegrees);
    var latminutepart = 60 * (latdegrees - latdegreepart);
    var latdir = (point.lat > 0) ? "N" : "S";
    var lngdegrees = Math.abs(point.lng);
    var lngdegreepart = Math.floor(lngdegrees);
    var lngminutepart = 60 * (lngdegrees - lngdegreepart);
    var lngdir = (point.lng > 0) ? "E" : "W";
    var retstr = latdegreepart.toString() + "&deg;" + latminutepart.toFixed(3) + "&prime;" + latdir + " " + lngdegreepart.toString() + "&deg;" + lngminutepart.toFixed(3) + "&prime;" + lngdir;
    return retstr;
  }
 
 function leginfo(start, end) {
    var earthrad = 6378; // km
    var lat1 = start['lat'] * Math.PI / 180;
    var lat2 = end['lat'] * Math.PI / 180;
    var lon1 = start['lng'] * Math.PI / 180;
    var lon2 = end['lng'] * Math.PI / 180;
    var deltaLat = lat2 - lat1;
    var deltaLon = (end['lng'] - start['lng']) * Math.PI / 180;
    var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = earthrad * c;
    var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    var brng = Math.round((360 + Math.atan2(y, x) * 180 / Math.PI) % 360);
    return {
      distance: d,
      bearing: brng
    };
  }