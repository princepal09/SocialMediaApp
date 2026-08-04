import Navbar from '../components/general/Navbar'
import ChatBar from '../components/general/ChatBar'
import UserProfileContainer from '../components/ProfilePageComponents/UserProfileContainer'
import Sidebar from '../components/general/Sidebar'

const ProfilePage = () => {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
      <UserProfileContainer/>

        <ChatBar/>
      </div>
    </div>
  )
}

export default ProfilePage