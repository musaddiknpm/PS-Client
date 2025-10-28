/**
 * - Checks if local data is stale.
 * - Updates using Tools.update() if needed.
 * - Allows opt-out with PS_CLIENT_NO_AUTOUPDATE=1.
 */

const fs = require('fs');
const path = require('path');
const Tools = require('./tools.js');

const UPDATE_THRESHOLD = 24 * 60 * 60 * 1000;
const TIMESTAMP_FILE = path.join(__dirname, 'showdown', '.lastupdate');

function shouldUpdate() {
  try {
    const last = fs.readFileSync(TIMESTAMP_FILE, 'utf8');
    const lastTime = new Date(parseInt(last));
    return (Date.now() - lastTime.getTime()) > UPDATE_THRESHOLD;
  } catch (err) {
    return true;
  }
}

async function updateIfNeeded() {
  if (process.env.PS_CLIENT_NO_AUTOUPDATE === '1') {
    console.log('[ps-client] Auto-update skipped due to PS_CLIENT_NO_AUTOUPDATE=1');
    return;
  }
  if (shouldUpdate()) {
    try {
      await Tools.update();
      fs.writeFileSync(TIMESTAMP_FILE, Date.now().toString());
      console.log('[ps-client] Datacenter data updated automatically.');
    } catch (e) {
      console.warn('[ps-client] Warning: Automatic datacenter update failed:', e.message);
    }
  }
}

module.exports = { updateIfNeeded };
