import { generateText } from '../providers/anthropic.js'

const clean = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback
  }

  return value.trim() || fallback
}

const lines = (items) => items.filter(Boolean).join('\n')

// ---------------------------------------------------------------------------
// Deterministic demo generators. These run with zero configuration so the app
// is fully functional without any provider keys, and act as the fallback when
// a live provider request fails.
// ---------------------------------------------------------------------------

const demoArticle = (safeTopic, safeTone, safeLength) =>
  lines([
    `# ${safeTopic}`,
    '',
    `A strong ${safeTone} ${safeLength} article starts with a clear reader promise, frames why the topic matters now, and gives practical next steps without wandering.`,
    '',
    '## Recommended Structure',
    '- Open with the problem and the audience it affects.',
    '- Explain the stakes in plain language.',
    '- Give three practical examples or tactics.',
    '- Close with a concise action plan.',
    '',
    '## Draft Opening',
    `${safeTopic} is no longer a future-facing idea. It is a practical operating advantage for teams that need to move faster while keeping quality high.`,
  ])

const demoTitles = (safeKeyword, safeCategory) =>
  [
    `${safeKeyword}: A Practical Guide for ${safeCategory}`,
    `How ${safeKeyword} Is Changing ${safeCategory}`,
    `The Founder Playbook for ${safeKeyword}`,
    `${safeKeyword} Trends Worth Watching This Year`,
    `A No-Fluff Guide to ${safeKeyword}`,
  ].join('\n')

const demoImagePrompt = (safePrompt, safeStyle) =>
  lines([
    `Image brief ready: ${safePrompt}`,
    '',
    `Style: ${safeStyle}`,
    'Composition: clean focal subject, balanced spacing, production-grade lighting.',
    'Delivery note: connect an image generation provider key to return generated assets.',
  ])

const demoResume = (safeRole, safeResume) => {
  const wordCount = safeResume.split(/\s+/).filter(Boolean).length
  const score = Math.max(68, Math.min(92, 76 + Math.floor(wordCount / 80)))

  return lines([
    `Resume review for ${safeRole}`,
    '',
    `Score: ${score}/100`,
    '',
    'What works:',
    '- The positioning is clear enough for a first screening pass.',
    '- The experience section can support a stronger impact story.',
    '',
    'Improve next:',
    '- Add measurable outcomes to the top three bullets.',
    '- Mirror the most important keywords from the job description.',
    '- Shorten older experience so recent work carries more weight.',
    '- Start bullets with active verbs and business results.',
  ])
}

// ---------------------------------------------------------------------------
// Public service functions. Each tries a live Claude request first (when a key
// is configured), then falls back to the deterministic demo output.
// ---------------------------------------------------------------------------

export const generateArticle = async ({ topic, tone = 'Professional', length = 'Medium' }) => {
  const safeTopic = clean(topic, 'Your next article')
  const safeTone = clean(tone, 'Professional').toLowerCase()
  const safeLength = clean(length, 'Medium').toLowerCase()

  const wordTarget = { short: '350-500', medium: '700-900', long: '1200-1600' }[safeLength] || '700-900'

  const live = await generateText({
    system:
      'You are a senior content writer. Produce clean, well-structured Markdown articles with a clear headline, short scannable sections, and a strong opening. Do not include meta commentary.',
    prompt: `Write a ${safeTone}, ${safeLength} article (${wordTarget} words) about: "${safeTopic}". Use a compelling H1 title, 2-4 section headings, and a concise closing takeaway.`,
    maxTokens: 3072,
  })

  return live || demoArticle(safeTopic, safeTone, safeLength)
}

export const generateTitles = async ({ keyword, category = 'General' }) => {
  const safeKeyword = clean(keyword, 'AI growth')
  const safeCategory = clean(category, 'General')

  const live = await generateText({
    system:
      'You are an editorial headline strategist. Return exactly five high-intent, click-worthy blog titles, one per line, with no numbering, quotes, or extra commentary.',
    prompt: `Generate five blog title options for the keyword "${safeKeyword}" in the "${safeCategory}" category.`,
    maxTokens: 512,
  })

  return live || demoTitles(safeKeyword, safeCategory)
}

export const prepareImagePrompt = async ({ prompt, style = 'Realistic' }) => {
  const safePrompt = clean(prompt, 'A polished SaaS product visual')
  const safeStyle = clean(style, 'Realistic').toLowerCase()

  const live = await generateText({
    system:
      'You are an expert prompt engineer for text-to-image models. Expand the user idea into a single, richly detailed image generation brief covering subject, composition, lighting, color, mood, and style. Keep it under 120 words.',
    prompt: `Create a production-ready image prompt for: "${safePrompt}". Target style: ${safeStyle}.`,
    maxTokens: 512,
  })

  return live || demoImagePrompt(safePrompt, safeStyle)
}

export const reviewResume = async ({ role, resume }) => {
  const safeRole = clean(role, 'target role')
  const safeResume = clean(resume, 'Paste resume text to receive a sharper review.')

  const live = await generateText({
    system:
      'You are an expert technical recruiter and resume coach. Review resumes concisely: give an overall score out of 100, list what works, and list specific, actionable improvements. Use plain text with short bullet points.',
    prompt: `Review this resume for the role of "${safeRole}". Provide a score, strengths, and prioritized improvements.\n\nResume:\n${safeResume}`,
    maxTokens: 1536,
  })

  return live || demoResume(safeRole, safeResume)
}

// Build a deterministic SVG data URL so media tools return a real visual preview
// even without a third-party image API. The community feed can render these.
const svgDataUrl = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`

const escapeXml = (value) =>
  clean(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const prepareBackgroundRemoval = async ({ fileName, image }) => {
  const safeFile = clean(fileName || image, 'Image')
  const label = escapeXml(safeFile.length > 42 ? `${safeFile.slice(0, 39)}...` : safeFile)

  // Demo output: a cutout-style card with a transparent checkerboard background.
  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
      <defs>
        <pattern id="checker" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="#f3f4f6"/>
          <rect width="12" height="12" fill="#e5e7eb"/>
          <rect x="12" y="12" width="12" height="12" fill="#e5e7eb"/>
        </pattern>
        <linearGradient id="subject" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#60a5fa"/>
          <stop offset="100%" stop-color="#a855f7"/>
        </linearGradient>
      </defs>
      <rect width="960" height="720" fill="url(#checker)"/>
      <ellipse cx="480" cy="390" rx="170" ry="210" fill="url(#subject)"/>
      <circle cx="480" cy="210" r="88" fill="url(#subject)"/>
      <rect x="48" y="48" width="280" height="72" rx="16" fill="#111827" fill-opacity="0.82"/>
      <text x="68" y="78" fill="#fff" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="600">Background removed</text>
      <text x="68" y="102" fill="#d1d5db" font-family="Segoe UI, Arial, sans-serif" font-size="13">${label}</text>
      <text x="48" y="680" fill="#4b5563" font-family="Segoe UI, Arial, sans-serif" font-size="14">Demo preview · transparent PNG when a media provider key is set</text>
    </svg>
  `)
}

export const prepareObjectRemoval = async ({ fileName, image, objectName }) => {
  const safeFile = clean(fileName || image, 'the uploaded image')
  const safeObject = clean(objectName, 'Selected object')
  const fileLabel = escapeXml(safeFile.length > 36 ? `${safeFile.slice(0, 33)}...` : safeFile)
  const objectLabel = escapeXml(safeObject.length > 36 ? `${safeObject.slice(0, 33)}...` : safeObject)

  // Demo output: scene with a "removed" zone callout for the target object.
  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dbeafe"/>
          <stop offset="100%" stop-color="#eff6ff"/>
        </linearGradient>
      </defs>
      <rect width="960" height="720" fill="url(#sky)"/>
      <rect x="0" y="460" width="960" height="260" fill="#d1fae5"/>
      <rect x="120" y="260" width="320" height="220" rx="18" fill="#93c5fd"/>
      <rect x="520" y="300" width="280" height="180" rx="18" fill="#86efac"/>
      <rect x="360" y="340" width="180" height="140" rx="12" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="10 8"/>
      <line x1="360" y1="340" x2="540" y2="480" stroke="#ef4444" stroke-width="3"/>
      <line x1="540" y1="340" x2="360" y2="480" stroke="#ef4444" stroke-width="3"/>
      <rect x="48" y="48" width="360" height="88" rx="16" fill="#111827" fill-opacity="0.85"/>
      <text x="68" y="82" fill="#fff" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="600">Object removed</text>
      <text x="68" y="108" fill="#d1d5db" font-family="Segoe UI, Arial, sans-serif" font-size="13">${objectLabel} · ${fileLabel}</text>
      <text x="48" y="680" fill="#4b5563" font-family="Segoe UI, Arial, sans-serif" font-size="14">Demo preview · live inpainting when an image-editing provider is connected</text>
    </svg>
  `)
}
