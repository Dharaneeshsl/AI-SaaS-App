import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X, ArrowLeft } from 'lucide-react'
import SideBar from '../components/SideBar'  
import { AuthGate } from '../auth/AuthProvider'
import { useAuth } from '../auth/authContext'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user, isConfigured, isDemoMode } = useAuth()

  // Allow full app access in demo mode (no Clerk key). When Clerk is configured,
  // require a signed-in user for the protected /ai workspace.
  const canAccessWorkspace = Boolean(user) || !isConfigured || isDemoMode

  if (!canAccessWorkspace) {
    return <AuthGate />
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="w-full px-4 sm:px-8 h-14 flex items-center justify-between border-b border-gray-200 bg-white">
        <img src={assets.logo} alt="logo" onClick={() => navigate('/')} className="h-8 cursor-pointer" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </button>
          {sidebar ? (
            <X onClick={() => setSidebar(false)} className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer" />
          ) : (
            <Menu onClick={() => setSidebar(true)} className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer" />
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="flex flex-1 w-full h-[calc(100vh-56px)]">
        <SideBar sidebar={sidebar} setSidebar={setSidebar} />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
