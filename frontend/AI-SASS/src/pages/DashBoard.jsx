import React, { useEffect, useState } from 'react'
import { dummyCreationData, AiToolsData } from '../assets/assets'
import { Calendar, Clock, Image as ImageIcon } from 'lucide-react'

const DashBoard = () => {
  const [creations, setCreations] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('all')

  const getDashboardData = async () => {
    setCreations(dummyCreationData)
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your projects.</p>
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
              <h3 className="text-xl font-semibold">{creations.length}</h3>
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
              <h3 className="text-xl font-semibold">{creations.length}</h3>
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
              <h3 className="text-xl font-semibold">{creations.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Creations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Creations</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedFilter === 'all' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {['blog-title', 'image', 'article'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedFilter === filter
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {creations
            .filter(item => selectedFilter === 'all' || item.type === selectedFilter)
            .map((item, index) => {
              const tool = AiToolsData.find(t => t.path.includes(item.type))
              return (
                <div key={item.id} className="flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors">
                  {tool && (
                    <div 
                      className="p-2 rounded-lg"
                      style={{
                        background: `linear-gradient(to bottom right, ${tool.bg.from}, ${tool.bg.to})`
                      }}
                    >
                      <tool.Icon className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.prompt}</p>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.content}</p>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default DashBoard