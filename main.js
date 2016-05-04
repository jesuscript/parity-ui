var app = require('app'),
    expandHomeDir = require('expand-home-dir'),
    BrowserWindow = require('browser-window'),
    path = require("path")

//require('electron-reload')(path.join(__dirname, "lib"));

var stores = require("./app/js/stores")


app.on('ready', function() {
  var mainWindow = new BrowserWindow({
    height: 500,
    width: 850,
    frame: true,
    titleBarStyle: 'hidden-inset'
  });
  mainWindow.loadURL('file://' + __dirname + '/app/index.html');
  mainWindow.openDevTools();
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

var ipc = require("electron").ipcMain;
ipc.on('close-main-window', function () {
  app.quit();
});



