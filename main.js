'use strict';
var app = require('app'),
    expandHomeDir = require('expand-home-dir'),
    BrowserWindow = require('browser-window'),
    parity = require("./lib/parity"),
    stateStorage = require("./lib/stateStorage"),
    path = require("path"),
    fs = require("fs"),
    mainWindow = null

var appDatadir = path.join(process.env.HOME, ".parity-ui"),
    parityDatadir = path.join(process.env.HOME, ".parity")

if(!fs.existsSync(appDatadir)) fs.mkdirSync(appDatadir)

stateStorage.start(appDatadir)
parity.start({datadir:parityDatadir});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
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

process.on('exit', function(){
  parity.terminate();
});


