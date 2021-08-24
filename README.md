# electron-panel-window

This fork of [electron-panel-window](https://github.com/goabstract/electron-panel-window).
It works on macOS *big sur* (tested).
It works with *electron 13*. (tested).

**There are few caveats.**

### 1. `titleBarStyle` should have the value `'customButtonsOnHover'`
This will show two buttons on top left (to close and maximize the window). You can hide them by setting:
* `closable: false`
* `maximizable: false`

Beware that you may need some additional logic if you actually need to close the window, as `win.close()` won't work at this point. (you can check the test to see how we did this)

This looks no longer necessary in version 3.

### 2. `setVisibleOnAllWorkspaces(true)` cannot be used on these windows
Apparently it causes everything to crash.

### 3. Crash on quit
There are usually some electron crash when quitting an app with a panel window.
Usually they can be fixed by:
1. hiding the panel window
2. make another window as key (use `makeKeyWindow` on another window)
3. transform the panel in a normal window (use `makeWindow`)
4. close the window
5. quit the app

We have noticed less/no crashes if steps 2-5 are execture after a setTimout like:
```javascript
win.hide()
setTimeout(()=>{
    electronPanelWindow.makeKeyWindow(otherWin)
    electronPanelWindow.makeWindow(win)
    win.close()
    app.quit()
})
```

## Other
Removed win and linux support as it was empty in the first place.

You may want to include the package dynamically:
```
const electronPanelWindow = process.platform === 'darwin' ? require('electron-panel-window') : undefined
```

### Issues
Feel free to open an issue, and report other "workarounds" to keep this working.

# Methods
Install

```bash
npm install @akiflow/electron-panel-window
```

require

```bash
const electronPanelWindow = process.platform === 'darwin' ? require('@akiflow/electron-panel-window') : undefined
```

1. `makeKeyWindow(win)` focus the window without activating the application
2. `makePanel(win)` transform the given window in a panel
3. `makeWindow(win)` transform the given panel in a window (useful before quitting)

# Credits
* [Akiflow Team](https://akiflow.com)
* [rcclerigo](https://github.com/rcclerigo)
* [Abstract](https://www.abstract.com/)

---

### Old README of electron-panel-window
Something may be useful, something may be outdated

You can find it here: [https://github.com/goabstract/electron-panel-window/](https://github.com/goabstract/electron-panel-window/)