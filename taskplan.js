(function($) {
  'use strict';
  var map;
  var airspacePolygons = [];
  var polygonBases = [];
  var airspaceCircles = [];
  var circleBases = [];
  var markerList = [];
  var tpinfo = [];
  var labelList = [];
  var labelsShowing = false;
  var taskdef = [];
  var airDrawOptions = {
    strokeColor: 'black',
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: '#FF0000',
    fillOpacity: 0.2,
    clickable: false
  };

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

  function bindTaskButtons() {
    $('#tasktab button').on('click', function(event) {
      var li = $(this).parent().parent().index();
      if ($(this).text() === "X") {
        taskdef.splice(li, 1);
      } else {
        var holder = taskdef[li];
        var prevpt = taskdef[li - 1];
        taskdef[li] = prevpt;
        taskdef[li - 1] = holder;
      }
      updateTask();
    });
  }

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

  function updateTask() {
    var i;
    var newrow;
    var tpref;
    var distance = 0;
    var pointref;
    var taskcoords = [];
    var ptcoords = {};

    $('#tasktab').html("");
    $('#tasklength').text("");
    for (i = 0; i < taskdef.length; i++) {
      switch (i) {
        case 0:
          tpref = "Start";
          break;
        case taskdef.length - 1:
          tpref = "Finish";
          break;
        default:
          tpref = "TP" + i.toString();
      }
      pointref = taskdef[i];
      newrow = "<tr><td>" + tpref + "</td><td>" + tpinfo[pointref].title + "</td><td>" + showpoint(tpinfo[pointref]) + "</td><td>";
      if (i === 0) {
        newrow += "&nbsp;";
      } else {
        newrow += "<button>&uarr;</button></td>";
      }
      newrow += "</td><td><button>X</button></td></tr>";
      $('#tasktab').append(newrow);
      ptcoords = {
        lat: tpinfo[pointref].lat,
        lng: tpinfo[pointref].lng
      };
      taskcoords.push(ptcoords);
      if (i > 0) {
        distance += leginfo(tpinfo[taskdef[i - 1]], tpinfo[pointref]).distance;
      }
      var taskLine = new google.maps.Polyline({
        path: taskcoords,
        strokeColor: 'black',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      taskLine.setMap(map);
    }

    if (distance > 0) {
      $('#tasklength').text("Task length: " + (distance).toFixed(1) + "Km");
      //mapLayers.tasklayer=L.polyline(coordlist,{color: 'black'}).addTo(map);
    }
    bindTaskButtons();
  }

  function parseTpLine(tpLine, extension) {
    var lineout = {};
    var latitude;
    var longitude;
    var matched = false;
    var cupRegex = /^\"?([\w\s\d]+)\"?,\"?([\w\s\d]*)\"?,\"?[A-Z]{0,2}\"?,\"?(\d{4}.\d{3})([NS])\"?,\"?(\d{5}.\d{3})([EW])\"?,[\w\s\d.]*,\d?,[\s\d]*,[\s\d\w\.]*,\"?[\d.]*.\"?(.*)\"?/;
    var datRegex = /^([\d]+),([\d]{2}):([\d\.]{2,})([NS]),([\d]{3}):([\d\.]{2,})([EW]),[\d\w]*,[\w],([\d\w\s]*),([\d\w\s]*)/;
    switch (extension) {
      case ".CUP":
        var cupMatch = tpLine.match(cupRegex);
        if (cupMatch) {
          matched = true;
          lineout.title = cupMatch[1];
          lineout.labelContent = cupMatch[2];
          if (lineout.labelContent.length === 0) {
            lineout.labelContent = lineout.title;
          }
          latitude = parseFloat(cupMatch[3].substr(0, 2)) + parseFloat(cupMatch[3].substr(2, 6)) / 60;
          if (cupMatch[4] === 'S') {
            latitude = -latitude;
          }
          longitude = parseFloat(cupMatch[5].substr(0, 3)) + parseFloat(cupMatch[5].substr(3, 6)) / 60;
          if (cupMatch[6] === 'W') {
            longitude = -longitude;
          }
          lineout.detail = cupMatch[7];
        } else {
          matched = false;
        }
        break;
      case ".DAT":
        var datMatch = tpLine.match(datRegex);
        var minsecs;
        if (datMatch) {
          matched = true;
          lineout.title = datMatch[8];
          if (/[A-Z\d]{3}/.test(lineout.title)) {
            lineout.labelContent = lineout.title.substr(0, 3);
          } else {
            lineout.labelContent = lineout.title;
          }
          latitude = parseFloat(datMatch[2]);
          if (datMatch[3].charAt(2) === '.') {
            latitude = latitude + parseFloat(datMatch[3] / 60);
          } else {
            minsecs = datMatch[3].split(':');
            latitude = latitude + parseFloat(minsecs[0] / 60) + parseFloat(minsecs[1] / 3600);
          }
          if (datMatch[4] === 'S') {
            latitude = -latitude;
          }
          longitude = parseFloat(datMatch[5]);
          if (datMatch[6].charAt(2) === '.') {
            longitude = longitude + parseFloat(datMatch[6] / 60);
          } else {
            minsecs = datMatch[6].split(':');
            longitude = longitude + parseFloat(minsecs[0] / 60) + parseFloat(minsecs[1] / 3600);
          }
          if (datMatch[7] === 'W') {
            longitude = -longitude;
          }
          lineout.detail = datMatch[9];
        } else {
          matched = false;
        }
        break;
    }
    if (matched) {
      lineout.lat = latitude;
      lineout.lng = longitude;
      return lineout;
    } else {
      return false;
    }
  }

  function makeMarker(markerinfo) {
    var marker = new google.maps.Marker({
      icon: "marker-icon.png",
      position: {
        lat: markerinfo.lat,
        lng: markerinfo.lng
      },
      title: markerinfo.title
    });
    marker.index = markerinfo.index;
    marker.addListener('click', function() {
      taskdef.push(this.index);
      updateTask();
    });

    return marker;
  }

  function makeLabel(labelinfo) {
    var myOptions = {
      content: labelinfo.labelContent,
      boxClass: 'infoBox',
      disableAutoPan: true,
      pixelOffset: new google.maps.Size(-15, 0),
      closeBoxURL: "",
      isHidden: false,
      enableEventPropagation: true
    };
    var ibLabel = new InfoBox(myOptions);
    return ibLabel;
  }

  function parseTps(tpfile, extension) {
    var bounds = new google.maps.LatLngBounds();
    var lineIndex;
    var tpLines = tpfile.split('\n');
    var tpdata;
    var marker;
    var markerindex = 0;
    var label = {};
    for (lineIndex = 0; lineIndex < tpLines.length; lineIndex++) {
      tpdata = parseTpLine(tpLines[lineIndex], extension);
      if (tpdata) {
        tpdata.index = markerindex;
        tpinfo.push(tpdata);
        marker = makeMarker(tpdata);
        label = makeLabel(tpdata);
        markerList.push(marker);
        bounds.extend(marker.position);
        labelList.push(label);
        markerindex++;
      }
    }
    return bounds;
  }

  function storePreference(name, value) {
    if (window.localStorage) {
      try {
        localStorage.setItem(name, value);
      } catch (e) {
        // If permission is denied, ignore the error.
      }
    }
  }

  function zapAirspace() {
    var i;
    var j;
    for (i = 0; i < airspacePolygons.length; i++) {
      airspacePolygons[i].setMap(null);
      airspacePolygons[i] = null;
    }
    airspacePolygons.length = 0;
    polygonBases.length = 0;
    for (j = 0; j < airspaceCircles.length; j++) {
      airspaceCircles[j].setMap(null);
      airspaceCircles[j] = null;
    }
    airspaceCircles.length = 0;
    circleBases.length = 0;
  }

  function showAirspace() {
    var mapbounds = map.getBounds();
    var testvar = mapbounds.toJSON();
    var boundsdata = JSON.stringify(testvar);
    var i;
    var newPolypts = [];
    var newPolybases = [];
    var newCircles = [];
    var newCirclebases = [];
    var clipalt = $('#airclip').val();
    var j;
    if (map.getZoom() > 7) {
      $.post("getairspace.php", {
          bounds: boundsdata
        },
        function(data, status) {
          if (status === "success") {
            for (i = 0; i < data.polygons.length; i++) {
              newPolypts[i] = new google.maps.Polygon(airDrawOptions);
              newPolypts[i].setPaths(data.polygons[i].coords);
              newPolybases[i] = data.polygons[i].base;
              if (newPolybases[i] < clipalt) {
                newPolypts[i].setMap(map);
              }
            }
            for (j = 0; j < data.circles.length; j++) {
              newCircles[j] = new google.maps.Circle(airDrawOptions);
              newCircles[j].setRadius(1000 * data.circles[j].radius);
              newCircles[j].setCenter(data.circles[j].centre);
              newCirclebases[j] = data.circles[j].base;
              if (newCirclebases[j] < clipalt) {
                newCircles[j].setMap(map);
              }
            }
            zapAirspace();
            airspacePolygons = newPolypts;
            polygonBases = newPolybases;
            airspaceCircles = newCircles;
            circleBases = newCirclebases;
          }
        }, "json");
    } else {
      zapAirspace();
    }
  }

  function changeBase() {
    var clipalt = $('#airclip').val();
    var i;
    var j;
    for (i = 0; i < airspacePolygons.length; i++) {
      if (polygonBases[i] < clipalt) {
        airspacePolygons[i].setMap(map);
      } else {
        airspacePolygons[i].setMap(null);
      }
    }
    for (j = 0; j < airspacePolygons.length; j++) {
      if (circleBases[j] < clipalt) {
        airspaceCircles[j].setMap(map);
      } else {
        airspaceCircles[j].setMap(null);
      }
    }
  }

  function showLabels() {
    var mapbounds = map.getBounds();
    var i;
    for (i = 0; i < markerList.length; i++) {
      if (mapbounds.contains(markerList[i].getPosition())) {
        labelList[i].open(map, markerList[i]);
      } else {
        labelList[i].close();
      }
    }
  }

  function hideLabels() {
    var i;
    for (i = 0; i < markerList.length; i++) {
      labelList[i].close();
    }
  }

  function showMarkers() {
    var i;
    for (i = 0; i < markerList.length; i++) {
      markerList[i].setMap(map);
    }
  }

  function hideMarkers() {
    var i;
    for (i = 0; i < markerList.length; i++) {
      markerList[i].setMap(null);
    }
  }

  function kickitoff(mapbounds) {
    map.setOptions({
      maxZoom: 18
    });
    map.fitBounds(mapbounds);
    map.setZoom(9);
    $('input:radio[name=wpt_vis]')[0].checked = true;
    $('input:radio[name=label_vis]')[1].checked = true;
    showMarkers();
  }

  $(document).ready(function() {
    var mapOpt = {
      center: new google.maps.LatLng(0, 0),
      zoom: 2,
      maxZoom: 2,
      streetViewControl: false
    };
    map = new google.maps.Map($('#map').get(0), mapOpt);

    $(' input[name=wpt_vis]:radio').change(function() {
      if ($(this).val() === 'show') {
        showMarkers();
      } else {
        hideMarkers();
      }
    });

    $(' input[name=label_vis]:radio').change(function() {
      if ($(this).val() === 'show') {
        showLabels();
        labelsShowing = true;
      } else {
        hideLabels();
        labelsShowing = false;
      }
    });

    $('#fileControl').change(function() {
      var filetypes = [".CUP", ".DAT"];
      var mapbounds;
      if (this.files.length > 0) {
        var extension = this.value.substr(-4).toUpperCase();
        if (filetypes.indexOf(extension) >= 0) {
          var reader = new FileReader();
          reader.onload = function(e) {
            mapbounds = parseTps(this.result, extension);
            if (markerList.length > 1) {
              kickitoff(mapbounds);
            } else {
              alert("Sorry, file type incorrect");
            }
          };
          reader.readAsText(this.files[0]);
        }
      }
    });

    $('#airclip').change(function() {
      var clipping = $(this).val();
      storePreference("airspaceClip", clipping);
      changeBase();
    });

    $('#acceptor').click(function() {
      $('#disclaimer').hide();
      $('#maincontrol').show();
    });

    map.addListener('idle', function() {
      showAirspace();
      if (labelsShowing) {
        showLabels();
      }
    });

    var airspaceClip = '';
    if (window.localStorage) {
      try {
        airspaceClip = localStorage.getItem("airspaceClip");
        if (airspaceClip) {
          $('#airclip').val(airspaceClip);
        }
      } catch (e) {
        // If permission is denied, ignore the error.
      }
    }
  });
}(jQuery));
