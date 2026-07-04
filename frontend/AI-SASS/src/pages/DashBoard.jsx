import React from 'react'
import { Calendar, Clock, Image as ImageIcon, Sparkles } from 'lucide-react'
import { dummyCreationData, dummyPublishedCreationData } from '../assets/assets'

const DashBoard = () => {
  const totalCreations = dummyCreationData.length + dummyPublishedCreationData.length
  const publishedCreations = dummyPublishedCreationData.length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Start creating amazing content with AI.</p>
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
              <h3 className="text-xl font-semibold">{totalCreations}</h3>
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
              <h3 className="text-xl font-semibold">{publishedCreations}</h3>
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
              <h3 className="text-xl font-semibold">0</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-flex p-3 bg-blue-50 rounded-full mb-4">
          <Sparkles className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready for your next creation</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Select any AI tool from the sidebar to draft content, prepare image edits, or review a resume.
        </p>
      </div>
    </div>
  )
}

export default DashBoard
