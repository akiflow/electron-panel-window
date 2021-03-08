# electron-panel-window

This fork or electron-panel-window [electron-panel-window](https://github.com/goabstract/electron-panel-window) 
works on macOS big sur (tested).

**There are few caveats.**

### `titleBarStyle` should have the value `'customButtonsOnHover'`
This will show two buttons on top left (to close and maximize the window). You can hide them by setting:
* `closable: false`
* `maximizable: false`

Beware that you may need some additional logic if you actually need to close the window, as `win.close()` won't work at this point.


### `setVisibleOnAllWorkspaces(true)` cannot be used on these windows
Apparently it causes everything to crash.

### Crash on quit
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
### Other
Removed win and linux support as it was empty in the first place.

You may want to include the package dynamically:
```
const electronPanelWindow = process.platform === 'darwin' ? require('electron-panel-window') : undefined
```

### Issues
Feel free to open an issue.


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


# OLD README of electron-panel-window
Something may be useful, something may be outdated

Enables creating a browser window in Electron that behaves like a [Panel](https://developer.apple.com/documentation/appkit/nspanel). Panels are typically used for auxillary windows and do not activate the application – as such they can appear ontop of other apps in the same way as Spotlight or 1Password, for example.

## Usage

Use `PanelWindow` as you would [BrowserWindow](https://electronjs.org/docs/api/browser-window). All of the methods exposed in this module **must be used** on the main process. Using the methods in a renderer process will result in your app crashing.

```javascript
import { PanelWindow } from 'electron-panel-window';

const win = new PanelWindow({
  width: 800,
  height: 600,
  show: false
})

// the window will show without activating the application
win.show();
```

You can also access the utility methods directly:

```javascript
import { remote } from 'electron';
import { makePanel, makeKeyWindow } from 'electron-panel-window';

const currentWindow = remote.getCurrentWindow();

// convert the window to an NSPanel
makePanel(currentWindow);

// focus the window without activating the application
makeKeyWindow(currentWindow);
```

## Development

To compile the extension for the first time, run 

```bash
$ yarn
$ yarn configure
$ yarn build
```

All subsequent builds only need `yarn build`. Tests run in Spectron:

```bash
$ yarn test
```

## Contributing

This project is maintained by [Abstract](https://www.goabstract.com). We are very willing to accept contributions, first please ensure there is a relavant [issue in the tracker](https://github.com/goabstract/electron-panel-window/issues) and an approach has been discussed before beginning to write code – this makes it more likely we will be able to accept your contribution and ensure nobody's time (especially yours!) is wasted.

## Details

File | Contents
-------------|----------------
`NativeExtension.cc` | Represents the top level of the module. C++ constructs that are exposed to javascript are exported here
`functions.cc` | The meat of the extension
`index.js` | The main entry point for the node dependency
`binding.gyp` | Describes the node native extension to the build system (`node-gyp`). If you add source files to the project, you should also add them to the binding file.

## License

This project is under MIT.
See [LICENSE](https://github.com/goabstract/electron-panel-window/blob/master/LICENSE)

