const assert = require('assert')
const { spawn } = require('child_process')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

function runE2EApp ({ scenario, successMarker, failureMarker, timeoutMs }) {
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
      resolve({ stdout, stderr })
    }

    const timer = setTimeout(() => {
      finish(new Error(
        `Timed out waiting for ${successMarker}.\n` +
        `stdout:\n${stdout}\n` +
        `stderr:\n${stderr}`
      ))
    }, timeoutMs)

    const childEnv = {
      ...process.env,
      PANEL_WINDOW_E2E: '1',
      PANEL_WINDOW_E2E_SCENARIO: scenario
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
      if (stdout.includes(successMarker)) {
        finish()
      } else if (failureMarker && stdout.includes(failureMarker)) {
        finish(new Error(
          `Electron app reported ${failureMarker}.\n` +
          `stdout:\n${stdout}\n` +
          `stderr:\n${stderr}`
        ))
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
        `Electron app exited before ${successMarker}.\n` +
        `code: ${code}, signal: ${signal}\n` +
        `stdout:\n${stdout}\n` +
        `stderr:\n${stderr}`
      ))
    })
  })
}

describe('PanelWindow', function () {
  this.timeout(15000)

  it('shows a PanelWindow without crashing', function () {
    return runE2EApp({
      scenario: 'show-panel',
      successMarker: 'PANEL_WINDOW_READY',
      failureMarker: 'PANEL_WINDOW_NOT_VISIBLE',
      timeoutMs: 12000
    }).then(() => {
      assert.ok(true)
    })
  })

  it('converts a panel back to a window before close and quit', function () {
    return runE2EApp({
      scenario: 'quit-flow',
      successMarker: 'PANEL_WINDOW_QUIT_FLOW_OK',
      failureMarker: 'PANEL_WINDOW_QUIT_FLOW_FAILED',
      timeoutMs: 12000
    }).then(() => {
      assert.ok(true)
    })
  })
})
