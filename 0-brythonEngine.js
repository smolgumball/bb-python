const doc = globalThis['document']
const win = globalThis['window']

/** @param { import("~/ns").NS } ns */
export async function main(ns) {
  let brythonScripts = [
    'https://cdn.jsdelivr.net/npm/brython@3/brython.min.js',
    'https://cdn.jsdelivr.net/npm/brython@3/brython_stdlib.js',
  ]

  if (win.__BRYTHON__) {
    ns.tprint('Brython is already installed.\nWaiting for scripts to be run...')
    registerBrythonHandler()
  } else {
    // Build script tags
    let numLoaded = 0
    for (const src of brythonScripts) {
      let scriptTag = doc.createElement('script')
      scriptTag.src = src
      scriptTag.async = false
      scriptTag.onload = () => (numLoaded = numLoaded + 1)
      doc.head.appendChild(scriptTag)
      await ns.sleep(200)
    }

    // Wait for loaded scripts
    let timedOut = false
    let timeStart = performance.now()
    const timeoutMs = 8000
    const scriptWatcher = setInterval(() => {
      if (performance.now() - timeStart >= timeoutMs)
        timedOut = { after: performance.now() - timeStart }

      if (numLoaded < 2 && timedOut === false) return

      if (timedOut) {
        clearInterval(scriptWatcher)
        throw new Error(`Timed out after ${timedOut.after / 1000}s while loading Brython`)
      }

      registerBrythonHandler()
      clearInterval(scriptWatcher)
    }, 150)
  }

  ns.tprint('Brython installed and waiting for scripts...\nYou can "run 1-brythonUsage.js" now! 🐍')
}

function registerBrythonHandler() {
  // Wait for brython script events and execute as needed
  doc.addEventListener('runBrython', handleRunBrython)
}

async function handleRunBrython(e) {
  // Validate
  if (e.detail && e.detail.brythonScript && e.detail.brythonScriptId && e.detail.ns) {
    // Save NS
    if (!win.__brythonNs) win.__brythonNs = {}
    win.__brythonNs[e.detail.brythonScriptId] = e.detail.ns

    // Run Brython script
    eval(win.__BRYTHON__.python_to_js(e.detail.brythonScript))
  } else {
    console.error('runBrython command did not have necessary event details', e)
  }
}
