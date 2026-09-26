const fs = require('fs');
const path = require('path');
const https = require('https');

const destDir = path.join(__dirname, '..', 'public', 'textures', '3d');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const polyFiles = [
  'https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/chess_set/chess_set_board_diff_1k.jpg',
  'https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/chess_set/chess_set_board_nor_gl_1k.jpg',
  'https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/chess_set/chess_set_board_arm_1k.jpg',
  'https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/chess_set/chess_set_pieces_white_diff_1k.jpg',
  'https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/chess_set/chess_set_pieces_black_diff_1k.jpg'
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`Already exists: ${path.basename(dest)}`);
      return resolve();
    }
    console.log(`Downloading: ${path.basename(dest)}...`);
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        return https.get(res.headers.location, (redRes) => {
          redRes.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const url of polyFiles) {
    const filename = path.basename(url);
    const dest = path.join(destDir, filename);
    await downloadFile(url, dest);
  }
  console.log('All Poly Haven textures downloaded successfully!');
}

main().catch(console.error);
