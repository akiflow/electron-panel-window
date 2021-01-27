{
    "targets": [
        {
            "target_name": "NativeExtension",
            "sources": [ "NativeExtension.mm" ],
            "include_dirs" : [
 	 			      "<!(node -e \"require('nan')\")"
			      ],
            "link_settings": {
              "conditions":[
                  ["OS=='linux'", {
                      "sources": [
                        "functions_linux.mm"
                      ]
                  }],
                  ["OS=='win'", {
                      "sources": [
                        "functions_win.mm"
                      ]
                  }],
                  ['OS=="mac"', {
                      "sources": [
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
                ]
            }
        }
    ],
}