#!/usr/bin/env node
// One-command platform launcher: installs nothing, builds the frontend if
// needed, starts the backend API and the static frontend server (with a
// same-origin /api proxy), and shuts both down together on Ctrl+C.
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const backendDir = path.join(root, 'backend')
const frontendDir = path.join(root, 'frontend', 'AI-SASS')
const distIndex = path.join(frontendDir, 'dist', 'index.html')

const run = (command, args, cwd, label) => {
  const child = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })

  const pipe = (stream) => {
    stream.setEncoding('utf8')
    stream.on('data', (chunk) => {
      process.stdout.write(`[${label}] ${chunk}`)
    })
  }

  pipe(child.stdout)
  pipe(child.stderr)
  return child
}

const children = []

const shutdown = () => {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

const main = () => {
  if (!fs.existsSync(path.join(backendDir, 'node_modules'))) {
    console.error('[setup] backend/node_modules missing. Run: npm run install:all')
    process.exit(1)
  }

  if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
    console.error('[setup] frontend/AI-SASS/node_modules missing. Run: npm run install:all')
    process.exit(1)
  }

  if (!fs.existsSync(distIndex)) {
    console.log('[build] dist/ missing — building frontend...')
    const build = spawn(process.execPath, ['scripts/build.cjs'], { cwd: frontendDir, stdio: 'inherit' })
    build.on('exit', (code) => {
      if (code !== 0) {
        console.error('[build] frontend build failed.')
        process.exit(code)
      }
      startServers()
    })
    return
  }

  startServers()
}

const startServers = () => {
  console.log('[start] launching backend API on :8787 and frontend on :4173 ...')
  children.push(run('npm', ['start'], backendDir, 'backend'))
  children.push(run('npm', ['run', 'preview'], frontendDir, 'frontend'))
  console.log('')
  console.log('  Frontend:  http://127.0.0.1:4173')
  console.log('  API:       http://127.0.0.1:8787/api/health')
  console.log('')
}

main()
