import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useClerk,  UserButton ,useUser } from '@clerk/clerk-react'
const NavBar = () => {
  const navigate = useNavigate()
  const {user}= useUser()
  const {openSignIn}=useClerk()

  return (
    <div className="fixed z-50 w-full backdrop-blur-xl bg-white/30 flex justify-between items-center px-4 py-3 sm:px-20 xl:px-32">
        <img src={assets.logo} alt="logo" className="w-32 sm:w-44" onClick={() => navigate('/')} />

        {
          user?<UserButton />:(<button onClick={openSignIn} className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-blue-600
 text-white px-10 py-2.5">Get Started <ArrowRight className="w-4 h-4"  /></button>)
        }
    </div>
  )
}
export default NavBar;

        