<?php
$version=strtolower($_GET['version']);
if(empty($version)) {
header('Location: index.html');
}
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
 <title>Soaring task planner</title>
<script  src="https://maps.googleapis.com/maps/api/js?key=SECRET"></script>
<script src="lib/infobox.js"></script>
<script src="lib/jquery-2.1.3.min.js"></script>
<script  src="geocalc.js"></script>
<?php
switch ($version) {
case 'world':
  echo "<script  src='xcplan_world.js'></script>\n";
  break;
case 'uk':
   echo "<script  src='xcplan_uk.js'></script>\n";
  break;
default:
    echo "<script  src='xcplan_world.js'></script>\n";
}
?>
<script  src="xcplan.js"></script>
<link rel="stylesheet" href="xcplan.css" />
</head>
<body>
<div id='titlediv'>
    <button id='help'>Help</button>
    <button id='about'>About</button>
<h1>XCWebPlan
<?php
if($version==='uk') {
echo "- UK version";
}
?>
</h1>
    <p>
        A free browser-based tool for planning soaring tasks.
    </p>
      <p> &copy; 2016 Richard Brisbourne </p>
</div>
<noscript>
        <p>
            <strong>Please enable JavaScript to use this application.</strong>
        </p>
    </noscript>
<div id="maincontainer">
<div id="mapwrapper">
<div id="map"></div>
</div>
 <div id="controldiv">
   <p>
   <label for="airclip">Clip airspace above:</label>
        <select id="airclip"  class="inbutton">
           <option value="0">No Airspace</option>
           <option value="3001">3000</option>
            <option value="4501">4500</option>
            <option value="6001" selected>6000</option>
            <option value="9001">9000</option>
            <option value="12001">12000</option>
            <option value="19501">19500</option>
        </select>
        feet
    </p>
    <?php
    if($version==='world') {
   echo " <p id='fileselect'>\n";
    echo "<label for='fileControl'>Select a turning point file:</label>\n";
    echo " <input id='fileControl' type='file' accept='.cup,.dat' />\n</p>\n";
    }
    ?>
  <div id="maincontrol">
    <p>Show waypoints: <input type="radio" name="wpt_vis" value="show" />&nbsp; &nbsp;  Hide waypoints:  <input type="radio" name="wpt_vis" value="hide" />
  </p>
  <p>Show labels: <input type="radio" name="label_vis" value="show" />&nbsp; &nbsp;  Hide labels:  <input type="radio" name="label_vis" value="hide" />
  </p>
<p>Click marker on map to add start/TP/Finish.</p>
<p>Up arrow on list to move TP up, "X" to delete.</p>
<hr />
<table>
<tbody id="tasktab">
</tbody>
</table>
<p id="tasklength"></p>
 <hr />
 <h4>Print:</h4>
 <button id="tasksheet" class="printbutton" disabled>Task Briefing</button><button id="declaration" class="printbutton" disabled>Declaration</button>
<hr>
<div id="zoomto">
<h4>Zoom to waypoint</h4>
<p>
<?php
if($version==='uk') {
echo "Enter trigraph: ";
}
else {
echo "Enter first part of name (min 3 characters): ";
}
?>
<input type='text' id='findpt' />&nbsp; <button id='tpzoom'>GO</button></p>
</div>
<hr>
<div id='exportdiv'>
<h4>Export:</h4>
<button id='copytask' class='printbutton' disabled>Copy task</button> to IGCWebview
 </div>
    </div>
   </div>
   
  <div id='disclaimer' class='dialogue'>
       <p>
    <b>Warning:</b> Unless the "no airspace" option is selected opposite, outlines of controlled airspace  will be displayed on the map provided we have data for the area.</p>
    <p>This information is for guidance only.  It  may not be accurate,  current or complete and is not valid for navigation or flight planning.   Always consult the official publications for current and correct information. 
    </p>
    <p>Also note only controlled airspace in the area covered by the waypoints will be shown.</p>
    <button id='acceptor'>Accept</button>
    </div>
    
    <div id='tpselect' class='dialogue'>
   <h4>Select Waypoint</h4>
   <div id='tpdetail'>
   </div>
   <button id='thistp'>Go</button>
   </div>
    
</body>
</html>



