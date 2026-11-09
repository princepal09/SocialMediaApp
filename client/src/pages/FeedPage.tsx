import { Camera, Plus, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeedPosts } from "../api/feed.api";
import FeedPost from "../components/FeedPageComponents/FeedPost";
import Spinner from "../components/general/Spinner";
import AppLayout from "../components/Layout/AppLayout";
import { connectSocket } from "../socket";
import type { FeedPostType } from "../types/feed";

const FeedPage = () => {
  const [posts, setPosts] = useState<FeedPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getFeedPosts()
      .then(({ data }) => {
        if (active) setPosts(data ?? []);
      })
      .catch((err: { message?: string }) => {
        if (active) setError(err.message || "The feed is temporarily unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    const socket = connectSocket();
    const addPost = (post: FeedPostType) => {
      setPosts((current) => current.some(({ _id }) => _id === post._id) ? current : [post, ...current]);
    };
    socket.on("new_post", addPost);
    return () => { socket.off("new_post", addPost); };
  }, []);

  const retry = () => {
    setError("");
    setLoading(true);
    setAttempt((current) => current + 1);
  };

  return (
    <AppLayout>
      <div className="min-h-full bg-[#101017]">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-7 sm:py-9">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8c6ff]">Community</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">Your feed</h1>
              <p className="mt-1 text-sm text-zinc-400">See what people are making and sharing.</p>
            </div>
            <Link to="/upload-post" className="inline-flex items-center gap-1.5 rounded-full bg-[#d8c6ff] px-4 py-2.5 text-sm font-semibold text-[#211333] hover:bg-[#eadfff]">
              <Plus size={17} aria-hidden="true" /> New post
            </Link>
          </header>

          {loading ? (
            <div className="grid min-h-64 place-items-center" role="status" aria-label="Loading feed"><Spinner fullScreen={false} /></div>
          ) : error ? (
            <section className="rounded-2xl border border-white/10 bg-[#191822] px-5 py-12 text-center" aria-live="polite">
              <h2 className="text-lg font-semibold">Couldn’t load the feed</h2>
              <p className="mt-2 text-sm text-zinc-400">{error}</p>
              <button type="button" onClick={retry} className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
                <RotateCcw size={15} aria-hidden="true" /> Try again
              </button>
            </section>
          ) : posts.length ? (
            <div className="space-y-5">{posts.map((post) => <FeedPost key={post._id} post={post} />)}</div>
          ) : (
            <section className="rounded-2xl border border-white/10 bg-[#191822] px-5 py-12 text-center">
              <Camera className="mx-auto mb-4 text-[#d8c6ff]" size={26} aria-hidden="true" />
              <h2 className="text-lg font-semibold">No posts yet</h2>
              <p className="mt-2 text-sm text-zinc-400">Share a photo, a video, or something you’re working on.</p>
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default FeedPage;
