import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Message } from "../../types/chat";
import { toast } from "sonner";
import { socket } from "../../socket";
import {
  getMessages,
  getOrCreateConversations,
  sendMessage,
} from "../../api/chat.api";
import Spinner from "../general/Spinner";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Send, Image as ImageIcon, X } from "lucide-react";

interface ReceiverState {
  username?: string;
  profileImage?: string;
}

const ChatPageContainer = () => {
  const { receiverId, username } = useParams<{
    receiverId: string;
    username: string;
  }>();

  const location = useLocation();

  const receiver = location.state as ReceiverState | null;

  const receiverName = receiver?.username || username || "User";
  const receiverProfileImage = receiver?.profileImage;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initChat = async () => {
    if (!receiverId) return;

    setLoading(true);

    try {
      const response = await getOrCreateConversations(receiverId);
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
     if(!conversationId) return;
     socket.emit("join_conversation", conversationId);

     const handleNewMessage = (msg:Message) =>{
      setMessages((prev) => {
        if(prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      })
     }

     socket.on("new_message", handleNewMessage);

     return ()=>{
      socket.off("new_message", handleNewMessage);
      socket.emit("leave_conversation", conversationId);
     }

  }, [conversationId])

  useEffect(() => {
    initChat();
  }, [receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only images
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    // Remove previous preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    const message = text.trim();

    if (!conversationId || (!message && !image) || sending) {
      return;
    }

    setSending(true);

    try {
      const formData = new FormData();

      formData.append("conversationId", conversationId);

      if (message) {
        formData.append("text", message);
      }

      if (image) {
        formData.append("image", image);
      }

      const response = await sendMessage(formData);


      setText("");

      removeImage();

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
        <Link to={`/profile/${receiverName}`}>
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
            </div>

            {/* Receiver Info */}

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-white">
                {receiverName}
              </h2>
            </div>
          </div>
        </Link>
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
                    className={`overflow-hidden rounded-2xl text-sm leading-relaxed shadow-lg ${
                      isMine
                        ? "rounded-br-md bg-[#9929EA] text-white"
                        : "rounded-bl-md border border-white/5 bg-zinc-900 text-gray-200"
                    }`}
                  >
                    {/* Text */}

                    {message.text && (
                      <p className="px-4 py-2.5 break-words whitespace-pre-wrap">
                        {message.text}
                      </p>
                    )}

                    {/* Image */}

                    {message.image && (
                      <img
                        src={message.image}
                        alt="Message attachment"
                        className={`block max-h-96 max-w-full object-cover ${
                          message.text ? "border-t border-white/10" : ""
                        }`}
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
          {/* Image Preview */}

          {imagePreview && (
            <div className="mb-3 flex items-center gap-3">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected image"
                  className="h-20 w-20 rounded-xl object-cover ring-1 ring-white/10"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  disabled={sending}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="text-xs text-gray-500">Image selected</div>
            </div>
          )}

          {/* Input Container */}

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-xl">
            {/* Hidden file input */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Image button */}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="flex h-10 cursor-pointer w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              title="Send image"
            >
              <ImageIcon size={19} />
            </button>

            {/* Text input */}

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
              disabled={(!text.trim() && !image) || sending}
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-gray-600"
            >
              {sending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Send size={15} />
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
