'use strict';

  function getPoints() {
    $.getJSON("getbgapoints.php", function(data) {
      tpinfo = data;
      maketps();
    });
  }

  function zoomTo(tpval) {
      var i;
      var length=tpval.length;
      var list=[];
      tpval=tpval.toUpperCase();
      for(i =0;i < tpinfo.length; i++) {
          if(tpinfo[i].trigraph.substr(0,3).toUpperCase()===tpval) {
              list.push(tpinfo[i]);
          }
      }
       map.panTo({lat:list[0].latitude,lng: list[0].longitude});
        map.setZoom(12);
  }
  
  function getAirspace() {
    var i;
    var newPolypts = [];
    var newPolybases = [];
    var newCircles = [];
    var newCirclebases = [];
    var clipalt = $('#airclip').val();
    var j;
    $.post("localairspace.php", {
        country: "uk"
      },
      function(data, status) {
        if (status === "success") {
          for (i = 0; i < data.polygons.length; i++) {
            airspacePolygons[i] = new google.maps.Polygon(airDrawOptions);
            airspacePolygons[i].setPaths(data.polygons[i].coords);
            polygonBases[i] = data.polygons[i].base;
          }
          for (j = 0; j < data.circles.length; j++) {
            airspaceCircles[j] = new google.maps.Circle(airDrawOptions);
            airspaceCircles[j].setRadius(1000 * data.circles[j].radius);
            airspaceCircles[j].setCenter(data.circles[j].centre);
            circleBases[j] = data.circles[j].base;
          }
          changeBase();
        }
      }, "json");

  }

  $(document).ready(function() {
    var myStyles = [{
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "transit",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    }];
    var mapOpt = {
      center: new google.maps.LatLng(53.5, -1),
      zoom: 7,
      maxZoom: 18,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      streetViewControl: false,
      styles: myStyles
    };
    map = new google.maps.Map($('#map').get(0), mapOpt);
     makeTpMarkers();
    map.addListener('idle', function() {
      if (labelsShowing) {
        showLabels();
      }
    });

    $('#acceptor').click(function() {
      $('#disclaimer').hide();
      getAirspace();
      getPoints();
      $('.printbutton').prop("disabled", true);
      $('#maincontrol').show();
    });

    $('#help').click(function() {
      window.open("ukplanhelp.html", "_blank");
    });

    $('#about').click(function() {
      window.open("ukplanabout.html", "_blank");
    });

  });
