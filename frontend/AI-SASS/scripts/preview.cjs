const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const port = Number(process.env.PORT || 4173)
const host = process.env.HOST || '127.0.0.1'
const distDir = path.resolve(__dirname, '..', 'dist')

// Reverse proxy for same-origin API requests. The production bundle calls the
// backend with relative URLs when served from a non-local host, so this server
// (or any production reverse proxy) forwards /api/* to the backend.
const backendOrigin = process.env.API_PROXY_ORIGIN || 'http://127.0.0.1:8787'

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, headers)
  res.end(body)
}

const proxyApiRequest = (req, res) => {
  const target = new URL(req.url, backendOrigin)
  const headers = { ...req.headers, host: target.host }

  const proxyRequest = http.request(target, { method: req.method, headers }, (proxyResponse) => {
    res.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers)
    proxyResponse.pipe(res)
  })

  proxyRequest.on('error', (error) => {
    send(
      res,
      502,
      JSON.stringify({ ok: false, error: `Backend unavailable at ${backendOrigin}: ${error.code || error.message}` }),
      { 'content-type': 'application/json; charset=utf-8' },
    )
  })

  req.pipe(proxyRequest)
}

const safeJoin = (root, requestPath) => {
  const decoded = decodeURIComponent(requestPath.split('?')[0])
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, '')
  const fullPath = path.join(root, normalized)
  if (!fullPath.startsWith(root)) {
    return null
  }
  return fullPath
}

const server = http.createServer((req, res) => {
  const urlPath = req.url || '/'

  // Same-origin API calls are forwarded to the backend service.
  if (urlPath === '/api' || urlPath.startsWith('/api/')) {
    return proxyApiRequest(req, res)
  }

  let filePath = safeJoin(distDir, urlPath === '/' ? '/index.html' : urlPath)

  if (!filePath) {
    return send(res, 400, 'Bad request')
  }

  // SPA fallback: unknown paths (e.g. /ai/writearticle) serve index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html')
  }

  const ext = path.extname(filePath).toLowerCase()
  const type = mimeTypes[ext] || 'application/octet-stream'

  fs.readFile(filePath, (error, data) => {
    if (error) {
      return send(res, 404, 'Not found')
    }

    send(res, 200, data, {
      'content-type': type,
      'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    })
  })
})

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('dist/ is missing. Run "npm run build" first.')
  process.exit(1)
}

server.listen(port, host, () => {
  console.log(`Frontend preview: http://${host}:${port}/`)
  console.log(`API proxy: ${backendOrigin}`)
  console.log(`Serving ${pathToFileURL(distDir).href}`)
})
