var { app, BrowserWindow, globalShortcut } = require('electron')
var electronPanelWindow = require('../../')
var path = require('path')
var isE2ETest = process.env.PANEL_WINDOW_E2E === '1'

var panelWindow = null
var mainWindow = null

app.on('ready', function () {

  mainWindow = new BrowserWindow({
    width: 1000,
    minWidth: 500,
    minHeight: 500,
    fullscreenable: false,
    paintWhenInitiallyHidden: true,
    show: false,
    frame: false,
    transparent: false,
    titleBarStyle: 'default',
    minimizable: true,
    maximizable: true,
    closable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      backgroundThrottling: false,
    },
  })

  mainWindow.loadURL('file://' + __dirname + '/index.html')
  mainWindow.on('ready-to-show', function () {
    mainWindow.showInactive()
  })

  panelWindow = new BrowserWindow({
    width: 100,
    minWidth: 100,
    minHeight: 100,
    paintWhenInitiallyHidden: true,
    show: false,
    frame: false,
    transparent: true,
    minimizable: false,
    maximizable: false,
    closable: false,
    alwaysOnTop: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      backgroundThrottling: false,
    },
  })
  panelWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  electronPanelWindow.makePanel(panelWindow)
  panelWindow.setSize(200, 200)

  panelWindow.loadURL('file://' + __dirname + '/index.html')
  panelWindow.on('ready-to-show', function () {
    panelWindow.showInactive()
  })

  function showPanel () {
    panelWindow.showInactive()
    electronPanelWindow.makeKeyWindow(panelWindow)
    if (isE2ETest) {
      setTimeout(() => {
        if (!panelWindow || panelWindow.isDestroyed() || !panelWindow.isVisible()) {
          console.log('PANEL_WINDOW_NOT_VISIBLE')
          app.exit(1)
          return
        }
        console.log('PANEL_WINDOW_READY')
        app.quit()
      }, 200)
    }

  }

  function hidePanel () {
    panelWindow.hide()
  }

  globalShortcut.unregisterAll()
  const shortcutRegistered = globalShortcut.register('cmd+shift+e', function () {
    if (panelWindow.isVisible()) {
      hidePanel()
    } else {
      showPanel()
    }
  })
  if (!shortcutRegistered) {
    console.warn('Global shortcut registration failed (cli)')
  }

  if (isE2ETest) {
    panelWindow.once('ready-to-show', function () {
      showPanel()
    })
  } else {
    setTimeout(() => {
      showPanel()
    }, 1000)
  }

  let closable = false
  app.on('before-quit', (e) => {
    if (!closable) {
      closable = true
      electronPanelWindow.makeWindow(panelWindow)
      setTimeout(() => {
        mainWindow.setClosable(true)
        panelWindow.setClosable(true)
        app.quit()
      })
      e.preventDefault()
    }
  })
})
