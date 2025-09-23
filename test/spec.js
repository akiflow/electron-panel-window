const assert = require('assert')
const fs = require('fs')

const path = require('path')

describe('PanelWindow', function () {
  this.timeout(10000)

  it('module exports expected API structure', function () {
    const indexPath = path.join(__dirname, '..', 'index.js')
    const indexContent = fs.readFileSync(indexPath, 'utf8')
    
    // Check that the main API functions are exported
    assert(indexContent.includes('makeKeyWindow'), 'makeKeyWindow should be exported')
    assert(indexContent.includes('makePanel'), 'makePanel should be exported')
    assert(indexContent.includes('makeWindow'), 'makeWindow should be exported')
    assert(indexContent.includes('module.exports'), 'module should export functions')
  })

  it('handles non-macOS platforms gracefully', function () {
    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    })
    
    try {
      delete require.cache[path.join(__dirname, '..', 'index.js')]
      const electronPanelWindow = require(path.join(__dirname, '..', 'index.js'))
      
      assert(typeof electronPanelWindow.makeKeyWindow === 'function', 'makeKeyWindow should be a function')
      assert(typeof electronPanelWindow.makePanel === 'function', 'makePanel should be a function')
      assert(typeof electronPanelWindow.makeWindow === 'function', 'makeWindow should be a function')
      
      assert(electronPanelWindow.makeKeyWindow({}) === undefined, 'makeKeyWindow should be no-op on non-macOS')
    } finally {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform
      })
    }
  })
})