import { pathToFileURL } from 'node:url'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

process.env.NODE_ENV = 'test'

const sourceRoot = path.resolve('src')

const collectFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name)
      return entry.isDirectory() ? collectFiles(fullPath) : fullPath
    }),
  )

  return files.flat()
}

const lint = async () => {
  const files = (await collectFiles(sourceRoot)).filter((file) => file.endsWith('.js'))

  await Promise.all(
    files.map(async (file) => {
      await import(pathToFileURL(file).href)
    }),
  )

  console.log(`Checked ${files.length} backend files.`)
}

lint().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
