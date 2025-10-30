import React from 'react'
import { Routes, Route } from 'react-router-dom'
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
        <Route path="/layout" element={<Layout />} />
        <Route path="/ai" element={<Layout />} >
         <Route index element={<DashBoard />}/>
         <Route path="blogtitle" element={<Blogtitle />}/>
         <Route path="writearticle" element={<WriteArticle />}/>
         <Route path="reviewarticle" element={<ReviewResume />}/>
         <Route path="removebackground" element={<RemoveBackground />}/>
         <Route path="removeobject" element={<RemoveObject />}/>
         <Route path="generateimages" element={<GenerateImages />}/>
         <Route path="community" element={<Community />}/> 
         </Route>
      </Routes> 
    </div>
  )
}

export default App
