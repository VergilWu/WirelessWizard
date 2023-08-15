const { app, BrowserWindow, Menu, screen, dialog } = require('electron');
const path = require('path');

// 单例模式，防止多次打开应用
const gotTheLock = app.requestSingleInstanceLock();

// 是否是生产环境
const isPackaged = app.isPackaged;

// 禁止显示默认菜单
Menu.setApplicationMenu(null);

// 主窗口
let mainWindow;

const createWindow = () => {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    // 默认窗口标题，可以在页面中通过document.title来修改
    title: "Electron Vue3.0",
    // width: 800,
    // height: 600,
    // 设置窗口尺寸为屏幕工作区大小
    width: screen.getPrimaryDisplay().workAreaSize.width,
    height: screen.getPrimaryDisplay().workAreaSize.height,
    // 设置最小窗口尺寸
    minWidth: 800,
    minHeight: 600,
    // 设置窗口是否可以改变尺寸
    resizable: true,
    // 设置窗口是否在任务栏中显示图标
    icon: path.resolve(__dirname, "../build/icons/favicon.ico"),
  });

  // 开发环境下打开调试工具
  if (!isPackaged) {
    mainWindow.webContents.openDevTools();
  };

  // mainWindow.loadURL("http://localhost:3005/");
  // mainWindow.loadURL(`file://${path.join(__dirname, '../dist/index.html')}`);

  function load() {
    mainWindow.loadURL(isPackaged ? `file://${path.join(__dirname, '../dist/index.html')}` : "http://localhost:3005/");
  };

  if (isPackaged) {
    mainWindow.webContents.on('did-fail-load', () => {
      load();
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
      event.preventDefault();
      load();
    });

    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key.toLowerCase() === 'f12') {
        mainWindow.webContents.toggleDevTools();
      }
      mainWindow.webContents.setIgnoreMenuShortcuts(
        input.key.toLowerCase() === "f5" ||
        (input.control && input.key.toLowerCase() === "r") ||
        (input.meta && input.key.toLowerCase() === "r")
      );
    });
  };

  load();

  // 当 window 被关闭，这个事件会被触发
  mainWindow.on('close', (event) => {
    event.preventDefault();
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '提示',
      defaultId: 0,
      cancelId: 1,
      message: '确定要退出吗？',
      buttons: ['确定', '取消'],
    }).then((res) => {
      if (res.response === 0) {
        app.exit(0);
      }
    });
  });
};

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});

app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活
  if (process.platform !== 'darwin') app.quit()
});

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
};
