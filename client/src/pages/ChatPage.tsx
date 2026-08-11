
import Navbar from '../components/general/Navbar'
import ChatBar from '../components/general/ChatBar'
import Sidebar from '../components/general/Sidebar'
import ChatPageContainer from '../components/ChatPageComponents/ChatPageContainer'

const ChatPage = () => {
  return (
     
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Scrollable Center */}
        <div className="flex-1 overflow-y-auto">
          <ChatPageContainer/>
        </div>

        <ChatBar />
      </div>
    </div>
  )
}

export default ChatPage