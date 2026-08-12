import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Message } from "../../types/chat";
import { toast } from "sonner";
import {
  getMessages,
  getOrCreateConversations,
  sendMessage,
} from "../../api/chat.api";
import Spinner from "../general/Spinner";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Send } from "lucide-react";

interface ReceiverState {
  username?: string;
  profileImage?: string;
}

const ChatPageContainer = () => {
  const { recieverId, username } = useParams<{
    recieverId: string;
    username: string;
  }>();

  const location = useLocation();

  const receiver = location.state as ReceiverState | null;

  const receiverName = receiver?.username || username || "User";
  const receiverProfileImage = receiver?.profileImage;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const initChat = async () => {
    if (!recieverId) return;

    setLoading(true);

    try {
      const response = await getOrCreateConversations(recieverId);

      const id = response.data._id;

      setConversationId(id);

      const msgs = await getMessages(id);

      setMessages([...msgs.data].reverse());
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initChat();
  }, [recieverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    const message = text.trim();

    if (!conversationId || !message || sending) return;

    setSending(true);

    try {
      const formData = new FormData();

      formData.append("conversationId", conversationId);
      formData.append("text", message);

      const response = await sendMessage(formData);

      setMessages((prev) => [...prev, response.data]);
      setText("");

      inputRef.current?.focus();
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const receiverInitial = receiverName.charAt(0).toUpperCase();

  const currentUserInitial =
    currentUser?.username?.charAt(0).toUpperCase() || "U";

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-black">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col overflow-hidden bg-black text-white">
      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between border-b border-white/10 bg-black px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Receiver Avatar */}
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white ring-2 ring-white/10">
              {receiverProfileImage ? (
                <img
                  src={receiverProfileImage}
                  alt={receiverName}
                  className="h-full w-full object-cover"
                />
              ) : (
                receiverInitial
              )}
            </div>

            {/* Online indicator */}
            {/* <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-green-500" /> */}
          </div>

          {/* Receiver Info */}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">
              {receiverName}
            </h2>

            {/* <p className="text-xs text-green-400">Active now</p> */}
          </div>
        </div>
       
      </header>

      {/* ================= MESSAGES ================= */}
      <main className="flex-1 overflow-y-auto bg-black px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold ring-4 ring-white/5">
                {receiverProfileImage ? (
                  <img
                    src={receiverProfileImage}
                    alt={receiverName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  receiverInitial
                )}
              </div>

              <h3 className="text-base font-semibold text-white">
                {receiverName}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Start a conversation with {receiverName}
              </p>
            </div>
          )}

          {/* Message list */}
          {messages.map((message: Message) => {
            const isMine = message.sender?._id === currentUser?._id;

            return (
              <div
                key={message._id}
                className={`flex w-full items-end gap-2 ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                {/* Receiver avatar */}
                {!isMine && (
                  <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-semibold text-white">
                    {receiverProfileImage ? (
                      <img
                        src={receiverProfileImage}
                        alt={receiverName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      receiverInitial
                    )}
                  </div>
                )}

                {/* Message */}
                <div
                  className={`group max-w-[75%] sm:max-w-[65%] ${
                    isMine ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-lg ${
                      isMine
                        ? "rounded-br-md bg-[#9929EA] text-white"
                        : "rounded-bl-md border border-white/5 bg-zinc-900 text-gray-200"
                    }`}
                  >
                    {message.text && (
                      <p className="break-words whitespace-pre-wrap">
                        {message.text}
                      </p>
                    )}

                    {message.image && (
                      <img
                        src={message.image}
                        alt="Message attachment"
                        className="mt-1 max-h-80 max-w-xs rounded-xl object-cover"
                      />
                    )}
                  </div>

                  {/* Time */}
                  {message.createdAt && (
                    <p
                      className={`mt-1 px-1 text-[10px] text-gray-600 ${
                        isMine ? "text-right" : "text-left"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                {/* Current user avatar */}
                {isMine && (
                  <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-xs font-semibold text-gray-300">
                    {currentUser?.profileImage ? (
                      <img
                        src={currentUser.profileImage}
                        alt={currentUser.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      currentUserInitial
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* ================= INPUT ================= */}
      <footer className="border-t border-white/10 bg-black px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-xl">
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${receiverName}...`}
              disabled={sending}
              className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 disabled:cursor-not-allowed"
            />

            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-gray-600"
            >
              {sending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
               <Send size={15}/>
              )}

              <span className="hidden sm:inline">
                {sending ? "Sending" : "Send"}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatPageContainer;
