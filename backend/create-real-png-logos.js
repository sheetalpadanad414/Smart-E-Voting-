const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

/**
 * Create Real-Looking PNG Party Logos
 * This creates circular logos with party colors and text
 */

const PARTY_LOGOS = {
  'bjp.png': {
    name: 'BJP',
    color: '#FF9933', // Saffron
    textColor: '#FFFFFF'
  },
  'aap.png': {
    name: 'AAP',
    color: '#0064C8', // Blue
    textColor: '#FFFFFF'
  },
  'democratic.png': {
    name: 'DEM',
    color: '#0015BC', // Blue
    textColor: '#FFFFFF'
  },
  'republican.png': {
    name: 'REP',
    color: '#E81B23', // Red
    textColor: '#FFFFFF'
  },
  'green.png': {
    name: 'GRN',
    color: '#17AA5C', // Green
    textColor: '#FFFFFF'
  },
  'independent.png': {
    name: 'IND',
    color: '#808080', // Gray
    textColor: '#FFFFFF'
  },
  'default.png': {
    name: 'DEF',
    color: '#4B5563', // Dark gray
    textColor: '#FFFFFF'
  }
};

async function createPNGLogos() {
  const uploadsDir = path.join(__dirname, 'uploads');
  const size = 200; // 200x200px
  
  console.log('🎨 Creating PNG party logos...\n');
  
  for (const [filename, config] of Object.entries(PARTY_LOGOS)) {
    const filepath = path.join(uploadsDir, filename);
    
    // Skip if file already exists and is larger than 1KB (real logo)
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > 1000) {
        console.log(`⏭️  Skipping ${filename} (real logo exists, ${stats.size} bytes)`);
        continue;
      }
    }
    
    try {
      // Create canvas
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw circular background
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Add subtle gradient
      const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw text
      ctx.fillStyle = config.textColor;
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.name, size / 2, size / 2);
      
      // Save as PNG
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filepath, buffer);
      
      console.log(`✓ Created ${filename} (${buffer.length} bytes)`);
    } catch (error) {
      console.error(`❌ Failed to create ${filename}:`, error.message);
    }
  }
  
  console.log('\n✅ PNG logos created successfully!');
}

// Check if canvas module is available
try {
  require.resolve('canvas');
  createPNGLogos().then(() => {
    console.log('\n📋 All party logos are ready!');
    console.log('Location: backend/uploads/');
    console.log('\n💡 To use real logos:');
    console.log('1. Download official party logos');
    console.log('2. Resize to 200x200px (or similar)');
    console.log('3. Save as PNG with exact filenames above');
    console.log('4. Replace the generated files');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
} catch (error) {
  console.log('⚠️  Canvas module not installed.');
  console.log('\nTo create PNG logos automatically, install canvas:');
  console.log('  npm install canvas\n');
  console.log('Or manually create PNG logos:');
  console.log('1. Create 200x200px PNG images');
  console.log('2. Use party colors and add text/symbols');
  console.log('3. Save with these exact names:');
  Object.keys(PARTY_LOGOS).forEach(filename => {
    console.log(`   - ${filename}`);
  });
  console.log('4. Place in: backend/uploads/\n');
  process.exit(0);
}
