import { useEffect, useState } from 'react'
import { FileText, Heart, Image as ImageIcon, Loader2 } from 'lucide-react'
import { fetchCommunity, likeCreation } from '../lib/api'
import { useAuth } from '../auth/authContext'

const isImageContent = (creation) =>
  typeof creation.content === 'string' &&
  (/\.(png|jpe?g|webp|gif|svg)$/i.test(creation.content) ||
    creation.content.startsWith('data:image') ||
    creation.content.startsWith('http'))

const Community = () => {
  const { user, getToken } = useAuth()
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingLikes, setPendingLikes] = useState([])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchCommunity(user?.id, await getToken())
        if (active) {
          setCreations(data)
        }
      } catch (requestError) {
        if (active) {
          setCreations([])
          setError(requestError instanceof Error ? requestError.message : 'Could not load the community feed.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      active = false
    }
  }, [user?.id, getToken])

  const handleLike = async (creation) => {
    if (!user?.id || pendingLikes.includes(creation.id)) {
      return
    }

    setPendingLikes((current) => [...current, creation.id])
    try {
      const token = await getToken()
      const updated = await likeCreation(creation.id, user.id, token)
      setCreations((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update the like.')
    } finally {
      setPendingLikes((current) => current.filter((id) => id !== creation.id))
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Browse published creations and see what other users are making with the platform.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading community creations...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {creations.length > 0 ? creations.map((creation) => {
            const liked = creation.liked_by_me
            const showImage = isImageContent(creation)

            return (
              <article
                key={creation.id}
                className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                {showImage ? (
                  <div className="aspect-[4/3] bg-gray-100">
                    <img src={creation.content} alt={creation.prompt} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                    <pre className="whitespace-pre-wrap text-xs leading-5 text-gray-700 line-clamp-6">
                      {creation.content}
                    </pre>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-600">
                    {showImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    {(creation.type || 'creation').replace('-', ' ')}
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-gray-700">{creation.prompt}</p>
                  <button
                    type="button"
                    onClick={() => handleLike(creation)}
                    disabled={!user?.id || pendingLikes.includes(creation.id)}
                    aria-pressed={liked}
                    className="mt-4 flex items-center gap-2 text-sm text-gray-500 transition hover:text-rose-500 disabled:cursor-default"
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-rose-400'}`} />
                    {creation.like_count || 0} likes
                  </button>
                </div>
              </article>
            )
          }) : (
            <div className="col-span-full rounded-xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-500">
              No published creations yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Community
