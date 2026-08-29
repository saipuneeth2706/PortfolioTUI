const fs = require('fs');
const path = require('path');
const https = require('https');

const BINARY_NAME = 'portfoliotui';
const GITHUB_OWNER = 'saipuneeth2706';
const GITHUB_REPO = 'PortfolioTUI';
const BASE_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download`;

function getPlatformInfo() {
  const platform = process.platform;
  const arch = process.arch;
  let assetName;
  let binaryName = BINARY_NAME;

  if (platform === 'linux') {
    if (arch === 'x64') assetName = 'portfoliotui-linux-x64';
    else if (arch === 'arm64') assetName = 'portfoliotui-linux-arm64';
    else throw new Error(`unsupported Linux architecture: ${arch}`);
  } else if (platform === 'darwin') {
    if (arch === 'x64') assetName = 'portfoliotui-macos-x64';
    else if (arch === 'arm64') assetName = 'portfoliotui-macos-arm64';
    else throw new Error(`unsupported macOS architecture: ${arch}`);
  } else if (platform === 'win32') {
    binaryName = `${BINARY_NAME}.exe`;
    if (arch === 'x64') assetName = 'portfoliotui-windows-x64.exe';
    else if (arch === 'arm64') assetName = 'portfoliotui-windows-arm64.exe';
    else throw new Error(`unsupported Windows architecture: ${arch}`);
  } else {
    throw new Error(`unsupported platform: ${platform}`);
  }

  return { platform, arch, assetName, binaryName };
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    const req = https.get(url, (response) => {
      // GitHub redirects to a CDN; follow redirects manually
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        req.destroy();
        return download(response.headers.location, dest).then(resolve, reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    req.on('error', (err) => {
      try { fs.unlinkSync(dest); } catch (_) {}
      reject(err);
    });
    file.on('error', (err) => {
      try { fs.unlinkSync(dest); } catch (_) {}
      reject(err);
    });
  });
}

async function install() {
  const { platform, assetName, binaryName } = getPlatformInfo();
  const binDir = path.join(__dirname, 'bin');
  const binaryPath = path.join(binDir, binaryName);

  if (fs.existsSync(binaryPath) && !process.env.FORCE_REINSTALL) {
    console.log(`portfoliotui: binary already installed, skipping download`);
    return;
  }

  let version;
  try {
    version = `v${require(path.join(__dirname, 'package.json')).version}`;
  } catch (_) {
    version = 'latest';
  }

  const urls = [
    `${BASE_URL}/${version}/${assetName}`,
    `${BASE_URL}/latest/${assetName}`, // fallback if version tag not published yet
  ];

  for (const url of urls) {
    console.log(`portfoliotui: downloading ${url}`);
    try {
      await download(url, binaryPath);
      if (platform !== 'win32') fs.chmodSync(binaryPath, 0o755);
      console.log(`portfoliotui: installed ${binaryName}`);
      return;
    } catch (err) {
      console.log(`portfoliotui: failed (${err.message}), trying next source`);
    }
  }

  console.warn(
    `portfoliotui: could not download the binary. ` +
    `Make sure a GitHub Release exists (tag ${version}) for ${GITHUB_OWNER}/${GITHUB_REPO}.`
  );
}

install();