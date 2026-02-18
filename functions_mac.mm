#import <CoreServices/CoreServices.h>
#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <objc/objc-runtime.h>
#include "functions.h"

@interface PROPanel : NSWindow
@end

@implementation PROPanel
- (NSWindowStyleMask)styleMask {
  return NSWindowStyleMaskTexturedBackground | NSWindowStyleMaskResizable | NSWindowStyleMaskFullSizeContentView | NSWindowStyleMaskNonactivatingPanel;
}
- (NSWindowCollectionBehavior)collectionBehavior {
  return NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorFullScreenAuxiliary;
}
- (BOOL)isFloatingPanel {
  return YES;
}
- (NSWindowLevel)level {
  return NSFloatingWindowLevel;
}
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
- (void)removeObserver:(NSObject *)observer forKeyPath:(NSString *)keyPath context:(nullable void *)context {
  // macOS Big Sur attempts to remove an observer for the NSTitlebarView that doesn't exist.
  // This is due to us changing the class from NSWindow -> NSPanel at runtime, it's possible
  // there is assumed setup that doesn't happen. Details of the exception this is avoiding are
  // here: https://github.com/goabstract/electron-panel-window/issues/6
  if ([keyPath isEqualToString:@"_titlebarBackdropGroupName"]) {
    // NSLog(@"removeObserver ignored");
    return;
  }

  if (context) {
    [super removeObserver:observer forKeyPath:keyPath context:context];
  } else {
    [super removeObserver:observer forKeyPath:keyPath];
  }
}
- (void)removeObserver:(NSObject *)observer forKeyPath:(NSString *)keyPath {
  [self removeObserver:observer forKeyPath:keyPath context:NULL];
}
- (void)disableHeadlessMode {
}
@end

Class electronWindowClass;

static bool TryGetMainContentView(
    const v8::FunctionCallbackInfo<v8::Value>& info,
    NSView** mainContentView) {
  if (info.Length() < 1 || !info[0]->IsObject()) {
    info.GetReturnValue().Set(false);
    return false;
  }

  v8::Local<v8::Object> handleBuffer = info[0].As<v8::Object>();
  if (!node::Buffer::HasInstance(handleBuffer)) {
    info.GetReturnValue().Set(false);
    return false;
  }

  if (node::Buffer::Length(handleBuffer) < sizeof(NSView*)) {
    info.GetReturnValue().Set(false);
    return false;
  }

  char* buffer = node::Buffer::Data(handleBuffer);
  if (!buffer) {
    info.GetReturnValue().Set(false);
    return false;
  }

  *mainContentView = *reinterpret_cast<NSView**>(buffer);
  if (!(*mainContentView)) {
    info.GetReturnValue().Set(false);
    return false;
  }

  return true;
}

void MakePanel(const v8::FunctionCallbackInfo<v8::Value>& info) {
  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope scope(isolate);
  NSView* mainContentView = nil;
  if (!TryGetMainContentView(info, &mainContentView)) {
    return;
  }

  electronWindowClass = [mainContentView.window class];

//   NSLog(@"class of main window before = %@", object_getClass(mainContentView.window));

  NSWindow *nswindow = [mainContentView window];
  nswindow.titlebarAppearsTransparent = true;
  nswindow.titleVisibility = (NSWindowTitleVisibility)1;

//   NSLog(@"stylemask = %ld", mainContentView.window.styleMask);

  // Convert the NSWindow class to PROPanel
  object_setClass(mainContentView.window, [PROPanel class]);

//   NSLog(@"class of main window after = %@", object_getClass(mainContentView.window));
//   NSLog(@"stylemask after = %ld", mainContentView.window.styleMask);



  return info.GetReturnValue().Set(true);
}

void MakeKeyWindow(const v8::FunctionCallbackInfo<v8::Value>& info) {
  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope scope(isolate);
  NSView* mainContentView = nil;
  if (!TryGetMainContentView(info, &mainContentView)) {
    return;
  }

  [mainContentView.window makeKeyWindow];
  [mainContentView.window makeMainWindow];
  return info.GetReturnValue().Set(true);
}


void MakeWindow(const v8::FunctionCallbackInfo<v8::Value>& info) {

  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope scope(isolate);
  NSView* mainContentView = nil;
  if (!TryGetMainContentView(info, &mainContentView)) {
    return;
  }

  NSWindow* newWindow = mainContentView.window;

  // Convert the NSPanel class to whatever it was before
  object_setClass(newWindow, electronWindowClass);

  return info.GetReturnValue().Set(true);
}
