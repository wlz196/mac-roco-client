const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DEFAULT_FLASH_ALLOWLIST_PATTERNS = [
  'https://17roco.qq.com/',
  'https://web2.17roco.qq.com/',
  'https://res.17roco.qq.com/',
];

function getFlashSystemDir(userDataPath) {
  return path.join(userDataPath, 'Pepper Data', 'Shockwave Flash', 'System');
}

function buildFlashMmsConfig(patterns = DEFAULT_FLASH_ALLOWLIST_PATTERNS) {
  const lines = [
    'AutoUpdateDisable=1',
    'SilentAutoUpdateEnable=0',
    'EOLUninstallDisable=1',
    'EnableAllowList=1',
    'AllowListRootMovieOnly=1',
    ...patterns.map((pattern) => `AllowListUrlPattern=${pattern}`),
    '',
  ];

  return lines.join('\n');
}

async function ensureFlashRuntimeConfig(userDataPath, patterns = DEFAULT_FLASH_ALLOWLIST_PATTERNS) {
  const systemDir = getFlashSystemDir(userDataPath);
  const configPath = path.join(systemDir, 'mms.cfg');

  await fsp.mkdir(systemDir, { recursive: true });
  await fsp.writeFile(configPath, buildFlashMmsConfig(patterns), 'utf8');

  return configPath;
}

function getFlashPluginPath(baseDir = __dirname, resourcesPath = process.resourcesPath) {
  const devPath = path.join(baseDir, 'plugins', 'PepperFlashPlayer.plugin');
  const prodPath = resourcesPath
    ? path.join(resourcesPath, 'app', 'plugins', 'PepperFlashPlayer.plugin')
    : null;

  return prodPath && fs.existsSync(prodPath) ? prodPath : devPath;
}

function getFlashPluginVersion(pluginPath) {
  const infoPlistPath = path.join(pluginPath, 'Contents', 'Info.plist');
  const plist = fs.readFileSync(infoPlistPath, 'utf8');
  const match = plist.match(
    /<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/
  );

  if (!match) {
    throw new Error(`Unable to read Flash plugin version from ${infoPlistPath}`);
  }

  return match[1];
}

module.exports = {
  DEFAULT_FLASH_ALLOWLIST_PATTERNS,
  buildFlashMmsConfig,
  ensureFlashRuntimeConfig,
  getFlashPluginPath,
  getFlashPluginVersion,
  getFlashSystemDir,
};
