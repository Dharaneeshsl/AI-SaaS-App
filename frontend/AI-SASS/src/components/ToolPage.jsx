import { useMemo, useState } from 'react'
import { Check, Loader2, Share2, Sparkles } from 'lucide-react'
import { publishCreation, submitToolRequest } from '../lib/api'
import { useAuth } from '../auth/authContext'

const sampleOutputs = {
  article: (topic, tone, length) =>
    `# ${topic || 'Your next article'}\n\nA strong ${tone.toLowerCase()} article opens with a clear promise, gives readers practical context, and closes with an action they can take immediately. For a ${length.toLowerCase()} piece, lead with the problem, explain why it matters now, and organize the answer into short sections that are easy to scan.\n\nKey angles to include:\n- The audience pain point\n- The change or opportunity driving urgency\n- Three practical takeaways\n- A concise closing recommendation`,
  title: (keyword, category) =>
    [
      `${keyword || 'AI growth'}: A Practical Guide for ${category}`,
      `How ${keyword || 'AI growth'} Is Changing ${category}`,
      `The Founder’s Playbook for ${keyword || 'AI growth'}`,
      `${keyword || 'AI growth'} Trends Worth Watching This Year`,
    ].join('\n'),
  image: (prompt, style) =>
    `Image brief ready: ${prompt || 'A polished product visual'} in a ${style.toLowerCase()} style. Connect your image-generation API to turn this brief into a downloadable asset.`,
  resume: (role, summary) =>
    `Resume review for ${role || 'target role'}\n\nScore: 82/100\n\nWhat works:\n- Clear professional positioning\n- Good evidence of ownership and impact\n\nImprove next:\n- Add measurable outcomes to the top three bullets\n- Mirror 5-7 keywords from the job description\n- Shorten older experience so the latest role carries more weight\n\nSummary note: ${summary || 'Paste resume text to receive a sharper review.'}`,
  background: (fileName) =>
    `Background removal preview ready for ${fileName || 'Image'}. Re-run once the backend is online to get the visual cutout.`,
  object: (fileName, objectName) =>
    `Object removal preview ready: "${objectName || 'Selected object'}" from ${fileName || 'the uploaded image'}. Re-run once the backend is online for the visual result.`,
}

const isImageOutput = (value) =>
  typeof value === 'string' &&
  (value.startsWith('data:image') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value))

const ToolPage = ({ title, description, fields, outputType, submitLabel = 'Generate' }) => {
  const initialValues = useMemo(
    () =>
      fields.reduce((values, field) => {
        values[field.name] = field.defaultValue || ''
        return values
      }, {}),
    [fields],
  )

  const { user } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [creationId, setCreationId] = useState(null)
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const updateValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setCreationId(null)
    setPublished(false)

    try {
      const { output: generated, id } = await submitToolRequest(outputType, values, user?.id)
      setOutput(generated)
      setCreationId(id || null)
    } catch {
      const generator = sampleOutputs[outputType]
      const generated =
        outputType === 'article'
          ? generator(values.topic, values.tone, values.length)
          : outputType === 'title'
            ? generator(values.keyword, values.category)
            : outputType === 'image'
              ? generator(values.prompt, values.style)
              : outputType === 'resume'
                ? generator(values.role, values.resume)
                : outputType === 'object'
                  ? generator(values.image?.name, values.objectName)
                  : generator(values.image?.name)

      setOutput(generated)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!creationId) {
      return
    }

    setPublishing(true)
    try {
      await publishCreation(creationId, user?.id, true)
      setPublished(true)
    } catch {
      // Publishing is a best-effort convenience; keep the output visible on failure.
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            {fields.map((field) => (
              <label key={field.name} className="block">
                <span className="text-sm font-medium text-gray-800">{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    value={values[field.name]}
                    onChange={(event) => updateValue(field.name, event.target.value)}
                    rows={field.rows || 5}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={values[field.name]}
                    onChange={(event) => updateValue(field.name, event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'file' ? (
                  <input
                    type="file"
                    accept={field.accept}
                    onChange={(event) => updateValue(field.name, event.target.files?.[0] || null)}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700"
                  />
                ) : (
                  <input
                    value={values[field.name]}
                    onChange={(event) => updateValue(field.name, event.target.value)}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                )}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {submitLabel}
          </button>
        </form>

        <section className="min-h-[360px] rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-semibold text-gray-900">Output</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Preview</span>
          </div>
          {output ? (
            <>
              {isImageOutput(output) ? (
                <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img src={output} alt="Generated result" className="mx-auto max-h-[480px] w-full object-contain" />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{output}</pre>
              )}
              {creationId && user && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  {published ? (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600">
                      <Check className="h-4 w-4" />
                      Published to the community
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={publishing}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                      Publish to community
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-200 text-center text-sm text-gray-500">
              Your generated result will appear here.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default ToolPage
