import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Blogtitle from './pages/Blogtitle'
import RemoveBackground from './pages/RemoveBackground'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/ReviewResume'
import WriteArticle from './pages/WriteArticle'
import DashBoard from './pages/DashBoard'
import GenerateImages from './pages/GenerateImages'
import Community from './pages/Community'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* convenience route: standalone Layout (keeps backwards compatibility with /layout) */}
        <Route path="/layout" element={<Navigate to="/ai" replace />} />
        <Route path="/ai" element={<Layout />} >
         <Route index element={<DashBoard />}/>
         <Route path="blogtitle" element={<Blogtitle />}/>
         <Route path="writearticle" element={<WriteArticle />}/>
         <Route path="reviewresume" element={<ReviewResume />}/>
         <Route path="removebackground" element={<RemoveBackground />}/>
         <Route path="removeobject" element={<RemoveObject />}/>
         <Route path="generateimages" element={<GenerateImages />}/>
         <Route path="community" element={<Community />}/> 
         </Route>
        <Route path="*" element={<main className="mx-auto max-w-xl p-12 text-center"><h1 className="text-2xl font-semibold">Page not found</h1><p className="my-4">This page does not exist.</p><Link to="/" className="text-blue-600 underline">Return home</Link></main>} />
      </Routes> 
    </div>
  )
}

export default App
