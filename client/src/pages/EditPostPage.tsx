import React from 'react'
import Navbar from '../components/general/Navbar'
import Sidebar from '../components/general/Sidebar'
import ChatBar from '../components/general/ChatBar'
import EditPostContainer from '../components/EditPostPageComponents/EditPostContainer'

const EditPostPage = () => {
  return (
      <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Scrollable Center */}
        <div className="flex-1 overflow-y-auto">
          <EditPostContainer/>
        </div>

        <ChatBar />
      </div>
    </div>
  )
}

export default EditPostPage