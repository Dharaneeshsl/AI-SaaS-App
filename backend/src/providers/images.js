import { config } from '../config.js'

const invalidImage = () => Object.assign(new Error('Upload a valid PNG, JPEG, or WebP image up to 5 MB.'), { status: 400 })

export const decodeImage = (value) => {
  const match = typeof value === 'string' && value.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/)
  if (!match || match[2].length % 4 !== 0) throw invalidImage()
  const bytes = Buffer.from(match[2], 'base64')
  const signatures = {
    'image/png': bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
    'image/jpeg': bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
    'image/webp': bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP',
  }
  if (!bytes.length || bytes.length > 5 * 1024 * 1024 || !signatures[match[1]]) throw invalidImage()
  return { bytes, mime: match[1] }
}

// Native fetch keeps provider credentials on the server and avoids another SDK.
export const generateImage = async ({ prompt, image, transparent = false }) => {
  if (!config.hasOpenAiKey) return null
  let body
  const headers = { authorization: `Bearer ${config.openAiApiKey}` }
  const settings = { model: config.imageModel, prompt, n: 1, size: '1024x1024', quality: 'medium', output_format: 'png', background: transparent ? 'transparent' : 'auto' }
  if (image) {
    const { bytes, mime } = decodeImage(image)
    body = new FormData()
    for (const [key, value] of Object.entries(settings)) body.append(key, String(value))
    body.append('image', new Blob([bytes], { type: mime }), `upload.${mime.split('/')[1]}`)
  } else {
    headers['content-type'] = 'application/json'
    body = JSON.stringify(settings)
  }
  try {
    const response = await fetch(`https://api.openai.com/v1/images/${image ? 'edits' : 'generations'}`, {
      method: 'POST', headers, body, signal: AbortSignal.timeout(120_000),
    })
    if (!response.ok) throw new Error('Provider request failed.')
    const result = await response.json()
    const encoded = result.data?.[0]?.b64_json
    if (typeof encoded !== 'string' || !encoded.length) throw new Error('Provider returned no image.')
    return { output: `data:image/png;base64,${encoded}`, mode: 'provider-live' }
  } catch (error) {
    const timeout = error.name === 'TimeoutError' || error.name === 'AbortError'
    throw Object.assign(new Error(timeout ? 'Image processing timed out. Please try again.' : 'Image provider unavailable. Please try again later.'), { status: timeout ? 504 : 502 })
  }
}
