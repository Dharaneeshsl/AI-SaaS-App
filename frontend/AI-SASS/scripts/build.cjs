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

const loadDotEnv = (filePath) => {
  try {
    const content = require('node:fs').readFileSync(filePath, 'utf8')
    const env = {}

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq <= 0) continue
      const key = line.slice(0, eq).trim()
      let value = line.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (key) env[key] = value
    }

    return env
  } catch {
    return {}
  }
}

const readFrontendEnv = () => {
  const fromFile = {
    ...loadDotEnv(path.resolve('.env.example')),
    ...loadDotEnv(path.resolve('.env')),
  }

  return {
    VITE_API_BASE_URL:
      process.env.VITE_API_BASE_URL || fromFile.VITE_API_BASE_URL || 'http://127.0.0.1:8787',
    VITE_CLERK_PUBLISHABLE_KEY:
      process.env.VITE_CLERK_PUBLISHABLE_KEY || fromFile.VITE_CLERK_PUBLISHABLE_KEY || '',
  }
}

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

// React / react-router / Clerk expect process.env.NODE_ENV in Node. Browsers do
// not have `process`, so without this the app white-screens on load.
const envPlugin = () => ({
  name: 'env-plugin',
  transform(code, id) {
    if (!code.includes('process.env')) {
      return null
    }

    return {
      code: code
        .replace(/process\.env\.NODE_ENV/g, JSON.stringify('production'))
        .replace(/process\.env\.\[/g, '({}).[')
        .replace(/process\.env/g, '({})'),
      map: null,
    }
  },
})

const buildApp = async () => {
  process.env.NODE_ENV = 'production'

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
      envPlugin(),
      cssPlugin(),
      assetPlugin(),
      nodeResolve({
        browser: true,
        exportConditions: ['production', 'browser', 'module', 'import', 'default'],
        extensions: ['.mjs', '.js', '.jsx', '.json'],
      }),
      commonjs.default({
        transformMixedEsModules: true,
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.js', '.jsx'],
        exclude: 'node_modules/**',
        presets: [['@babel/preset-react', { runtime: 'automatic' }]],
      }),
    ],
    onwarn(warning, warn) {
      // React Router / SWR ship "use client" directives; safe to ignore in Rollup.
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return
      }
      warn(warning)
    },
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

  const frontendEnv = readFrontendEnv()
  const envBootstrap = `<script>window.__AI_SASS_ENV__=${JSON.stringify(frontendEnv)};</script>`

  const html = await fs.readFile(path.resolve('index.html'), 'utf8')
  const productionHtml = html
    .replace('/src/assets/favicon.svg', './assets/favicon.svg')
    .replace(
      '<script type="module" src="/src/main.jsx"></script>',
      `<link rel="stylesheet" href="./assets/styles.css" />\n    ${envBootstrap}\n    <script type="module" src="./assets/main.js"></script>`,
    )

  await fs.writeFile(path.join(distDir, 'index.html'), productionHtml)
  console.log(
    `Frontend build complete. API=${frontendEnv.VITE_API_BASE_URL} Clerk=${frontendEnv.VITE_CLERK_PUBLISHABLE_KEY ? 'configured' : 'demo mode'}`,
  )
}

buildApp()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
