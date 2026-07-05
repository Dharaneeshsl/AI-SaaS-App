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

export const prepareBackgroundRemoval = async ({ fileName }) => {
  const safeFile = clean(fileName, 'Image')
  return `${safeFile} is queued for background removal. Connect a media processing provider to return a transparent PNG.`
}

export const prepareObjectRemoval = async ({ fileName, objectName }) => {
  const safeFile = clean(fileName, 'the uploaded image')
  const safeObject = clean(objectName, 'Selected object')
  return `${safeObject} will be removed from ${safeFile} after the production image-editing provider is connected.`
}
