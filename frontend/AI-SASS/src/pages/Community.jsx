import { Heart, Image as ImageIcon } from 'lucide-react'
import { dummyPublishedCreationData } from '../assets/assets'

const Community = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Browse published creations and see what other users are making with the platform.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {dummyPublishedCreationData.map((creation) => (
          <article key={creation.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="aspect-[4/3] bg-gray-100">
              <img src={creation.content} alt={creation.prompt} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-600">
                <ImageIcon className="h-4 w-4" />
                Published image
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-gray-700">{creation.prompt}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Heart className="h-4 w-4 text-rose-500" />
                {creation.likes.length} likes
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Community
