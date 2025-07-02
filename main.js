const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// 适配开发环境和打包后环境的Flash插件路径
function getFlashPluginPath() {
  // 打包后，插件应放在 resources/plugins/PepperFlashPlayer.plugin
  const prodPath = path.join(process.resourcesPath, 'app/plugins', 'PepperFlashPlayer.plugin');
  // 开发环境，插件在项目根目录 plugins/PepperFlashPlayer.plugin
  const devPath = path.join(__dirname, 'plugins', 'PepperFlashPlayer.plugin');
  // 判断哪个路径存在
  const fs = require('fs');
  if (fs.existsSync(prodPath)) {
    return prodPath;
  } else {
    return devPath;
  }
}

let version = '34.0.0.330';
app.commandLine.appendSwitch('ppapi-flash-path', getFlashPluginPath());
app.commandLine.appendSwitch('ppapi-flash-version', version);
app.commandLine.appendSwitch('--disable-http-cache');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: '洛克王国 for Mac (旧内核实验版)',
    webPreferences: {
      // ★★★ 关键改动：必须开启插件支持 ★★★
      plugins: true,
      nodeIntegration: false, // 在旧版Electron中，安全起见更应如此设置
      contextIsolation: true,
    },
  });

  // 注意：在旧版内核下，之前解决CORS和SSL问题的代码可能不再需要，
  // 因为旧内核的安全策略本身就比较宽松。可以先尝试不加。
  mainWindow.loadURL('https://17roco.qq.com');

  // ★★★ 禁止网页滚动 ★★★
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      document.body.style.overflow = 'hidden';
      document.addEventListener('wheel', e => e.preventDefault(), { passive: false });
      document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    `);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});