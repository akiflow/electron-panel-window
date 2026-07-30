# 10.2.0
- implement `orderFrontKeepWindowKeyState` on `PROPanel`: Chromium 150 (Electron 43) sends it from the `BrowserWindow.showInactive()` path, and the class swap dropped the original implementation, crashing the app with `NSInvalidArgumentException` (Sentry DESKTOP-APP-KV6)
- set the WindowServer "prevents activation" tag in `makePanel()` (cleared in `makeWindow()`): the NSWindowStyleMaskNonactivatingPanel bit reported by the styleMask getter is only synced to the WindowServer during real NSPanel initialization, so class-swapped panels were still activating the app on click (AKI-10880)
- expose `getWindowInfo(window)` from the JS API, now also reporting `isPanel`, `preventsActivation` and `respondsToOrderFrontKeepWindowKeyState`

# 10.1.1
- keep frameless nonactivating panels from retaining a hidden activating title bar
- preserve Electron's `focusable` behavior when converting a window to a panel

# 10.1.0
- update Electron target and test dependency to v43.1.0
- document Electron 43.1.0 support in README

# 10.0.1
- guard `PROPanel.removeObserver(...)` against `backgroundColor` teardown on recent macOS versions
- store the original window class per window instead of using a global class slot
- make `MakePanel` and `MakeWindow` idempotent to avoid invalid state transitions
- clarify in the README that panel windows must be converted back with `makeWindow()` before `close()` or `destroy()`

# 10.0.0
- update Electron target to v40.4.1
- align test/start scripts to Yarn (`yarn build`) for CI consistency
- document Electron 40.x support in README

# 4.1.0
- fixes mac build
- update electron target to v21.3.0


# 4.0.0
- **BREAKING**: build using electron target v21.2.3
- updated dependencies


# 3.2.1
- initial release
