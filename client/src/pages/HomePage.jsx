import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'
const HomePage = () => {
  const { selectedUser } = useContext(ChatContext)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <div className='border w-full h-screen sm:px-[0%] sm:py-[0%]'>
      <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${
        selectedUser && showProfile 
          ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' 
          : 'md:grid-cols-[1fr_2fr]'
      }`}>
        <Sidebar />
        <ChatContainer onProfileClick={() => setShowProfile(prev => !prev)} />
        {showProfile && <RightSidebar />}
      </div>
    </div>
  )
}


export default HomePage
