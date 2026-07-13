const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const port = Number(process.env.PORT || 4173)
const host = process.env.HOST || '127.0.0.1'
const distDir = path.resolve(__dirname, '..', 'dist')

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
  console.log(`Serving ${pathToFileURL(distDir).href}`)
})
