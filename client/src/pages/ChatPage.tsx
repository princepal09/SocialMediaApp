import ChatPageContainer from "../components/ChatPageComponents/ChatPageContainer";
import AppLayout from "../components/Layout/AppLayout";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const { receiverId, conversationId } = useParams();
  return (
    <AppLayout>
      <ChatPageContainer key={`${receiverId}:${conversationId}`} />
    </AppLayout>
  );
};

export default ChatPage;
