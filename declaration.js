(function($) {
 'use strict';
 function showroute(task) {
     var i;
     var row;
    var tpref;
   for(i=0; i < task.length; i++) {
    switch(i) {
            case 0:
                tpref="Start";
                break;
            case task.length-1:
                tpref="Finish";
                break;
            default: 
                tpref="Waypoint " + i.toString();
        }
        row= "<tr><th>"  + tpref + ":</th><td>"+ task[i].tpname + "</td><td>"+showpoint(task[i]) + "</td></tr>";
        $('#route').append(row);
   }
 }
 
 $(document).ready(function () {
$('#datepick').dcalendarpicker({format:'w dd mmm yyyy'});
showroute(window.opener.taskdetail);
$("#printme").click(function(){
     window.print();
       });
$("#closeme").click(function() {
     window.close();
       });
});
  }(jQuery));
