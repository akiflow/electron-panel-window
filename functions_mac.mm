#import <CoreServices/CoreServices.h>
#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <objc/objc-runtime.h>

#include "functions.h"

@interface PROPanel : NSPanel
@end

@implementation PROPanel
- (BOOL)canBecomeKeyWindow {
  return YES;
}
- (BOOL)canBecomeMainWindow {
  return YES;
}
- (BOOL)needsPanelToBecomeKey {
  return YES;
}
- (BOOL)acceptsFirstResponder {
  return YES;
}
@end

Class electronWindowClass;

NAN_METHOD(MakePanel) {
  v8::Local<v8::Object> handleBuffer = info[0].As<v8::Object>();
  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope scope(isolate);

  char* buffer = node::Buffer::Data(handleBuffer);
  NSView* mainContentView = *reinterpret_cast<NSView**>(buffer);

  if (!mainContentView)
      return info.GetReturnValue().Set(false);

  //NSLog(object_getClass(mainContentView.window));
  electronWindowClass=[mainContentView.window class];

  // Convert the NSWindow class to NSPanel
  object_setClass(mainContentView.window, [PROPanel class]);

  

  // Ensure that the window is a "non activating panel" which means it won't activate the application
  // when it becomes key.
  mainContentView.window.styleMask |= NSWindowStyleMaskNonactivatingPanel;

  // Ensure that the window can display over the top of fullscreen apps
  [mainContentView.window setCollectionBehavior: NSWindowCollectionBehaviorTransient | NSWindowCollectionBehaviorMoveToActiveSpace | NSWindowCollectionBehaviorFullScreenAuxiliary ];
  [mainContentView.window setLevel:NSFloatingWindowLevel];
  [mainContentView.window setFloatingPanel:YES];
  return info.GetReturnValue().Set(true);
}

NAN_METHOD(MakeKeyWindow) {
  v8::Local<v8::Object> handleBuffer = info[0].As<v8::Object>();
  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope scope(isolate);

  char* buffer = node::Buffer::Data(handleBuffer);
  NSView* mainContentView = *reinterpret_cast<NSView**>(buffer);

  if (!mainContentView)
      return info.GetReturnValue().Set(false);

  [mainContentView.window makeKeyWindow];
  return info.GetReturnValue().Set(true);
}

NAN_METHOD(MakeWindow) {

  v8::Local<v8::Object> handleBuffer = info[0].As<v8::Object>();
  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope scope(isolate);


  char* buffer = node::Buffer::Data(handleBuffer);
  NSView* mainContentView = *reinterpret_cast<NSView**>(buffer);

    if (!mainContentView)
      return info.GetReturnValue().Set(false);

  NSWindow* newWindow = mainContentView.window;
  newWindow.styleMask &= (~NSWindowStyleMaskNonactivatingPanel);


  // Convert the NSPanel class to watherver it was before
  object_setClass(newWindow, electronWindowClass);

  return info.GetReturnValue().Set(true);
}