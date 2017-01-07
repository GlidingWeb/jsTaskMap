
  var taskdetail=[];
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
  var taskLine = null;
  var tpMarkers=[];
  var airDrawOptions = {
    strokeColor: 'black',
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: '#FF0000',
    fillOpacity: 0.2,
    clickable: false
  };

  function makeTpMarkers() {
      var i;
      var label;
      var marker;
      var zindex;
      for(i=0; i < 11; i++) {
        zindex=2000 + 10*i;
        if(i===10) {
            label='F';
        }
        else {
        label=i.toString();
        }
         marker=new google.maps.Marker({
        label: label,
        zIndex: zindex,
        clickable: false
      });
        tpMarkers.push(marker);
      }
  }
  
  
  
  function showLabels() {
    var mapbounds = map.getBounds();
    var i;
    var j;
    var labelShowlist = [];
    var showing = true;
    for (i = 0; i < markerList.length; i++) {
      if (mapbounds.contains(markerList[i].getPosition())) {
        labelShowlist.push(i);
      } else {
        labelList[i].close();
      }
    }
    var showing = (labelShowlist.length < 400);
    for (j = 0; j < labelShowlist.length; j++) {
      if (showing) {
        labelList[labelShowlist[j]].open(map, markerList[labelShowlist[j]]);
      } else {
        labelList[labelShowlist[j]].close();
      }
    }
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
 for(i = taskdef.length-1; i < 11;i++) {
      tpMarkers[i].setMap(null);
  }
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
      newrow = "<tr><td>" + tpref + "</td><td>" + tpinfo[pointref].tpname + "</td><td>" + showpoint(tpinfo[pointref]) + "</td><td>";
      if (i === 0) {
        newrow += "&nbsp;";
      } else {
        newrow += "<button>&uarr;</button></td>";
      }
      newrow += "</td><td><button>X</button></td></tr>";
      $('#tasktab').append(newrow);
      ptcoords = {
        lat: tpinfo[pointref].latitude,
        lng: tpinfo[pointref].longitude
      };
      taskcoords.push(ptcoords);
   if (((i < taskdef.length -1)|| (i===0)) && (i < 10)) {
       tpMarkers[i].setPosition(ptcoords);
       tpMarkers[i].setMap(map);
  }
      else {
          if(pointref===taskdef[0]) {
              tpMarkers[10].setMap(null);
          }
          else {
              tpMarkers[10].setPosition(ptcoords);
              tpMarkers[10].setMap(map);
          }
      }
      if (i > 0) {
        distance += leginfo(tpinfo[taskdef[i - 1]], tpinfo[pointref]).distance;
      }
      if (taskLine) {
        taskLine.setMap(null);
        taskLine = null;
      }
      taskLine = new google.maps.Polyline({
        path: taskcoords,
        strokeColor: 'black',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      taskLine.setMap(map);
      if (taskcoords.length === 2) {
        $('.printbutton').prop("disabled", false);
      }
      if (taskcoords.length === 1) {
        $('.printbutton').prop("disabled", true);
      }
    }
/*
  for(i = taskdef.length-1; i < 10;i++) {
      tpMarkers[i].setMap(null);
  }
  */
    if (distance > 0) {
      $('#tasklength').text("Task length: " + (distance).toFixed(1) + "Km");
    }
    bindTaskButtons();
  }

 function makeLabel(labelinfo,offset) {
    var myOptions = {
      content: labelinfo,
      boxClass: 'infoBox',
      disableAutoPan: true,
      pixelOffset: offset,
      closeBoxURL: "",
     visible : true,
     pane: 'mapPane',
      enableEventPropagation: true
    };
    var ibLabel = new InfoBox(myOptions);
    return ibLabel;
  }

 function maketps() {
      var i;
      var marker;
      var label;
      var labelOffset=new google.maps.Size(-15, 0);
      for(i=0;i < tpinfo.length; i++) {
          marker=new google.maps.Marker({
          icon: 'marker-icon.png',
          position: {
          lat: tpinfo[i].latitude,
          lng: tpinfo[i].longitude
      },
         title: tpinfo[i].tpname
      });
        marker.index = i;
      marker.addListener('click', function() {
      taskdef.push(this.index);
     updateTask();
    });
       marker.setMap(map);
       markerList.push(marker);
       markersShowing=true;
       label=makeLabel(tpinfo[i].trigraph,labelOffset);
       labelList.push(label);
      }
      $('input:radio[name=wpt_vis]')[0].checked = true;
      $('input:radio[name=label_vis]')[1].checked = true;
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
    for (j = 0; j < airspaceCircles.length; j++) {
      if (circleBases[j] < clipalt) {
        airspaceCircles[j].setMap(map);
      } else {
        airspaceCircles[j].setMap(null);
      }
    }
  }

   function hideMarkers() {
    var i;
    for (i = 0; i < markerList.length; i++) {
      markerList[i].setMap(null);
    }
    markersShowing=false;
  }
  
  function showMarkers() {
    var i;
    for (i = 0; i < markerList.length; i++) {
      markerList[i].setMap(map);
    }
    markersShowing=true;
  }

  function hideLabels() {
    var i;
    for (i = 0; i < labelList.length; i++) {
      labelList[i].close();
    }
  }

   function exportTask(url) {
     taskdetail = [];
    var i;
    for (i = 0; i < taskdef.length; i++) {
      taskdetail.push(tpinfo[taskdef[i]]);
    }
    window.open(url, "_blank");
  }

  $(document).ready(function() {
    if (window.opener) {
               if ((window.opener.name === 'igcview') || (window.opener.name === 'flarmwrite')) {
                 $('#exportdiv').show();
               }
        }
    $(' input[name=wpt_vis]:radio').change(function() {
      if ($(this).val() === 'show') {
        showMarkers();
      } else {
          if(labelsShowing) {
              $('input:radio[name=label_vis]')[1].checked = true;
              hideLabels();
          }
        hideMarkers();
      }
    });

    $(' input[name=label_vis]:radio').change(function() {
        if(!(markersShowing)) {
            $('input:radio[name=wpt_vis]')[0].checked = true;
            showMarkers();
        }
      if ($(this).val() === 'show') {
        showLabels();
        labelsShowing = true;
      } 
      else {
        hideLabels();
        labelsShowing = false;
      }
    });

   

    $('#airclip').change(function() {
      var clipping = $(this).val();
      storePreference("airspaceClip", clipping);
      changeBase();
    });

    $('#copytask').click(function() {
     var i;
     var exportDetail = {
       names: [],
       coords: []
     };
     if (window.opener && !window.opener.closed && ((window.opener.name === 'igcview') || (window.opener.name === 'flarmwrite'))) {
       for (i = 0; i < taskdef.length; i++) {
         exportDetail.names[i] = tpinfo[taskdef[i]].tpname;
         var coord = {lat: tpinfo[taskdef[i]].latitude,lng:  tpinfo[taskdef[i]].longitude};
         exportDetail.coords.push(coord);
       }
       var retval = window.opener.importTask(exportDetail);
       alert(retval);
     }
     else {
       alert("Copy operation failed");
     }
   });

    $('#tasksheet').click(function() {
      exportTask("taskbrief.html");
    });

    $('#declaration').click(function() {
      exportTask("declaration.html");
    });

    $('#tpzoom').click(function() {
        var point=$('#findpt').val();
        if(point.length > 2) {
          zoomTo(point);
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

