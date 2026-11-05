import { useState } from 'react'
import { deleteCreation, publishCreation } from '../lib/api'
import { downloadOutput, isImageOutput } from '../lib/output'
import { useAuth } from '../auth/authContext'

const SavedCreation = ({ creation, onChange, onDelete }) => {
  const { user, getToken } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const act = async (action) => {
    setBusy(true)
    setError('')
    try { await action() }
    catch (failure) { setError(failure.message || 'Could not update this creation.') }
    finally { setBusy(false) }
  }

  return (
    <article className="rounded-lg border border-gray-200 p-4">
      <h3 className="break-words font-medium text-gray-900">{creation.prompt}</h3>
      <p className="mt-1 text-xs text-gray-500">{creation.type} · {creation.mode === 'provider-live' ? 'AI result' : 'Demo sample'} · {creation.publish ? 'Public' : 'Private'}</p>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-blue-600">View full result</summary>
        {isImageOutput(creation.content) ? <img src={creation.content} alt={creation.prompt} loading="lazy" className="mt-3 max-h-96 w-full object-contain" /> : <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">{creation.content}</pre>}
      </details>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button type="button" disabled={busy} className="rounded border px-3 py-2 disabled:opacity-50" onClick={() => act(() => downloadOutput(creation.content, creation.type))}>Download</button>
        <button type="button" disabled={busy} className="rounded border px-3 py-2 disabled:opacity-50" onClick={() => act(async () => onChange(await publishCreation(creation.id, user.id, !creation.publish, await getToken())))}>{creation.publish ? 'Unpublish' : 'Publish to community'}</button>
        <button type="button" disabled={busy} className="rounded border px-3 py-2 text-red-700 disabled:opacity-50" onClick={() => setConfirmDelete(true)}>Delete</button>
      </div>
      {confirmDelete && <div className="mt-3 rounded bg-red-50 p-3 text-sm">
        <p>Permanently delete this saved creation?</p>
        <button type="button" disabled={busy} className="mr-4 mt-2 font-medium text-red-700" onClick={() => act(async () => { await deleteCreation(creation.id, user.id, await getToken()); onDelete(creation.id) })}>Confirm delete</button>
        <button type="button" disabled={busy} onClick={() => setConfirmDelete(false)}>Cancel</button>
      </div>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </article>
  )
}

export default SavedCreation
