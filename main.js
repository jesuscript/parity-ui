var app = require('app'),
    BrowserWindow = require('browser-window'),
    path = require("path")

//require('electron-reload')(path.join(__dirname, "lib"));


app.on('ready', function() {
  var stores = require("./app/js/stores")(path.join(process.env.HOME, ".parity-ui"), function(err){
    if(err) throw err

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
  })
  
  var ipc = require("electron").ipcMain;
  ipc.on('close-main-window', function () {
    app.quit();
  });

});







