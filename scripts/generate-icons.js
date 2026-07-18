// Generate favicon and icon files from brand icon
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const iconSrc = path.join(__dirname, '..', 'public', 'icon-brand.jpg');
  
  // 1. Generate 512x512 PNG for manifest + app/icon.png
  await sharp(iconSrc)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icon.png'));
  console.log('✓ public/icon.png (512x512)');

  // 2. Generate app/icon.png (Next.js auto-favicon)
  await sharp(iconSrc)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(__dirname, '..', 'app', 'icon.png'));
  console.log('✓ app/icon.png (512x512)');

  // 3. Generate apple-touch-icon
  await sharp(iconSrc)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(__dirname, '..', 'app', 'apple-icon.png'));
  console.log('✓ app/apple-icon.png (180x180)');

  // 4. Convert logo to PNG 
  const logoSrc = path.join(__dirname, '..', 'public', 'logo.jpg');
  await sharp(logoSrc)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'logo.png'));
  console.log('✓ public/logo.png');

  // 5. Remove the old favicon.ico (Next.js icon.png takes priority)
  const oldFavicon = path.join(__dirname, '..', 'app', 'favicon.ico');
  if (fs.existsSync(oldFavicon)) {
    fs.unlinkSync(oldFavicon);
    console.log('✓ Removed old app/favicon.ico');
  }

  console.log('\nDone! Icon and logo assets generated.');
}

main().catch(console.error);
