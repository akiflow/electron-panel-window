var { app, BrowserWindow, globalShortcut } = require('electron')
var electronPanelWindow = require('../../')
var nativeExtension = require('../../build/Release/NativeExtension')
var path = require('path')
var isE2ETest = process.env.PANEL_WINDOW_E2E === '1'
var e2eScenario = process.env.PANEL_WINDOW_E2E_SCENARIO || 'show-panel'
var isNonactivatingPanelScenario = e2eScenario === 'nonactivating-panel'

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
    focusable: !isNonactivatingPanelScenario,
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

  function reportFailure (marker, message) {
    if (message) {
      console.error(message)
    }
    console.log(marker)
    app.exit(1)
  }

  function reportSuccess (marker) {
    if (panelWindow && !panelWindow.isDestroyed()) {
      panelWindow.hide()
      electronPanelWindow.makeWindow(panelWindow)
    }
    console.log(marker)
    app.exit(0)
  }

  function runQuitFlowScenario () {
    if (!panelWindow || panelWindow.isDestroyed()) {
      reportFailure('PANEL_WINDOW_QUIT_FLOW_FAILED', 'Panel window is not available for quit-flow scenario.')
      return
    }

    if (!mainWindow || mainWindow.isDestroyed()) {
      reportFailure('PANEL_WINDOW_QUIT_FLOW_FAILED', 'Main window is not available for quit-flow scenario.')
      return
    }

    // Exercise repeated transitions so the E2E covers the idempotent native paths.
    electronPanelWindow.makePanel(panelWindow)
    panelWindow.hide()
    electronPanelWindow.makeKeyWindow(mainWindow)
    electronPanelWindow.makeWindow(panelWindow)
    electronPanelWindow.makeWindow(panelWindow)
    panelWindow.setClosable(true)

    panelWindow.once('closed', function () {
      console.log('PANEL_WINDOW_QUIT_FLOW_OK')
      app.exit(0)
    })

    setTimeout(function () {
      if (panelWindow && !panelWindow.isDestroyed()) {
        reportFailure('PANEL_WINDOW_QUIT_FLOW_FAILED', 'Panel window did not close after makeWindow().')
      }
    }, 1000)

    panelWindow.close()
  }

  function runNonactivatingPanelScenario () {
    var windowInfo = nativeExtension.GetWindowInfo(panelWindow.getNativeWindowHandle())
    var isNonactivating = windowInfo &&
      windowInfo.isPanel &&
      !windowInfo.hasTitledStyle &&
      windowInfo.hasNonactivatingPanelStyle &&
      !windowInfo.canBecomeKeyWindow &&
      !windowInfo.canBecomeMainWindow &&
      !panelWindow.isFocused()

    if (!isNonactivating) {
      reportFailure(
        'PANEL_WINDOW_NONACTIVATING_FAILED',
        `Unfocusable panel became activating: ${JSON.stringify({ ...windowInfo, isFocused: panelWindow.isFocused() })}`
      )
      return
    }

    // Chromium sends this selector on the BrowserWindow.showInactive() path
    // (Electron >= 43); losing it in the class swap crashes the whole app
    // with an unrecognized-selector exception.
    if (!windowInfo.respondsToOrderFrontKeepWindowKeyState) {
      reportFailure(
        'PANEL_WINDOW_NONACTIVATING_FAILED',
        `Panel lost the orderFrontKeepWindowKeyState selector Chromium calls on showInactive(): ${JSON.stringify(windowInfo)}`
      )
      return
    }

    // The WindowServer-side tag is what actually stops a click on the panel
    // from activating the app; the styleMask bit alone is not honored for
    // class-swapped windows. null means the private API probe is unavailable.
    if (windowInfo.preventsActivation === false) {
      reportFailure(
        'PANEL_WINDOW_NONACTIVATING_FAILED',
        `makePanel() did not set the WindowServer prevents-activation tag: ${JSON.stringify(windowInfo)}`
      )
      return
    }
    if (windowInfo.preventsActivation === null) {
      console.warn('preventsActivation introspection unavailable on this macOS version; tag assertion skipped')
    }

    electronPanelWindow.makeWindow(panelWindow)
    var revertedInfo = nativeExtension.GetWindowInfo(panelWindow.getNativeWindowHandle())
    if (!revertedInfo || revertedInfo.isPanel !== false) {
      reportFailure(
        'PANEL_WINDOW_NONACTIVATING_FAILED',
        `makeWindow() did not restore the original window class: ${JSON.stringify(revertedInfo)}`
      )
      return
    }
    if (revertedInfo.preventsActivation === true) {
      reportFailure(
        'PANEL_WINDOW_NONACTIVATING_FAILED',
        `makeWindow() did not clear the WindowServer prevents-activation tag: ${JSON.stringify(revertedInfo)}`
      )
      return
    }

    reportSuccess('PANEL_WINDOW_NONACTIVATING_OK')
  }

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
        if (e2eScenario === 'quit-flow') {
          runQuitFlowScenario()
          return
        }
        if (e2eScenario === 'nonactivating-panel') {
          runNonactivatingPanelScenario()
          return
        }
        // Cycle through the showInactive() path again: on Electron >= 43 it
        // reaches orderFrontKeepWindowKeyState, which panels must implement.
        panelWindow.hide()
        panelWindow.showInactive()
        if (!panelWindow.isVisible()) {
          console.log('PANEL_WINDOW_NOT_VISIBLE')
          app.exit(1)
          return
        }
        reportSuccess('PANEL_WINDOW_READY')
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
    if (isE2ETest) {
      return
    }

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
