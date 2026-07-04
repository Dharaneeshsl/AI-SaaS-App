const fs = require('node:fs/promises')
const path = require('node:path')
const parser = require('@babel/parser')

const srcDir = path.resolve('src')
const extensions = new Set(['.js', '.jsx'])

const readFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name)
      return entry.isDirectory() ? readFiles(fullPath) : fullPath
    }),
  )

  return files.flat()
}

const resolveLocalImport = async (source, importer) => {
  if (!source.startsWith('.') && !source.startsWith('/')) {
    return
  }

  const base = source.startsWith('/')
    ? path.resolve(source.slice(1))
    : path.resolve(path.dirname(importer), source)

  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ]

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return
    } catch {
      // Try the next import candidate.
    }
  }

  throw new Error(`${path.relative(process.cwd(), importer)} imports missing file: ${source}`)
}

const lint = async () => {
  const files = (await readFiles(srcDir)).filter((file) => extensions.has(path.extname(file)))

  await Promise.all(
    files.map(async (file) => {
      const code = await fs.readFile(file, 'utf8')
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'importMeta'],
      })

      await Promise.all(
        ast.program.body
          .filter((node) => node.type === 'ImportDeclaration')
          .map((node) => resolveLocalImport(node.source.value, file)),
      )
    }),
  )

  console.log(`Checked ${files.length} source files.`)
}

lint().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
