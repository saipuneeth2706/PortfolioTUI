#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BINARY_NAME = 'portfoliotui';

function getBinaryName() {
  if (process.platform === 'win32') {
    return `${BINARY_NAME}.exe`;
  }
  return BINARY_NAME;
}

function getBinaryPath() {
  const binaryName = getBinaryName();
  const localPath = path.join(__dirname, binaryName);
  const binDirPath = path.join(__dirname, 'bin', binaryName);

  if (fs.existsSync(localPath)) {
    return localPath;
  }
  if (fs.existsSync(binDirPath)) {
    return binDirPath;
  }

  // Fall back to PATH lookup in case the binary was installed globally
  return binaryName;
}

function run() {
  const binaryPath = getBinaryPath();

  if (!binaryPath || (binaryPath === BINARY_NAME && !fs.existsSync(binaryPath))) {
    console.error(
      `portfoliotui: Binary not found.\n` +
      `Please run "npx portfoliotui" again (postinstall should download it),\n` +
      `or reinstall with: npm install -g portfoliotui`
    );
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const result = spawnSync(binaryPath, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  if (result.error) {
    console.error(`portfoliotui: Failed to run binary: ${result.error.message}`);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

run();