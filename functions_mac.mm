#import <CoreServices/CoreServices.h>
#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <objc/objc-runtime.h>
#include "functions.h"

@interface PROPanel : NSWindow
@end

@implementation PROPanel
- (NSWindowStyleMask)styleMask {
  NSWindowStyleMask baseMask = [super styleMask];
  return baseMask | NSWindowStyleMaskTexturedBackground | NSWindowStyleMaskFullSizeContentView | NSWindowStyleMaskNonactivatingPanel;
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
  if ([keyPath isEqualToString:@"_titlebarBackdropGroupName"] ||
      [keyPath isEqualToString:@"backgroundColor"]) {
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

static const void *kOriginalWindowClassKey = &kOriginalWindowClassKey;

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

  NSWindow *nswindow = [mainContentView window];
  if (!nswindow) {
    info.GetReturnValue().Set(false);
    return;
  }

//   NSLog(@"class of main window before = %@", object_getClass(mainContentView.window));

  if ([nswindow isKindOfClass:[PROPanel class]]) {
    return info.GetReturnValue().Set(true);
  }

  Class originalWindowClass = object_getClass(nswindow);
  if (objc_getAssociatedObject(nswindow, kOriginalWindowClassKey) == nil) {
    objc_setAssociatedObject(nswindow,
                             kOriginalWindowClassKey,
                             originalWindowClass,
                             OBJC_ASSOCIATION_ASSIGN);
  }

  nswindow.titlebarAppearsTransparent = true;
  nswindow.titleVisibility = (NSWindowTitleVisibility)1;

//   NSLog(@"stylemask = %ld", mainContentView.window.styleMask);

  // Convert the NSWindow class to PROPanel
  object_setClass(nswindow, [PROPanel class]);

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
  if (!newWindow) {
    info.GetReturnValue().Set(false);
    return;
  }

  if (![newWindow isKindOfClass:[PROPanel class]]) {
    return info.GetReturnValue().Set(true);
  }

  Class originalWindowClass = (Class)objc_getAssociatedObject(newWindow, kOriginalWindowClassKey);
  if (originalWindowClass == Nil) {
    info.GetReturnValue().Set(false);
    return;
  }

  // Convert the NSPanel class to whatever it was before
  object_setClass(newWindow, originalWindowClass);

  return info.GetReturnValue().Set(true);
}
