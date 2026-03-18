const fs = require('fs');
const path = require('path');

// Create proper 50x50 PNG images with solid colors
const createColoredPNG = (color) => {
  // PNG header
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk (50x50, 8-bit RGB)
  const ihdr = Buffer.from([
    0x00, 0x00, 0x00, 0x0D, // Length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x32, // Width: 50
    0x00, 0x00, 0x00, 0x32, // Height: 50
    0x08, 0x02, 0x00, 0x00, 0x00, // 8-bit RGB
    0x91, 0x5D, 0x1F, 0xE6  // CRC
  ]);
  
  // Create IDAT chunk with colored pixels
  const width = 50;
  const height = 50;
  const bytesPerPixel = 3; // RGB
  const rowBytes = 1 + (width * bytesPerPixel); // 1 byte filter + pixel data
  
  const pixelData = Buffer.alloc(height * rowBytes);
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowBytes;
    pixelData[rowStart] = 0; // Filter type: None
    
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + (x * bytesPerPixel);
      pixelData[pixelStart] = color.r;
      pixelData[pixelStart + 1] = color.g;
      pixelData[pixelStart + 2] = color.b;
    }
  }
  
  // Compress with zlib (simplified - just store uncompressed)
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(pixelData);
  
  const idatLength = Buffer.alloc(4);
  idatLength.writeUInt32BE(compressed.length, 0);
  
  const idatType = Buffer.from('IDAT');
  const idatData = compressed;
  
  // Calculate CRC for IDAT
  const crc = require('buffer-crc32');
  const idatCrc = crc(Buffer.concat([idatType, idatData]));
  
  const idat = Buffer.concat([idatLength, idatType, idatData, idatCrc]);
  
  // IEND chunk
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // Length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return Buffer.concat([header, ihdr, idat, iend]);
};

const colors = {
  'aap.png': { r: 0, g: 100, b: 200 },      // Blue
  'bjp.png': { r: 255, g: 153, b: 51 },     // Orange
  'congress.png': { r: 0, g: 150, b: 255 }, // Light Blue
  'democratic.png': { r: 0, g: 100, b: 200 }, // Blue
  'republican.png': { r: 200, g: 0, b: 0 },  // Red
  'green.png': { r: 0, g: 150, b: 0 },       // Green
  'independent.png': { r: 128, g: 128, b: 128 }, // Gray
  'default.png': { r: 100, g: 100, b: 100 }  // Dark Gray
};

console.log('\n=== Creating Proper Logo Images ===\n');

const uploadsDir = path.join(__dirname, 'uploads');

for (const [filename, color] of Object.entries(colors)) {
  try {
    const png = createColoredPNG(color);
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, png);
    console.log(`✓ Created: ${filename} (${png.length} bytes)`);
  } catch (error) {
    console.error(`✗ Failed: ${filename} - ${error.message}`);
  }
}

console.log('\n=== Images Created Successfully ===');
console.log('\nTest: http://localhost:5000/uploads/aap.png');
console.log('View: http://localhost:3000/admin/parties\n');
