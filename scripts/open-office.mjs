import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(new URL('../src/assets/office.svg', import.meta.url))
const editor = spawn('inkscape', [filename], { stdio: 'inherit' })
editor.on('error', (error) => {
  console.error(`Could not open Inkscape: ${error.message}`)
  process.exitCode = 1
})
editor.on('exit', (code) => { process.exitCode = code ?? 1 })
