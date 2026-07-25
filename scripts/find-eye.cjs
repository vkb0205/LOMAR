const fs = require('fs');
const zlib = require('zlib');

function getPNGBoundingBox(filePath) {
  const buf = fs.readFileSync(filePath);
  
  // Verify signature
  if (buf.readUInt32BE(0) !== 0x89504E47 || buf.readUInt32BE(4) !== 0x0D0A1A0A) {
    throw new Error('Not a PNG file');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let idatChunks = [];

  while (offset < buf.length) {
    if (offset + 8 > buf.length) break;
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    
    if (type === 'IHDR') {
      width = buf.readUInt32BE(offset + 8);
      height = buf.readUInt32BE(offset + 12);
    } else if (type === 'IDAT') {
      idatChunks.push(buf.subarray(offset + 8, offset + 8 + length));
    } else if (type === 'IEND') {
      break;
    }
    
    offset += 12 + length;
  }

  const idatBuf = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(idatBuf);

  // Reconstruct scanlines
  const bytesPerPixel = 4; // Assuming RGBA
  const rowBytes = width * bytesPerPixel;
  const stride = rowBytes + 1;
  const pixels = Buffer.alloc(width * height * bytesPerPixel);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    const filterType = decompressed[rowOffset];
    const prevRowOffset = (y - 1) * stride;

    for (let x = 0; x < rowBytes; x++) {
      const rawByte = decompressed[rowOffset + 1 + x];
      const a = x >= bytesPerPixel ? pixels[y * rowBytes + x - bytesPerPixel] : 0;
      const b = y > 0 ? pixels[(y - 1) * rowBytes + x] : 0;
      const c = (y > 0 && x >= bytesPerPixel) ? pixels[(y - 1) * rowBytes + x - bytesPerPixel] : 0;

      let reconstructedByte = 0;
      if (filterType === 0) {
        reconstructedByte = rawByte;
      } else if (filterType === 1) {
        reconstructedByte = (rawByte + a) & 0xFF;
      } else if (filterType === 2) {
        reconstructedByte = (rawByte + b) & 0xFF;
      } else if (filterType === 3) {
        reconstructedByte = (rawByte + Math.floor((a + b) / 2)) & 0xFF;
      } else if (filterType === 4) {
        let p = a + b - c;
        let pa = Math.abs(p - a);
        let pb = Math.abs(p - b);
        let pc = Math.abs(p - c);
        let pr = 0;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        else pr = c;
        reconstructedByte = (rawByte + pr) & 0xFF;
      }

      pixels[y * rowBytes + x] = reconstructedByte;
    }
  }

  // Find bounding box of non-transparent pixels (alpha > 0)
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = pixels[(y * width + x) * bytesPerPixel + 3];
      if (alpha > 5) { // alpha threshold
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Bounding Box for ${filePath}:`);
  console.log(`Min X: ${minX}, Max X: ${maxX}`);
  console.log(`Min Y: ${minY}, Max Y: ${maxY}`);
  console.log(`Center X: ${(minX + maxX) / 2}, Center Y: ${(minY + maxY) / 2}`);
  console.log(`Width: ${maxX - minX}, Height: ${maxY - minY}`);
  console.log(`Percentage coordinates:`);
  console.log(`Left: ${((minX + maxX) / 2 / width * 100).toFixed(2)}%`);
  console.log(`Top: ${((minY + maxY) / 2 / height * 100).toFixed(2)}%`);
  console.log(`Width: ${( (maxX - minX) / width * 100).toFixed(2)}%`);
  console.log(`Height: ${( (maxY - minY) / height * 100).toFixed(2)}%`);
}

getPNGBoundingBox('src/assets/images/mascot_eye.png');
