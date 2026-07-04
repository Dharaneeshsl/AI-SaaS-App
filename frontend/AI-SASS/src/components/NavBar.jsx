import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, UserCircle } from 'lucide-react'
import { useAuth } from '../auth/authContext'
const NavBar = () => {
  const navigate = useNavigate()
  const { user, openSignIn, isConfigured } = useAuth()

  return (
    <div className="fixed z-50 w-full backdrop-blur-xl bg-white/30 flex justify-between items-center px-4 py-3 sm:px-20 xl:px-32">
        <img src={assets.logo} alt="logo" className="w-32 sm:w-44" onClick={() => navigate('/')} />

        {
          user ? (
            <button
              onClick={() => navigate('/ai')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm"
              aria-label="Open dashboard"
            >
              <UserCircle className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={isConfigured ? openSignIn : () => navigate('/ai')} className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-blue-600
 text-white px-6 sm:px-10 py-2.5">Get Started <ArrowRight className="w-4 h-4"  /></button>
          )
        }
    </div>
  )
}
export default NavBar;

        
