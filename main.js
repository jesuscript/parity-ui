'use strict';
var app = require('app');
var BrowserWindow = require('browser-window');
var mainWindow = null;

app.on('ready', function() {
  mainWindow = new BrowserWindow({ height: 700, width: 700, frame: true });
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



