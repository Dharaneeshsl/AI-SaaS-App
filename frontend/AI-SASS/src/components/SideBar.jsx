import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, UserRound } from 'lucide-react'
import AiTools from './AiTools'
import { useAuth } from '../auth/authContext'

const SideBar = ({ sidebar, setSidebar }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, openUserProfile } = useAuth()

  const handleNav = (path) => {
    navigate(path)
    if (window.innerWidth < 640 && setSidebar) {
      setSidebar(false)
    }
  }

  const isDashboardActive = location.pathname === '/ai'
  const isCommunityActive = location.pathname === '/ai/community'

  return (
    <div
      className={`w-64 bg-white border-r border-gray-200 flex flex-col justify-between max-sm:fixed max-sm:z-50 top-14 bottom-0 ${
        sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'
      } transition-all duration-300 ease-in-out overflow-y-auto`}
    >
      {/* Top Section */}
      <div className="w-full">
        {user && (
          <div className="flex flex-col items-center mt-6 mb-6">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-12 h-12 rounded-full cursor-pointer hover:opacity-90 transition-opacity object-cover"
                onClick={() => openUserProfile()}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold cursor-pointer"
                onClick={() => openUserProfile()}
              >
                {(user.firstName || user.fullName || 'G').slice(0, 1).toUpperCase()}
              </div>
            )}
            <h1 className="mt-2 font-medium text-gray-800">{user.fullName || 'Guest'}</h1>
          </div>
        )}

        {/* Main Navigation */}
        <div className="px-2 space-y-1">
          <div
            onClick={() => handleNav('/ai')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
              isDashboardActive
                ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${isDashboardActive ? 'text-white' : 'text-gray-500'}`} />
            <span className="text-sm font-medium">Dashboard</span>
          </div>

          <div
            onClick={() => handleNav('/ai/community')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
              isCommunityActive
                ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Users className={`w-5 h-5 ${isCommunityActive ? 'text-white' : 'text-gray-500'}`} />
            <span className="text-sm font-medium">Community</span>
          </div>
        </div>

        {/* Section Divider & Tools */}
        <div className="px-5 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          AI Tools
        </div>
        <div className="px-2">
          <AiTools variant="sidebar" activeSidebar={sidebar} onCloseSidebar={() => setSidebar(false)} />
        </div>
      </div>

      {/* Bottom Section - Account Actions */}
      <div className="mb-6 w-full px-4">
        <div className="space-y-1">
          <div
            onClick={() => openUserProfile()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <UserRound className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium">Account Settings</span>
          </div>

          <div
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideBar
