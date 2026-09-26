/* eslint-disable */
const sharp = require('sharp');
const ImageTracer = require('imagetracerjs');
const fs = require('fs');
const path = require('path');

async function run() {
  const inputPath = path.join(__dirname, '..', 'public', 'svg-vector', 'knight.png');
  const svgOutputPath = path.join(__dirname, '..', 'public', 'svg-vector', 'knight.svg');
  const faviconSvgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
  const appIconSvgPath = path.join(__dirname, '..', 'app', 'icon.svg');
  const appFaviconIcoPath = path.join(__dirname, '..', 'app', 'favicon.ico');
  const testPngPath = path.join(__dirname, '..', 'public', 'svg-vector', 'knight_test.png');

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });

  const imgData = {
    width: info.width,
    height: info.height,
    data: data
  };

  // Exact palette extracted from knight.png
  const palette = [
    { r: 0, g: 0, b: 0, a: 0 },         // Transparent
    { r: 255, g: 201, b: 111, a: 255 }, // #ffc96f (Main warm yellow body)
    { r: 240, g: 145, b: 123, a: 255 }, // #f0917b (Coral pink mane & base)
    { r: 255, g: 220, b: 164, a: 255 }, // #ffdca4 (Light cream highlight)
    { r: 255, g: 178, b: 52, a: 255 },  // #ffb234 (Amber gold shadow)
    { r: 232, g: 107, b: 77, a: 255 },  // #e86b4d (Mane ridges)
    { r: 245, g: 183, b: 170, a: 255 }, // #f5b7aa (Light pink base center)
  ];

  const options = {
    colorsampling: 2,
    pal: palette,
    colorquantcycles: 1,
    mincolorratio: 0,
    ltres: 0.1,
    qtres: 0.1,
    pathomit: 1,
    blurradius: 0,
    roundcoords: 2,
    viewbox: true,
    desc: false
  };

  let svgStr = ImageTracer.imagedataToSVG(imgData, options);

  // Filter out any paths with fill matching rgba(0,0,0,0) or fill="none"
  svgStr = svgStr.replace(/<path[^>]*fill="rgba\(0,0,0,0\)"[^>]*\/>/g, '');
  svgStr = svgStr.replace(/<path[^>]*fill="rgba\(0,\s*0,\s*0,\s*0\)"[^>]*\/>/g, '');

  // Add standard SVG attributes and xmlns
  if (!svgStr.includes('xmlns=')) {
    svgStr = svgStr.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  }

  // Save to public/svg-vector/knight.svg
  fs.writeFileSync(svgOutputPath, svgStr);
  console.log('Saved knight.svg to', svgOutputPath);

  // Save to public/favicon.svg and app/icon.svg
  fs.writeFileSync(faviconSvgPath, svgStr);
  fs.writeFileSync(appIconSvgPath, svgStr);
  console.log('Saved favicon.svg and app/icon.svg');

  // Also generate 32x32, 48x48, 64x64, 192x192 PNG favicons and ico!
  const png32 = await sharp(Buffer.from(svgStr)).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon-32x32.png'), png32);
  
  const png192 = await sharp(Buffer.from(svgStr)).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'android-chrome-192x192.png'), png192);

  const pngApple = await sharp(Buffer.from(svgStr)).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'), pngApple);

  // Generate app/favicon.ico from 32x32 png
  fs.writeFileSync(appFaviconIcoPath, png32);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), png32);
  console.log('Generated favicon.ico (32x32)');

  // Render test PNG to verify
  await sharp(Buffer.from(svgStr)).resize(512, 512).png().toFile(testPngPath);
  console.log('Rendered test PNG to', testPngPath);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
