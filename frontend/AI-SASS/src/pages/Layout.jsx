import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import SideBar from '../components/SideBar'  
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser();

  return user ? (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="w-full px-8 h-14 flex items-center justify-between border-b border-gray-200 bg-white">
        <img src={assets.logo} alt="logo" onClick={() => navigate('/')} className="h-8 cursor-pointer" />
        {sidebar ? (
          <X onClick={() => setSidebar(false)} className="w-6 h-6 text-gray-600 sm:hidden" />
        ) : (
          <Menu onClick={() => setSidebar(true)} className="w-6 h-6 text-gray-600 sm:hidden" />
        )}
      </nav>

      {/* Content */}
      <div className="flex flex-1 w-full h-[calc(100vh-56px)]">
        <SideBar sidebar={sidebar} setSidebar={setSidebar} />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  )
}

export default Layout
