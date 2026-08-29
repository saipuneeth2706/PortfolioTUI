const fs = require('fs');
const os = require('os');
const path = require('path');

const BINARY_NAME = 'portfoliotui';
const GITHUB_OWNER = 'saipuneeth2706';
const GITHUB_REPO = 'PortfolioTUI';
const BASE_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download`;
const LATEST_BASE_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download`;

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

function getVersion() {
  try {
    return `v${require(path.join(__dirname, '..', 'package.json')).version}`;
  } catch (_) {
    return null;
  }
}

function getCacheDir() {
  const platform = process.platform;
  if (platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA || os.homedir(), 'portfoliotui');
  }
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Caches', 'portfoliotui');
  }
  return path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'portfoliotui');
}

function getBinaryPath() {
  const { binaryName } = getPlatformInfo();
  const version = getVersion() || 'latest';
  const binaryPath = path.join(getCacheDir(), version, binaryName);
  return fs.existsSync(binaryPath) ? binaryPath : null;
}

module.exports = {
  BINARY_NAME,
  GITHUB_OWNER,
  GITHUB_REPO,
  BASE_URL,
  LATEST_BASE_URL,
  getPlatformInfo,
  getVersion,
  getCacheDir,
  getBinaryPath,
};