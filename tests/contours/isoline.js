
const CASES = {
  1:  [[0,3]],
  2:  [[3,2]],
  3:  [[0,2]],
  4:  [[1,2]],
  5:  [[0,1], [2,3]], // caso ambiguo
  6:  [[1,3]],
  7:  [[0,1]],
  8:  [[0,1]],
  9:  [[1,3]],
  10: [[0,3], [1,2]], // caso ambiguo
  11: [[1,2]],
  12: [[0,2]],
  13: [[3,2]],
  14: [[0,3]]
};

function worldToPixel(dataset, x, y) {
  const gt = dataset.geoTransform;
  const px = Math.floor((x - gt[0]) / gt[1]);
  const py = Math.floor((y - gt[3]) / gt[5]);
  return { px, py };
}

function interp(x1, y1, v1, x2, y2, v2, z) {
  const t = (z - v1) / (v2 - v1);
  return [
    x1 + t * (x2 - x1),
    y1 + t * (y2 - y1)
  ];
}

/**
 * Traccia isolinea da un punto in una direzione
 */
function traceLine(dataset, location, direction = 1) {
  const gt = dataset.dataset.geoTransform;
  const band = dataset.rasterband;
  const rasterSize = dataset.dataset.rasterSize;
  const visited = new Set();
  const line = [];
  
  // converti location in pixel
  const [startX, startY] = location;
  let { px, py } = worldToPixel(dataset.dataset, startX, startY);
  
  // calcola il value dal pixel iniziale
  const startValue = band.pixels.read(px, py, 1, 1)[0];
  const value = startValue;
  
  let prevEdge = -1;

  let maxIterations = rasterSize.x * rasterSize.y; // limite per evitare loop infiniti
  let iterations = 0;

  while (iterations++ < maxIterations) {
    // controllo bordi
    if (
      px < 0 || py < 0 ||
      px >= rasterSize.x - 1 ||
      py >= rasterSize.y - 1
    ) break;

    const key = `${px},${py}`;
    
    if (visited.has(key)) {
      // già visitata, prova a continuare nella stessa direzione se possibile
      if (prevEdge === 0) py--;
      else if (prevEdge === 1) px++;
      else if (prevEdge === 2) py++;
      else if (prevEdge === 3) px--;
      else break;
      continue;
    }
    visited.add(key);

    // leggi cella 2x2
    const v = band.pixels.read(px, py, 2, 2);
    const v00 = v[0];
    const v10 = v[1];
    const v01 = v[2];
    const v11 = v[3];

    if ([v00,v10,v01,v11].some(Number.isNaN)) {
      // NaN trovato, prova a continuare nella stessa direzione
      if (prevEdge === 0) py--;
      else if (prevEdge === 1) px++;
      else if (prevEdge === 2) py++;
      else if (prevEdge === 3) px--;
      else break;
      continue;
    }

    const idx =
      (v00 > value ? 1 : 0) |
      (v10 > value ? 2 : 0) |
      (v11 > value ? 4 : 0) |
      (v01 > value ? 8 : 0);

    const seg = CASES[idx];
    
    // se non c'è segmento, prova a continuare nella stessa direzione
    if (!seg) {
      // continua nella direzione corrente
      if (prevEdge === 0) py--;
      else if (prevEdge === 1) px++;
      else if (prevEdge === 2) py++;
      else if (prevEdge === 3) px--;
      else break; // nessuna direzione precedente, fermati
      continue;
    }

    // gestione casi ambigui (5 e 10)
    let [e1, e2] = seg[0];
    if (seg.length > 1 && prevEdge >= 0) {
      // scegli il segmento che si connette al precedente
      for (const s of seg) {
        if (s[0] === prevEdge || s[1] === prevEdge) {
          [e1, e2] = s;
          break;
        }
      }
    }

    const x0 = gt[0] + px * gt[1];
    const y0 = gt[3] + py * gt[5];
    const dx = gt[1];
    const dy = gt[5];

    const P = [
      interp(x0,       y0,       v00, x0+dx, y0,       v10, value),
      interp(x0+dx,    y0,       v10, x0+dx, y0+dy,    v11, value),
      interp(x0,       y0+dy,    v01, x0+dx, y0+dy,    v11, value),
      interp(x0,       y0,       v00, x0,    y0+dy,    v01, value)
    ];

    if (direction > 0) {
      line.push(P[e1], P[e2]);
      prevEdge = e2;
    } else {
      line.unshift(P[e2], P[e1]);
      prevEdge = e1;
    }

    // scegli prossima cella
    const nextEdge = direction > 0 ? e2 : e1;
    if (nextEdge === 0) py--;
    else if (nextEdge === 1) px++;
    else if (nextEdge === 2) py++;
    else if (nextEdge === 3) px--;
  }

  return line;
}

/**
 * 
 *  Isolinea tramite Moore-Neighbor a partire da una coordinata e un dataset gdal-async
 * 
 */
module.exports = async function isoline(dataset, loc) {
  const [startX, startY] = loc;

  const value = dataset.locPixel([startX, startY]);
  console.log('isoline()', {startX, startY}, value);

  // traccia in direzione positiva
  const lineForward = traceLine(dataset, loc, 1);
  
  // traccia in direzione negativa (escludendo il punto iniziale)
  const lineBackward = traceLine(dataset, loc, -1);
  
  // combina le due linee
  const line = [...lineBackward, ...lineForward];

  const coordinates = line.map(p => [p[0], p[1]]);
  
  const geojson = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    },
    properties: {
      value
    }
  };

  return geojson;
}
