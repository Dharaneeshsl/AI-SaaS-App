import { useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react'
import SavedCreation from '../components/SavedCreation'
import { fetchCreations } from '../lib/api'
import { useAuth } from '../auth/authContext'

const withinLastDay = (iso) => {
  const created = new Date(iso).getTime()
  return Number.isFinite(created) && Date.now() - created < 24 * 60 * 60 * 1000
}

const sameMonth = (iso) => {
  const created = new Date(iso)
  const now = new Date()
  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
}

const DashBoard = () => {
  const { user, getToken } = useAuth()
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const token = await getToken()
        const data = await fetchCreations(user?.id, token)
        if (active) {
          setCreations(data)
        }
      } catch (requestError) {
        if (active) {
          setCreations([])
          setError(requestError instanceof Error ? requestError.message : 'Could not load your creations.')
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

  const stats = useMemo(
    () => ({
      total: creations.length,
      thisMonth: creations.filter((c) => sameMonth(c.created_at)).length,
      lastDay: creations.filter((c) => withinLastDay(c.created_at)).length,
    }),
    [creations],
  )

  const recent = creations

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {user?.firstName ? `Welcome back, ${user.firstName}!` : 'Welcome back!'} Start creating amazing content with AI.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Creations</p>
              <h3 className="text-xl font-semibold">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <h3 className="text-xl font-semibold">{stats.thisMonth}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last 24 Hours</p>
              <h3 className="text-xl font-semibold">{stats.lastDay}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent creations or empty state */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading your creations...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : recent.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Creations</h2>
          <div className="space-y-3">
            {recent.map((creation) => (
              <SavedCreation key={creation.id} creation={creation}
                onChange={(updated) => setCreations((current) => current.map((item) => item.id === updated.id ? updated : item))}
                onDelete={(id) => setCreations((current) => current.filter((item) => item.id !== id))} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex p-3 bg-blue-50 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready for your next creation</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Select any AI tool from the sidebar to draft content, prepare image edits, or review a resume.
          </p>
        </div>
      )}
    </div>
  )
}

export default DashBoard
