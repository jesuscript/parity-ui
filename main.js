'use strict';
var app = require('app'),
    BrowserWindow = require('browser-window'),
    parity = require("./lib/parity"),
    mainWindow = null

parity.start();

app.on('ready', function() {
  mainWindow = new BrowserWindow({ height: 500, width: 700, frame: true });
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

process.on('exit', function(){
  parity.terminate();
});


