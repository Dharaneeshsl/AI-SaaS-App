import React from 'react'
import { useClerk, useUser } from '@clerk/clerk-react'
import AiTools from './AiTools'
import { LogOut } from 'lucide-react'

const SideBar = ({ sidebar, setSidebar }) => {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
    
    return (
        <div className={`w-64 bg-white border-r border-gray-200 flex flex-col justify-between max-sm:fixed max-sm:z-50 top-14 bottom-0 ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out overflow-y-auto`}>
            {/* Top Section - User Profile */}
            <div className='w-full'>
                {user && (
                    <div className='flex flex-col items-center mt-6 mb-8'>
                        <img 
                            src={user.imageUrl} 
                            alt={user.fullName || 'User'} 
                            className='w-12 h-12 rounded-full cursor-pointer hover:opacity-90 transition-opacity'
                            onClick={() => openUserProfile()}
                        />
                        <h1 className='mt-2 font-medium text-gray-800'>{user.fullName}</h1>
                    </div>
                )}
                
                {/* AI Tools */}
                <div className='px-2'>
                    <AiTools variant="sidebar" activeSidebar={sidebar} onCloseSidebar={() => setSidebar(false)} />
                </div>
            </div>

            {/* Bottom Section - Account Actions */}
            <div className='mb-6 w-full px-4'>
                <div className='space-y-1'>
                    <div 
                        onClick={() => openUserProfile()}
                        className='flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-700 transition-colors'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span className='text-sm font-medium'>Account Settings</span>
                    </div>
                    
                    <div 
                        onClick={() => signOut()}
                        className='flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 text-red-600 transition-colors'
                    >
                        <LogOut className='w-5 h-5' />
                        <span className='text-sm font-medium'>Sign Out</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideBar