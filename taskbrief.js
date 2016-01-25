 (function($) {
   'use strict';  
   function showtask(task) {
     var i;
     var row;
     var tpref;
     var taskdistance = 0;
     var bearing = "";
     var leglength = "";
     var showlength = "";
     var legdata;
    for (i = 0; i < task.length; i++) {
       switch (i) {
         case 0:
           tpref = "Start";
           break;
         case task.length - 1:
           tpref = "Finish";
           break;
         default:
           tpref = "TP" + i.toString();
       }
       row = "<tr><td>" + tpref + "</td><td>" + task[i].trigraph + "</td><td>" + task[i].tpname + "</td><td>" + showpoint(task[i]);
       if (i > 0) {
         legdata = leginfo(task[i - 1], task[i]);
         leglength = legdata.distance;
         taskdistance += leglength;
         showlength = leglength.toFixed(1) + " Km";
         bearing = legdata.bearing + "&deg;";
       }
       row += "</td><td>" + bearing + "</td><td>" + showlength + "</td><td>" + task[i].detail + "</td></tr>";
       $('#tasklist').append(row);
     }
     $('#tasklength').text("Total distance " + taskdistance.toFixed(1) + " Km");
   }

   $(document).ready(function() {
     $('#datepick').dcalendarpicker({
       format: 'w dd mmmm yyyy'
     });
     showtask(window.opener.taskdetail);
     $("#printme").click(function() {
       window.print();
     });
     $("#closeme").click(function() {
       window.close();
     });
   });
 }(jQuery));
