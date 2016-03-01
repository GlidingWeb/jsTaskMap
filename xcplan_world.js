
  function initPoints() {
    var i;
    for (i = 0; i < tpinfo.length; i++) {
      markerList[i].setMap(null);
      labelList[i].close();
    }
    markerList = [];
    tpinfo = [];
    labelList = [];
    if (taskLine) {
      taskLine.setMap(null);
      taskLine = null;
    }
    taskdef = [];
    $('#tasktab').html("");
    $('#tasklength').text("");
    $('.printbutton').prop("disabled", true);
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
    if (map.getZoom() > 6) {
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
  
   function parseTpLine(tpLine, extension) {
    var lineout = {};
    var latitude;
    var longitude;
    var matched = false;
    var cupRegex=/^\"?([^\"]*)\"?,\"?([\w\d\s]*)\"?,\"?[A-Z]{0,2}\"?,\"?(\d{4}.\d{3})([NS])\"?,\"?(\d{5}.\d{3})([EW])\"?,[\w\s\d.]*,\d?,[\s\d]*,[\s\d\w\.]*,\"?[\d.]*.\"?([^"]*)\"?/; 
    var datRegex = /^([\d]+),([\d]{2}):([\d\.]{2,})([NS]),([\d]{3}):([\d\.]{2,})([EW]),[\d\w]*,[\w]*,([^,]*),([^,]*)/;
    switch (extension) {
      case ".CUP":
        var cupMatch = tpLine.match(cupRegex);
        if (cupMatch) {
          matched = true;
          lineout.tpname = cupMatch[1];
          lineout.trigraph = cupMatch[2];
          if (lineout.trigraph.length === 0) {
            lineout.trigraph = lineout.tpname;
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
          lineout.tpname = datMatch[8];
          if (/[A-Z\d]{3}/.test(lineout.title)) {
            lineout.trigraph = lineout.title.substr(0, 3);
          } else {
            lineout.trigraph = lineout.tpname;
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
      lineout.latitude = latitude;
      lineout.longitude = longitude;
      return lineout;
    } else {
      return false;
    }
  }
  
    function parseTps(tpfile, extension) {
    var lineIndex;
    var tpLines = tpfile.split('\n');
    var tpdata;
    var maxLat=-90;
    var minLat= 90;
    var maxLng=-180;
    var minLng=180;

    for (lineIndex = 0; lineIndex < tpLines.length; lineIndex++) {
      tpdata = parseTpLine(tpLines[lineIndex], extension);
      if (tpdata) {
        tpinfo.push(tpdata);
        if(tpdata.latitude > maxLat) {
            maxLat=tpdata.latitude;
        }
        if(tpdata.latitude < minLat) {
            minLat=tpdata.latitude;
        }
         if(tpdata.longitude > maxLng) {
            maxLng=tpdata.longitude;
        }
        if(tpdata.longitude < minLng) {
            minLng=tpdata.longitude;
        }
      }
    }
           var southWest = new google.maps.LatLng(minLat,minLng);
           var northEast = new google.maps.LatLng(maxLat,maxLng);
          var bounds = new google.maps.LatLngBounds(southWest,northEast);
          return bounds;
  }
  
 $(document).ready(function() {
     
      var myStyles =[ 
     {
         "featureType": "poi", 
         "elementType": "labels", 
         "stylers": [
         { "visibility": "off" } 
        ] 
    },
         { 
         "featureType": "transit", 
         "elementType": "labels", 
          "stylers": [
          { "visibility": "off" }
        ] } ];
     
    var mapOpt = {
      center: new google.maps.LatLng(0, 0),
      zoom: 2,
      maxZoom: 2,
      streetViewControl: false,
      styles: myStyles
    };
  map = new google.maps.Map($('#map').get(0), mapOpt);
  
   $('#acceptor').click(function() {
      $('#disclaimer').hide();
      $('#fileselect').show();
    });

    map.addListener('idle', function() {
      showAirspace();
      if (labelsShowing) {
        showLabels();
      }
    });
  
     $('#help').click(function () {
            window.open("xcplanhelp.html", "_blank");
        });

    $('#about').click(function () {
            window.open("xcplanabout.html", "_blank");
        });
    
     $('#copytask').click(function() {
    var i;
    var exportDetail={
        tpname: [],
        lat: [],
        lng: []
    };

if(window.opener && !window.opener.closed && (window.opener.name==='igcview') ) {
   for (i = 0; i < taskdef.length; i++) {
      exportDetail.tpname[i]=tpinfo[taskdef[i]].tpname;
     exportDetail.lat[i]=tpinfo[taskdef[i]].latitude;
     exportDetail.lng[i]=tpinfo[taskdef[i]].longitude;
    }
    var retval= window.opener.ns.importTask(exportDetail);
     alert(retval);
}
else {
    alert("Copy operation failed");
}
});
    
    $('#fileControl').change(function() {
      var filetypes = [".CUP", ".DAT"];
      var mapbounds;
      if (this.files.length > 0) {
        var extension = this.value.substr(-4).toUpperCase();
        if (filetypes.indexOf(extension) >= 0) {
           initPoints();
          var reader = new FileReader();
          reader.onload = function(e) {
            mapbounds = parseTps(this.result, extension);
            if (tpinfo.length  > 1) {
              $('#maincontrol').show();
        if(window.opener) {
            if(window.opener.name==='igcview') {
             $('#exportdiv').show();
            }
           }
               map.setOptions({
                 maxZoom: 18
                 });
              map.fitBounds(mapbounds);
               map.setZoom(9);
               maketps();
            } else {
              alert("Sorry, file type not correct");
            }
          };
          reader.readAsText(this.files[0]);
        }
      }
    });

 });
