import Navbar from "../components/general/Navbar";
import ChatBar from "../components/general/ChatBar";
import UserProfileContainer from "../components/ProfilePageComponents/UserProfileContainer";
import Sidebar from "../components/general/Sidebar";

const ProfilePage = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Scrollable Center */}
        <div className="flex-1 overflow-y-auto">
          <UserProfileContainer />
        </div>

        <ChatBar />
      </div>
    </div>
  );
};

export default ProfilePage;