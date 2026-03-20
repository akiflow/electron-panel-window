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
