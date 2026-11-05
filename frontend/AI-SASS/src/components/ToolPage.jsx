import { useMemo, useState } from 'react'
import { Check, Loader2, Share2, Sparkles } from 'lucide-react'
import { publishCreation, submitToolRequest } from '../lib/api'
import { useAuth } from '../auth/authContext'
import { downloadOutput, isImageOutput } from '../lib/output'

const ToolPage = ({ title, description, fields, outputType, submitLabel = 'Generate' }) => {
  const initialValues = useMemo(
    () =>
      fields.reduce((values, field) => {
        values[field.name] = field.defaultValue || field.options?.[0] || ''
        return values
      }, {}),
    [fields],
  )

  const { user, getToken } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [creationId, setCreationId] = useState(null)
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('')

  const updateValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setCreationId(null)
    setPublished(false)
    setError('')
    setOutput('')

    const missingRequired = fields.find((field) => field.required && !String(values[field.name] || '').trim())
    if (missingRequired) {
      setError(`${missingRequired.label} is required.`)
      setLoading(false)
      return
    }

    try {
      const token = await getToken()
      const { output: generated, id, mode: resultMode } = await submitToolRequest(outputType, values, user?.id, token)
      setOutput(generated)
      setCreationId(id || null)
      setMode(resultMode)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The request failed. Please try again.')
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
      const token = await getToken()
      await publishCreation(creationId, user?.id, true, token)
      setPublished(true)
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Publishing failed. Please try again.')
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
            disabled={loading || publishing}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {submitLabel}
          </button>
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        </form>

        <section className="min-h-[360px] rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-semibold text-gray-900">Output</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{output ? mode === 'provider-live' ? 'AI result' : 'Demo sample' : 'Output'}</span>
          </div>
          {output ? (
            <>
              {mode === 'demo' && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="status">This is a sample result. Image editing samples do not modify your uploaded image.</p>}
              {isImageOutput(output) ? (
                <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img src={output} alt="Generated result" className="mx-auto max-h-[480px] w-full object-contain" />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{output}</pre>
              )}
              <button type="button" className="mt-4 rounded-lg border px-4 py-2 text-sm" onClick={() => downloadOutput(output, outputType).catch(() => setError('Could not download this result.'))}>Download result</button>
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
