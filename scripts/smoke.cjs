const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const { once } = require('node:events')
const { mkdtemp, rm } = require('node:fs/promises')
const { tmpdir } = require('node:os')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const children = []
const launch = (script, cwd, env, marker) => {
  const child = spawn(process.execPath, [script], { cwd, env: { ...process.env, ...env }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  children.push(child)
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timed out')), 20_000)
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk
      if (output.includes(marker)) { clearTimeout(timeout); resolve(output) }
    })
    child.stderr.on('data', (chunk) => { output += chunk })
    child.on('error', (error) => { clearTimeout(timeout); reject(error) })
    child.on('exit', () => { clearTimeout(timeout); reject(new Error(`Server exited: ${output}`)) })
  })
}

const main = async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'quickai-smoke-'))
  try {
    const backend = await launch('src/server.js', path.join(root, 'backend'), {
      PORT: '0', NODE_ENV: 'development', ALLOW_DEMO_AUTH: 'true', DATA_DIR: directory,
      ANTHROPIC_API_KEY: '', OPENAI_API_KEY: '', CLERK_SECRET_KEY: '',
    }, 'AI SaaS backend listening')
    const backendPort = backend.match(/127\.0\.0\.1:(\d+)/)[1]
    const frontend = await launch('scripts/preview.cjs', path.join(root, 'frontend', 'AI-SASS'), {
      PORT: '0', HOST: '127.0.0.1', API_PROXY_ORIGIN: `http://127.0.0.1:${backendPort}`,
    }, 'Frontend preview:')
    const frontendPort = frontend.match(/127\.0\.0\.1:(\d+)/)[1]
    const base = `http://127.0.0.1:${frontendPort}`
    for (const route of ['/', '/ai/writearticle', '/ai/removebackground', '/unknown']) {
      const page = await fetch(`${base}${route}`)
      assert.equal(page.status, 200)
      const html = await page.text()
      assert.ok(html.includes('src="/assets/main.js"'))
      for (const resource of ['/assets/main.js', '/assets/styles.css', '/assets/favicon.svg']) {
        const asset = await fetch(new URL(resource, `${base}${route}`))
        assert.equal(asset.status, 200)
        assert.ok(!asset.headers.get('content-type').includes('text/html'))
      }
    }
    assert.equal((await fetch(`${base}/assets/missing.js`)).status, 404)
    assert.equal((await (await fetch(`${base}/api/health`)).json()).ok, true)
    const response = await fetch(`${base}/api/ai/title`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-user-id': 'smoke-user' },
      body: JSON.stringify({ keyword: 'Local smoke test', category: 'Startup' }),
    })
    assert.equal(response.status, 200)
    const creations = await (await fetch(`${base}/api/creations`, { headers: { 'x-user-id': 'smoke-user' } })).json()
    assert.equal(creations.creations.length, 1)
    console.log('Smoke tests passed: frontend, nested routes, static assets, API proxy, generation, persistence.')
  } finally {
    await Promise.all(children.map(async (child) => {
      if (child.exitCode !== null) return
      const stopped = once(child, 'exit')
      child.kill()
      await stopped
    }))
    await rm(directory, { recursive: true, force: true })
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
