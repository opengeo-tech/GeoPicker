
var cen = [46.0651,11.1528],
    bbox = [4.493408203125001,43.092960677116295,16.896972656250004,48.94415123418794],
  zom =13;

var m = L.marker(cen,{draggable:true})

var d1,d2,d3;
function pickData(loc) {

    d1 && d1.abort();
    d2 && d2.abort();
    d3 && d3.abort();

    const geturl = d => {return `/maps/geo-picker/${d.type}?zone=${d.zone}&lat=${d.lat}&lng=${d.lng}`};

    d1 = $.getJSON(geturl({zone: 'italy', type: 'dem', ...loc}));
    d2 = $.getJSON(geturl({zone: 'italy', type: 'aspect', ...loc}));
    d3 = $.getJSON(geturl({zone: 'italy', type: 'slope', ...loc}));

    var $self = $(m._popup._container);

    $self.addClass('loading');

  $.when(d1, d2, d3).done(function(dem, asp, slo) {

    var data = {
        lat: loc.lat,
        lng: loc.lng,
        dem: dem[0].val,
        aspect: asp[0].val,
        slope: slo[0].val
      },
            text = JSON.stringify(data,"\t",4);

        $self.removeClass('loading');

    m.bindPopup('<pre>'+text+'</pre><a href="#" class="btn-share">Copy</a>').openPopup();

      var c = new ClipboardJS($self.find('.btn-share')[0], {
            text: function() {
              return text;
            }
        }).on('success', function() {
            $self.find('.btn-share').text('Copied!');
            setTimeout(function() {
                $self.find('.btn-share').text('Copy');
            },1000);
        });

  });
}
var baselayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
  subdomains: 'abcd',
  minZoom: 8,
  maxZoom: 16,
  ext: 'png'
});

var map = L.map('map', {
  center: cen,
  zoom: zom,
  layers: [
        m, baselayer
    ]
}).on('click', function(e) {
  m.setLatLng(e.latlng);
  pickData(e.latlng);
});

m.bindPopup('Drag it to pick data!').openPopup();

m.on('drag', debounce(function(e) {

 pickData(e.target.getLatLng())

},25));

$.getJSON('data/italy.geojson').done(geo=>{
  console.log(geo)
  L.geoJSON(geo, {
    style: ({fill:false,color:'red'})
  }).addTo(map)
})

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}