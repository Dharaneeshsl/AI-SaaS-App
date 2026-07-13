import React from 'react'
import AiTools from './AiTools'
import { LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../auth/authContext'

const SideBar = ({ sidebar, setSidebar }) => {
    const { user, signOut, openUserProfile } = useAuth();
    
    return (
        <div className={`w-64 bg-white border-r border-gray-200 flex flex-col justify-between max-sm:fixed max-sm:z-50 top-14 bottom-0 ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out overflow-y-auto`}>
            {/* Top Section - User Profile */}
            <div className='w-full'>
                {user && (
                    <div className='flex flex-col items-center mt-6 mb-8'>
                        {user.imageUrl ? (
                            <img
                                src={user.imageUrl}
                                alt={user.fullName || 'User'}
                                className='w-12 h-12 rounded-full cursor-pointer hover:opacity-90 transition-opacity object-cover'
                                onClick={() => openUserProfile()}
                            />
                        ) : (
                            <div
                                className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold cursor-pointer'
                                onClick={() => openUserProfile()}
                            >
                                {(user.firstName || user.fullName || 'G').slice(0, 1).toUpperCase()}
                            </div>
                        )}
                        <h1 className='mt-2 font-medium text-gray-800'>{user.fullName || 'Guest'}</h1>
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
                        <UserRound className="w-5 h-5 text-gray-500" />
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
