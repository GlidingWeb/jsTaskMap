 
  function showpoint(point) {
    var latdegrees = Math.abs(point.latitude);
    var latdegreepart = Math.floor(latdegrees);
    var latminutepart = 60 * (latdegrees - latdegreepart);
    var latdir = (point.latitude > 0) ? "N" : "S";
    var lngdegrees = Math.abs(point.longitude);
    var lngdegreepart = Math.floor(lngdegrees);
    var lngminutepart = 60 * (lngdegrees - lngdegreepart);
    var lngdir = (point.longitude > 0) ? "E" : "W";
    var retstr = latdegreepart.toString() + "&deg;" + latminutepart.toFixed(3) + "&prime;" + latdir + " " + lngdegreepart.toString() + "&deg;" + lngminutepart.toFixed(3) + "&prime;" + lngdir;
    return retstr;
  }
 
  function leginfo(start, end) {
      var EQUATOR= 6378.137;   //earth radius at equator
      var POLAR=6356.172;        //earth radius at poles
     var lat1 = start['latitude'] * Math.PI / 180;
      var lat2 = end['latitude'] * Math.PI / 180;
      var lon1 = start['longitude'] * Math.PI / 180;
      var lon2 = end['longitude'] * Math.PI / 180;
      var deltaLon = (end['longitude'] - start['longitude']) * Math.PI / 180;
      var flattening= (EQUATOR-POLAR)/EQUATOR;
      var tanU1=(1-flattening)*Math.tan(lat1);   //U is reduced latitude
      var cosU1= 1 / Math.sqrt(1 + tanU1*tanU1);
      var sinU1 = tanU1 * cosU1;
      var tanU2=(1-flattening)*Math.tan(lat2);   //U is reduced latitude
      var cosU2= 1 / Math.sqrt(1 + tanU2*tanU2);
      var sinU2 = tanU2 * cosU2;
       var lambda1=deltaLon;
      var lambda2;
      var iteration=0;
      var sinLambda;
      var cosLambda;
      var sinsq;
      var cossq;
      var sigma;
      var sinSigma;
      var cosSigma;
      var sinAlpha;
      var cos2M;
      var c;
      
      do {
        sinLambda= Math.sin(lambda1);
        cosLambda=Math.cos(lambda1);
        sinsq=(cosU2*sinLambda) * (cosU2*sinLambda) + (cosU1*sinU2-sinU1*cosU2*cosLambda) * (cosU1*sinU2-sinU1*cosU2*cosLambda);
         sinSigma = Math.sqrt(sinsq);
       if (sinSigma===0) {
           return 0;  // co-incident points
       }
      cosSigma = sinU1*sinU2 + cosU1*cosU2*cosLambda;
       sigma = Math.atan2(sinSigma, cosSigma);
      sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
       cossq = 1 - sinAlpha*sinAlpha;
      cos2M = cosSigma - 2*sinU1*sinU2/cossq;
      if (isNaN(cos2M)) { 
           cos2M = 0; 
      }
    C = flattening/16*cossq*(4+flattening*(4-3*cossq));
    lambda2 = lambda1;
    lambda1 = deltaLon + (1-C) * flattening* sinAlpha * (sigma + C*sinAlpha*(cos2M+C*cosSigma*(-1+2*cos2M*cos2M)));
    iteration++;
 }
      while ((Math.abs(lambda2-lambda1)  > 1e-12) && (iteration < 20));
    if (iteration > 19) {
        alert("Distance out of range: check coordinates");
    }
    var uSq = cossq* (EQUATOR*EQUATOR - POLAR*POLAR) / (POLAR*POLAR);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
    var deltaSigma= B*sinSigma*(cos2M+B/4*(cosSigma*(-1+2*cos2M*cos2M)-   B/6*cos2M*(-3+4*sinSigma*sinSigma)*(-3+4*cos2M*cos2M)));

     var d = POLAR*A*(sigma-deltaSigma);
     var fwdAz = Math.atan2(cosU2*sinLambda,  cosU1*sinU2-sinU1*cosU2*cosLambda);  //initial bearing
     var brng=Math.round((360 + fwdAz* 180 / Math.PI) % 360);
     //var revAz = Math.atan2(cosU1*sinLambda, -sinU1*cosU2+cosU1*sinU2*cosλ); //final bearing
      return {
      distance: d,
      bearing: brng
    };
  }

