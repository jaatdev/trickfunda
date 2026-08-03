const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const binDir = path.join(__dirname, 'bin');

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir);
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function setup() {
  try {
    const ytDlpPath = path.join(binDir, 'yt-dlp.exe');
    await download('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', ytDlpPath);
    console.log('Downloaded yt-dlp.exe');

    const ffmpegZipPath = path.join(binDir, 'ffmpeg.zip');
    await download('https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip', ffmpegZipPath);
    console.log('Downloaded ffmpeg.zip');

    console.log('Extracting ffmpeg...');
    // using powershell to just extract since downloading failed, but extraction might work
    execSync(`powershell -Command "Expand-Archive -Path '${ffmpegZipPath}' -DestinationPath '${path.join(binDir, 'ffmpeg_ext')}' -Force"`);
    
    fs.renameSync(
      path.join(binDir, 'ffmpeg_ext', 'ffmpeg-master-latest-win64-gpl', 'bin', 'ffmpeg.exe'),
      path.join(binDir, 'ffmpeg.exe')
    );
    fs.renameSync(
      path.join(binDir, 'ffmpeg_ext', 'ffmpeg-master-latest-win64-gpl', 'bin', 'ffprobe.exe'),
      path.join(binDir, 'ffprobe.exe')
    );

    console.log('Cleaning up...');
    fs.unlinkSync(ffmpegZipPath);
    fs.rmSync(path.join(binDir, 'ffmpeg_ext'), { recursive: true, force: true });
    
    console.log('Setup complete!');
  } catch (err) {
    console.error('Setup failed:', err);
  }
}

setup();
