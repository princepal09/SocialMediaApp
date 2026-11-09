import ChatPageContainer from "../components/ChatPageComponents/ChatPageContainer";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const { receiverId, conversationId } = useParams();
  return (
    <ChatPageContainer key={`${receiverId}:${conversationId}`} />
  );
};

export default ChatPage;
