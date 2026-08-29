module.exports = {
  getBinaryPath() {
    const { spawnSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    const binaryName = process.platform === 'win32' ? 'portfoliotui.exe' : 'portfoliotui';
    const localPath = path.join(__dirname, 'bin', binaryName);

    if (fs.existsSync(localPath)) {
      return localPath;
    }
    return binaryName;
  },
};