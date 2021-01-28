var { app, BrowserWindow } = require('electron');
var electronPanelWindow = require('../../');
var path = require('path')

var mainWindow = null;

app.on('ready', function () {
  mainWindow = new BrowserWindow({

    width: 100,
    minWidth: 100,
    minHeight: 100,
    fullscreenable: false,
    paintWhenInitiallyHidden: true,
    show: false,
    frame: false,
    transparent: true,
    // Hack below: https://github.com/electron/electron/issues/15008#issuecomment-497498135
    titleBarStyle: "customButtonsOnHover",
    minimizable: false,
    maximizable: false,
    closable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      backgroundThrottling: false,
    },
  });
  electronPanelWindow.makePanel(mainWindow)
  mainWindow.setSize(100, 100)

  mainWindow.loadURL('file://' + __dirname + '/index.html')
  mainWindow.on('ready-to-show', function () {
    mainWindow.showInactive();
  });


  electronPanelWindow.makeKeyWindow(mainWindow);
  setTimeout(() => {
    console.log('makeWindow')
    electronPanelWindow.makeWindow(mainWindow)
    app.dock.hide()
    setTimeout(() => {
    //  mainWindow.closable=true
    //  mainWindow.close()
    }, 2000)
  }, 2000)

})