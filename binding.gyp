{
    "targets": [
        {
            "target_name": "NativeExtension",
            "sources": [ ],
            'cflags_cc': ['-std=c++20'],
            "include_dirs" : [
 	 			      "<!(node -e \"require('nan')\")"
			      ],
            "link_settings": {
              "conditions":[
                  ['OS=="mac"', {
                      "sources": [
                          "NativeExtension.mm" ,
                          "functions_mac.mm"
                      ],
                      "libraries": [
                          'Foundation.framework',
                          'AppKit.framework',
                          'ScriptingBridge.framework'
                      ]
                  }
              ]]
            },
            "xcode_settings": {
                "OTHER_CFLAGS": [
                    "-x objective-c++ -stdlib=libc++"
                ],
                "CLANG_CXX_LANGUAGE_STANDARD": "c++20",
                "MACOSX_DEPLOYMENT_TARGET": "10.13"
            }
        }
    ],
}