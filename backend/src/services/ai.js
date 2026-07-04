const clean = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback
  }

  return value.trim() || fallback
}

const lines = (items) => items.filter(Boolean).join('\n')

export const generateArticle = ({ topic, tone = 'Professional', length = 'Medium' }) => {
  const safeTopic = clean(topic, 'Your next article')
  const safeTone = clean(tone, 'Professional').toLowerCase()
  const safeLength = clean(length, 'Medium').toLowerCase()

  return lines([
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
}

export const generateTitles = ({ keyword, category = 'General' }) => {
  const safeKeyword = clean(keyword, 'AI growth')
  const safeCategory = clean(category, 'General')

  return [
    `${safeKeyword}: A Practical Guide for ${safeCategory}`,
    `How ${safeKeyword} Is Changing ${safeCategory}`,
    `The Founder Playbook for ${safeKeyword}`,
    `${safeKeyword} Trends Worth Watching This Year`,
    `A No-Fluff Guide to ${safeKeyword}`,
  ].join('\n')
}

export const prepareImagePrompt = ({ prompt, style = 'Realistic' }) => {
  const safePrompt = clean(prompt, 'A polished SaaS product visual')
  const safeStyle = clean(style, 'Realistic').toLowerCase()

  return lines([
    `Image brief ready: ${safePrompt}`,
    '',
    `Style: ${safeStyle}`,
    'Composition: clean focal subject, balanced spacing, production-grade lighting.',
    'Delivery note: connect an image generation provider key to return generated assets.',
  ])
}

export const reviewResume = ({ role, resume }) => {
  const safeRole = clean(role, 'target role')
  const safeResume = clean(resume, 'Paste resume text to receive a sharper review.')
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

export const prepareBackgroundRemoval = ({ fileName }) => {
  const safeFile = clean(fileName, 'Image')
  return `${safeFile} is queued for background removal. Connect a media processing provider to return a transparent PNG.`
}

export const prepareObjectRemoval = ({ fileName, objectName }) => {
  const safeFile = clean(fileName, 'the uploaded image')
  const safeObject = clean(objectName, 'Selected object')
  return `${safeObject} will be removed from ${safeFile} after the production image-editing provider is connected.`
}
