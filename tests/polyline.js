//text change callback
var geojson = null;
function render() {
  try {
    //update the window location so that we have a proper permalink
    window.history.pushState(null, null, window.location.pathname +
      '?unescape=' + ($('#unescape').is(":checked") ? 'true' : 'false') +
      '&polyline6=' + ($('#polyline6').is(":checked") ? 'true' : 'false') +
      '#' + encodeURIComponent($("#encoded_polyline").val()));
    //if they have escaped escapes
    var encoded = $('#unescape').is(":checked") ?
        $("#encoded_polyline").val().replace(/\\\\/g, '\\') :
        $("#encoded_polyline").val();
    if(encoded.length == 0)
      return;
    //if they want 6 digits of precision
    var mul = $('#polyline6').is(":checked") ? 1e6 : 1e5;
    //decode it
    var decoded = decode(encoded, mul);
    //update the display
    $('#decoded_polyline').val(JSON.stringify(decoded));
    $('#cardinality').val(decoded.length);
    //clear this if its not null
    if(geojson != null)
      geojson.removeFrom(map);
    //turn this into geojson
    var json = {
      type:'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: decoded
        },
        properties: {}
      }]
    };
    geojson = L.geoJson(json,{ style: function(feature) { 
      return { fillColor: feature.properties.fill,
        color: '#9900CC',
        opacity: 0.75,
        weight: 7,
      };
    }});
    //render the geojson
    geojson.addTo(map);
    //fit it in view
    map.fitBounds(L.GeoJSON.coordsToLatLngs(decoded));
  }
  catch(e){
    alert('Invalid Encoded Polyline');
  }
};

//hook up the callback
$("#encoded_polyline").on('keyup', render);
$('#unescape').change(render);
$('#polyline6').change(render);

//Check if we should initialize from anchor
window.onload = function () {
  //parse query params
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for(var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    //assume you want to escape some polyline that was from json
    if(decodeURIComponent(pair[0]) == 'unescape')
      $("#unescape").prop("checked", decodeURIComponent(pair[1]) != 'false');
    //assume you dont want polyline6
    else if(decodeURIComponent(pair[0]) == 'polyline6')
      $("#polyline6").prop("checked", decodeURIComponent(pair[1]) == 'true');
  }
  //parse the anchor
  var idx = window.location.href.indexOf("#");
  var url_encoded = idx == -1 ? '' : window.location.href.substring(idx+1);
  var polyline = decodeURIComponent(url_encoded);
  $("#encoded_polyline").val(polyline);
  //show it if there is something to show
  if(polyline.length > 0)
    render();
};
