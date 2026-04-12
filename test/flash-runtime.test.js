const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const {
  DEFAULT_FLASH_ALLOWLIST_PATTERNS,
  buildFlashMmsConfig,
  getFlashPluginPath,
  getFlashPluginVersion,
  getFlashSystemDir,
} = require('../flash-runtime');

test('getFlashSystemDir resolves the PPAPI System directory inside userData', () => {
  const userDataPath = path.join('/Users/example', 'Library/Application Support', 'mac-roco-client');

  assert.equal(
    getFlashSystemDir(userDataPath),
    path.join(userDataPath, 'Pepper Data', 'Shockwave Flash', 'System')
  );
});

test('buildFlashMmsConfig enables the EOL allowlist workaround for roco domains', () => {
  const config = buildFlashMmsConfig();

  assert.match(config, /^AutoUpdateDisable=1$/m);
  assert.match(config, /^EOLUninstallDisable=1$/m);
  assert.match(config, /^EnableAllowList=1$/m);
  assert.match(config, /^AllowListRootMovieOnly=1$/m);

  for (const pattern of DEFAULT_FLASH_ALLOWLIST_PATTERNS) {
    assert.match(config, new RegExp(`^AllowListUrlPattern=${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'));
  }
});

test('getFlashPluginPath falls back to the repo plugin when process.resourcesPath is unavailable', () => {
  const baseDir = path.join(__dirname, '..');

  assert.equal(
    getFlashPluginPath(baseDir, undefined),
    path.join(baseDir, 'plugins', 'PepperFlashPlayer.plugin')
  );
});

test('getFlashPluginVersion reads CFBundleShortVersionString from the bundled plugin metadata', () => {
  const pluginPath = path.join(
    __dirname,
    '..',
    'plugins',
    'PepperFlashPlayer.plugin'
  );

  assert.match(getFlashPluginVersion(pluginPath), /^\d+\.\d+\.\d+\.\d+$/);
});
