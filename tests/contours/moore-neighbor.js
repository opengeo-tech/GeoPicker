/**
 * https://en.wikipedia.org/wiki/Moore_neighborhood
 * 
 * Tracciamento isolinea Seed-Based (Moore-Neighbor) a partire da un punto iniziale
 */

//module.exports = async function getMooreNeighborContour(filePath = './tests/data/test_4611_dem.tif', startX, startY) {

const gdal = require('gdal-async');

/* ================= utilities ================= */

function pixelToWorld(px, py, gt) {
  return [
    gt[0] + px * gt[1] + py * gt[2],
    gt[3] + px * gt[4] + py * gt[5]
  ];
}

function worldToPixel(x, y, gt) {
  const det = gt[1] * gt[5] - gt[2] * gt[4];
  if (det === 0) throw new Error('GeoTransform non invertibile');

  const px = Math.floor(
    (gt[5] * (x - gt[0]) - gt[2] * (y - gt[3])) / det
  );
  const py = Math.floor(
    (-gt[4] * (x - gt[0]) + gt[1] * (y - gt[3])) / det
  );

  return [px, py];
}

/**
 * Isolinea tramite Moore-Neighbor a partire da una coordinata
 */
module.exports = async function isolineFromCoordinate(
  rasterPath,
  coord   // [x, y] in CRS del raster
) {
  const ds = gdal.open(rasterPath);
  const band = ds.bands.get(1);
  const gt = ds.geoTransform;

  const width = band.size.x;
  const height = band.size.y;

  // 1 World → Pixel
  const [px, py] = worldToPixel(coord[0], coord[1], gt);

  if (
    px < 0 || py < 0 ||
    px >= width || py >= height
  ) {
    throw new Error('Punto fuori dal raster');
  }

  // 2 quota nel punto
  const isoValue = band.pixels.get(px, py);

  // 3 carica raster
  const data = new Float32Array(width * height);
  band.pixels.read(0, 0, width, height, data);

  const idx = (x, y) => y * width + x;

  // 4 binary mask
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i++) {
    mask[i] = data[i] >= isoValue ? 1 : 0;
  }

  // 5 Moore neighbors (clockwise)
  const N = [
    [-1, -1], [0, -1], [1, -1],
    [1,  0], [1,  1], [0,  1],
    [-1, 1], [-1, 0]
  ];

  // 6 seed sul bordo
  let cx = px;
  let cy = py;
  let pxPrev = px - 1;
  let pyPrev = py;

  // verifica che sia bordo
  let isBorder = false;
  for (const [dx, dy] of N) {
    const nx = cx + dx;
    const ny = cy + dy;
    if (
      nx >= 0 && ny >= 0 &&
      nx < width && ny < height &&
      mask[idx(nx, ny)] === 0
    ) {
      isBorder = true;
      break;
    }
  }

  if (!isBorder) {
    throw new Error('Il punto non cade su una isolinea (pixel interno)');
  }

  // 7 tracing
  const line = [];
  const startX = cx;
  const startY = cy;

  do {
    line.push(pixelToWorld(cx, cy, gt));

    const startDir = N.findIndex(
      ([dx, dy]) => cx + dx === pxPrev && cy + dy === pyPrev
    );

    let found = false;

    for (let i = 1; i <= 8; i++) {
      const dir = (startDir + i) % 8;
      const [dx, dy] = N[dir];
      const nx = cx + dx;
      const ny = cy + dy;

      if (
        nx >= 0 && ny >= 0 &&
        nx < width && ny < height &&
        mask[idx(nx, ny)] === 1
      ) {
        pxPrev = cx;
        pyPrev = cy;
        cx = nx;
        cy = ny;
        found = true;
        break;
      }
    }

    if (!found) break;

  } while (!(cx === startX && cy === startY));

  // 8 GeoJSON
  return {
    type: 'Feature',
    properties: {
      elevation: isoValue
    },
    geometry: {
      type: 'LineString',
      coordinates: line
    }
  };
}