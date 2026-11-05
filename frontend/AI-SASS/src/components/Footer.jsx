import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <>
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-8 w-full text-gray-500">
    <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500/30 pb-6">
        <div className="md:max-w-96">
           <img src={assets.logo} alt="Quick.Ai" />
            <p className="mt-6 text-sm">
            Experience the power of AI with QuickAi. <br /> Transform you content creation with our suite of premium AI tools. Write articles, generate images, and enhance your workflow.
            </p>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20">
            <div>
                <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
                <ul className="text-sm space-y-2">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/ai">Dashboard</Link></li>
                    <li><Link to="/ai/community">Community</Link></li>
                </ul>
            </div>
        </div>
    </div>
    <p className="pt-4 text-center text-xs md:text-sm pb-5">
        Copyright {new Date().getFullYear()} © <Link to="/">Quick AI</Link>. All Rights Reserved.
    </p>
</footer>
    </>
  )
}

export default Footer
