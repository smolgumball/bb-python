const doc = globalThis['document']
const win = globalThis['window']

/** @param { import("~/ns").NS } ns */
export async function main(ns) {
  // Populate this with every ns.* function used to avoid dynamic ram errors
  let ramNotifications = [ns.getServer]

  // Ensure every script is ID'd for the brythonEngine
  const brythonScriptId = crypto.randomUUID()

  // Python code to be sent to Brython
  // NOTE: Python is whitespace-sensitive, so keep your script indented properly
  const brythonScript = `
from browser import window, bind, html, aio
from browser.widgets.dialog import Dialog

async def main():
  brythonScriptId = "${brythonScriptId}"
  ns = window.__brythonNs[brythonScriptId]
  ns.tprint('Hello from NS inside Brython!')

  # Attempt async in Brython
  ns.tprint('Waiting 2s...')
  await ns.sleep(2000)
  ns.tprint('I slept for 2s... 💤')
  homeServer = ns.getServer("home")

  # Info box with customized "Ok" button
  d1 = Dialog('Hello from bb-python 🐍', ok_cancel=['Got it!', 'Whatever...'])
  d1.panel <= html.DIV('Your brythonScriptId is '
                       f'{brythonScriptId}. Your home server info is:'
                       f'{window.JSON.stringify(homeServer)}',
                       style=dict(maxWidth='400px', lineBreak='anywhere'))

  @bind(d1.ok_button, "click")
  def ok(ev):
    d1.close()
    window.__brythonNs[brythonScriptId] = { 'complete': True, 'result': homeServer }

  @bind(d1.cancel_button, "click")
  def cancel(ev):
    d1.close()
    window.__brythonNs[brythonScriptId] = { 'complete': True, 'result': 'Fine, be that way 😢' }

  @bind(d1.close_button, "click")
  def close(ev):
    d1.close()
    window.__brythonNs[brythonScriptId] = { 'complete': True, 'result': 'Window closed ❌' }

aio.run(main())
  `

  // Let the brythonEngine know we have a script to run
  doc.dispatchEvent(
    new CustomEvent('runBrython', { detail: { brythonScriptId, brythonScript, ns } })
  )

  // Wait for brythonEngine to finish executing our script
  while (!win.__brythonNs || !win.__brythonNs[brythonScriptId]?.complete) {
    await ns.asleep(50)
  }

  // If we arrive here (past the while loop), we know Brython has executed our script
  ns.tprint('Printing results:')
  ns.tprint(JSON.stringify(win.__brythonNs[brythonScriptId].result, null, '  '))
  ns.tprint('Brython script ended...')

  // Script now exits
}
