const childProcess = require('node:child_process')
const fs = require('node:fs/promises')
const path = require('node:path')
const { syncBuiltinESMExports } = require('node:module')

const originalExec = childProcess.exec

childProcess.exec = (command, options, callback) => {
  if (command === 'net use') {
    const done = typeof options === 'function' ? options : callback

    if (done) {
      process.nextTick(() => done(null, ''))
    }

    return {
      on: () => {},
      stdout: { on: () => {} },
      stderr: { on: () => {} },
    }
  }

  return originalExec(command, options, callback)
}

syncBuiltinESMExports()

const srcDir = path.resolve('src')
const distDir = path.resolve('dist')
const assetsDir = path.join(distDir, 'assets')

const readSourceFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      return entry.isDirectory() ? readSourceFiles(fullPath) : fullPath
    }),
  )

  return files.flat()
}

const getTailwindCandidates = async () => {
  const files = await readSourceFiles(srcDir)
  const candidates = new Set()
  const classToken = /[A-Za-z0-9_:/.[\]#%(),-]+/g

  await Promise.all(
    files
      .filter((file) => /\.(js|jsx)$/.test(file))
      .map(async (file) => {
        const source = await fs.readFile(file, 'utf8')
        const matches = source.match(classToken) || []
        matches.forEach((match) => {
          if (
            match.includes('-') ||
            match.includes(':') ||
            match.includes('[') ||
            ['flex', 'grid', 'block', 'hidden', 'fixed', 'relative', 'absolute', 'sticky'].includes(match)
          ) {
            candidates.add(match)
          }
        })
      }),
  )

  return [...candidates]
}

const assetPlugin = () => ({
  name: 'asset-plugin',
  load(id) {
    if (!/\.(png|svg|jpg|jpeg|webp|gif)$/.test(id)) {
      return null
    }

    return fs.readFile(id).then((source) => {
      const referenceId = this.emitFile({
        type: 'asset',
        name: path.basename(id),
        source,
      })

      return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`
    })
  },
})

const cssPlugin = () => ({
  name: 'css-plugin',
  async load(id) {
    if (!id.endsWith('.css')) {
      return null
    }

    return ''
  },
})

const buildApp = async () => {
  const [{ rollup }, { nodeResolve }, commonjs, { babel }, terser, tailwindcss] = await Promise.all([
    import('rollup'),
    import('@rollup/plugin-node-resolve'),
    import('@rollup/plugin-commonjs'),
    import('@rollup/plugin-babel'),
    import('@rollup/plugin-terser'),
    import('tailwindcss'),
  ])

  await fs.rm(distDir, { recursive: true, force: true })
  await fs.mkdir(assetsDir, { recursive: true })

  const bundle = await rollup({
    input: path.resolve('src/main.jsx'),
    plugins: [
      cssPlugin(),
      assetPlugin(),
      nodeResolve({
        browser: true,
        extensions: ['.mjs', '.js', '.jsx', '.json'],
      }),
      commonjs.default(),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.js', '.jsx'],
        exclude: 'node_modules/**',
        presets: [['@babel/preset-react', { runtime: 'automatic' }]],
      }),
    ],
  })

  await bundle.write({
    dir: distDir,
    format: 'es',
    entryFileNames: 'assets/main.js',
    chunkFileNames: 'assets/[name]-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]',
    plugins: [terser.default()],
  })
  await bundle.close()

  const indexCss = await fs.readFile(path.resolve('src/index.css'), 'utf8')
  const compiledTailwind = await tailwindcss.compile(indexCss, {
    base: process.cwd(),
    async loadStylesheet(id) {
      const stylesheetPath = id === 'tailwindcss'
        ? path.resolve('node_modules/tailwindcss/index.css')
        : path.resolve(id)

      return {
        content: await fs.readFile(stylesheetPath, 'utf8'),
        base: path.dirname(stylesheetPath),
      }
    },
  })
  const css = compiledTailwind.build(await getTailwindCandidates())
  await fs.writeFile(path.join(assetsDir, 'styles.css'), css)
  await fs.copyFile(path.resolve('src/assets/favicon.svg'), path.join(assetsDir, 'favicon.svg'))

  const html = await fs.readFile(path.resolve('index.html'), 'utf8')
  const productionHtml = html
    .replace('/src/assets/favicon.svg', './assets/favicon.svg')
    .replace(
      '<script type="module" src="/src/main.jsx"></script>',
      '<link rel="stylesheet" href="./assets/styles.css" />\n    <script type="module" src="./assets/main.js"></script>',
    )

  await fs.writeFile(path.join(distDir, 'index.html'), productionHtml)
}

buildApp()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
