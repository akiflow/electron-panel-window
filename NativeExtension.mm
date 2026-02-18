#include "functions.h"

using v8::FunctionTemplate;
using v8::Local;
using v8::Object;
using v8::String;

void InitAll(Local<Object> exports, Local<v8::Value> module, Local<v8::Context> context, void* priv) {
      v8::Isolate* isolate = v8::Isolate::GetCurrent();

  exports
      ->Set(context, String::NewFromUtf8(isolate, "MakePanel").ToLocalChecked(),
            FunctionTemplate::New(isolate, MakePanel)->GetFunction(context).ToLocalChecked())
      .Check();
  exports
      ->Set(context, String::NewFromUtf8(isolate, "MakeWindow").ToLocalChecked(),
            FunctionTemplate::New(isolate, MakeWindow)->GetFunction(context).ToLocalChecked())
      .Check();
  exports
      ->Set(context, String::NewFromUtf8(isolate, "MakeKeyWindow").ToLocalChecked(),
            FunctionTemplate::New(isolate, MakeKeyWindow)->GetFunction(context).ToLocalChecked())
      .Check();
}

NODE_MODULE_CONTEXT_AWARE(NativeExtension, InitAll)
