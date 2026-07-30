var isMac = process.platform === 'darwin';
var NativeExtension = isMac ? require('bindings')('NativeExtension') : undefined;

module.exports = {
  makeKeyWindow: function(window) {
    if (!isMac) return;
    return NativeExtension.MakeKeyWindow(window.getNativeWindowHandle());
  },
  makePanel: function(window) {
    if (!isMac) return;
    return NativeExtension.MakePanel(window.getNativeWindowHandle());
  },
  makeWindow: function(window) {
    if (!isMac) return;
    return NativeExtension.MakeWindow(window.getNativeWindowHandle());
  },
  getWindowInfo: function(window) {
    if (!isMac) return null;
    var windowInfo = NativeExtension.GetWindowInfo(window.getNativeWindowHandle());
    return typeof windowInfo === 'object' && windowInfo !== null ? windowInfo : null;
  }
}
