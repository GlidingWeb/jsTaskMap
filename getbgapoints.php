<?php
require_once("../db_inc.php");
$mysqli=new mysqli($dbserver,$username,$password,$database);
$output=array();
$result=$mysqli->query("SELECT trigraph,tpname,latitude,longitude,detail FROM tpoints");
while($row=$result->fetch_object()) {
  array_push($output,$row);
}
echo json_encode($output,JSON_NUMERIC_CHECK);
?>