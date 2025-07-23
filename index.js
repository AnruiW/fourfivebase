const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    title: 'Markdown Editor',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
  // 打开开发者工具
  mainWindow.webContents.openDevTools();
}

ipcMain.handle('save-file', async (event, content) => {
  const { filePath } = await dialog.showSaveDialog({
    title: '保存Markdown文件',
    defaultPath: path.join(app.getPath('documents'), 'untitled.md'),
    filters: [{
      name: 'Markdown Files',
      extensions: ['md', 'markdown']
    }]
  });

  if (filePath) {
    try {
      await fs.promises.writeFile(filePath, content);
      return { success: true };
    } catch (err) {
      console.error('保存文件错误:', err);
      throw new Error('无法保存文件: ' + err.message);
    }
  }
  return { success: false };
});

ipcMain.handle('open-file', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: '打开Markdown文件',
    filters: [{
      name: 'Markdown Files',
      extensions: ['md', 'markdown']
    }],
    properties: ['openFile']
  });

  if (filePaths.length > 0) {
    try {
      const content = await fs.promises.readFile(filePaths[0], 'utf-8');
      return content;
    } catch (err) {
      console.error('打开文件错误:', err);
      throw new Error('无法打开文件: ' + err.message);
    }
  }
  return null;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});