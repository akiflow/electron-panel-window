#include "functions.h"

using v8::FunctionTemplate;


NAN_MODULE_INIT(InitAll) {
  Nan::Set(target, Nan::New("MakePanel").ToLocalChecked(),
    Nan::GetFunction(Nan::New<FunctionTemplate>(MakePanel)).ToLocalChecked());
  Nan::Set(target, Nan::New("MakeWindow").ToLocalChecked(),
    Nan::GetFunction(Nan::New<FunctionTemplate>(MakeWindow)).ToLocalChecked());
  Nan::Set(target, Nan::New("MakeKeyWindow").ToLocalChecked(),
    Nan::GetFunction(Nan::New<FunctionTemplate>(MakeKeyWindow)).ToLocalChecked());
}

NODE_MODULE(NativeExtension, InitAll)
