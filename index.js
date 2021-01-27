var BrowserWindow = require('electron').BrowserWindow;
var NativeExtension = require('bindings')('NativeExtension');

module.exports = {
  makeKeyWindow: function(window) {
    return NativeExtension.MakeKeyWindow(window.getNativeWindowHandle());
  },
  makePanel: function(window) {
    return NativeExtension.MakePanel(window.getNativeWindowHandle());
  },
  makeWindow: function(window) {
    return NativeExtension.MakePanel(window.getNativeWindowHandle());
  }
}