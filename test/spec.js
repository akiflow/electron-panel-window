const assert = require('assert')
const { spawn } = require('child_process')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('PanelWindow', function () {
  this.timeout(15000)

  it('shows a PanelWindow without crashing', function () {
    return new Promise((resolve, reject) => {
      let appProcess = null
      let stdout = ''
      let stderr = ''
      let settled = false

      function finish(err) {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (appProcess && !appProcess.killed) {
          appProcess.kill('SIGTERM')
        }
        if (err) {
          reject(err)
          return
        }
        resolve()
      }

      const timer = setTimeout(() => {
        finish(new Error(
          'Timed out waiting for PanelWindow readiness signal.\n' +
          `stdout:\n${stdout}\n` +
          `stderr:\n${stderr}`
        ))
      }, 12000)

      const childEnv = {
        ...process.env,
        PANEL_WINDOW_E2E: '1'
      }
      delete childEnv.ELECTRON_RUN_AS_NODE

      appProcess = spawn(electronPath, [path.join(__dirname, 'app')], {
        env: childEnv,
        stdio: ['ignore', 'pipe', 'pipe']
      })

      appProcess.stdout.setEncoding('utf8')
      appProcess.stderr.setEncoding('utf8')

      appProcess.stdout.on('data', (chunk) => {
        stdout += chunk
        if (stdout.includes('PANEL_WINDOW_READY')) {
          finish()
        } else if (stdout.includes('PANEL_WINDOW_NOT_VISIBLE')) {
          finish(new Error('PanelWindow did not become visible.\n' + `stdout:\n${stdout}`))
        }
      })

      appProcess.stderr.on('data', (chunk) => {
        stderr += chunk
      })

      appProcess.on('error', (err) => {
        finish(new Error(`Failed to launch Electron app: ${err.message}`))
      })

      appProcess.on('exit', (code, signal) => {
        if (settled) return
        finish(new Error(
          'Electron app exited before readiness signal.\n' +
          `code: ${code}, signal: ${signal}\n` +
          `stdout:\n${stdout}\n` +
          `stderr:\n${stderr}`
        ))
      })
    }).then(() => {
      assert.ok(true)
    })
  })
})
