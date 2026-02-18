#ifndef NATIVE_EXTENSION_GRAB_H
#define NATIVE_EXTENSION_GRAB_H

#include <node.h>
#include <node_buffer.h>
#include <v8.h>

void MakePanel(const v8::FunctionCallbackInfo<v8::Value>& info);
void MakeKeyWindow(const v8::FunctionCallbackInfo<v8::Value>& info);
void MakeWindow(const v8::FunctionCallbackInfo<v8::Value>& info);

#endif
