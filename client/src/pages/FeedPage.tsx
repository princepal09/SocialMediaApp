import { Camera, Plus, RotateCcw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getFeedPosts } from "../api/feed.api";
import FeedPost from "../components/FeedPageComponents/FeedPost";
import { socket } from "../socket";
import type { FeedPostType } from "../types/feed";
import type { RootState } from "../store/store";

function FeedSkeleton() {
  return (
    <div role="status" aria-label="Loading feed" className="space-y-5">
      {[0, 1].map((placeholder) => (
        <div key={placeholder} aria-hidden="true" className="overflow-hidden rounded-2xl border border-white/10 bg-[#191822] motion-safe:animate-pulse">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="size-10 rounded-full bg-white/10" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded-full bg-white/10" />
              <div className="h-2.5 w-16 rounded-full bg-white/5" />
            </div>
          </div>
          <div className="space-y-2 px-4 pb-4">
            <div className="h-3 w-4/5 rounded-full bg-white/8" />
            <div className="h-3 w-3/5 rounded-full bg-white/5" />
          </div>
          <div className="aspect-video max-h-72 bg-white/5" />
          <div className="flex gap-4 px-4 py-4">
            <div className="h-4 w-12 rounded-full bg-white/8" />
            <div className="h-4 w-12 rounded-full bg-white/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

const FeedPage = () => {
  const username = useSelector((state: RootState) => state.auth.user?.username);
  const [posts, setPosts] = useState<FeedPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const request = useRef<AbortController | null>(null);

  const load = useCallback(async (before?: string, refreshing = false) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    if (before) setLoadingMore(true);
    if (!before && !refreshing) setLoading(true);
    setError("");
    setPageError("");

    try {
      const { data, nextCursor } = await getFeedPosts(controller.signal, before);
      if (controller.signal.aborted) return;
      setPosts((current) => {
        const merged = new Map(current.map((post) => [post._id, post]));
        (data ?? []).forEach((post) => {
          if (!merged.has(post._id)) merged.set(post._id, post);
        });
        return [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b._id.localeCompare(a._id));
      });
      if (!refreshing) setNextCursor(nextCursor ?? null);
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = (error as { message?: string }).message || "The feed is temporarily unavailable.";
      if (before) setPageError(message);
      else if (!refreshing) setError(message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
    let hasConnected = socket.connected;
    const addPost = (post: FeedPostType) => {
      setPosts((current) => current.some(({ _id }) => _id === post._id) ? current : [post, ...current]);
    };
    const reconnect = () => {
      if (hasConnected) void load(undefined, true);
      hasConnected = true;
    };
    socket.on("new_post", addPost);
    socket.on("connect", reconnect);
    return () => {
      request.current?.abort();
      socket.off("new_post", addPost);
      socket.off("connect", reconnect);
    };
  }, [load]);

  return (
    <div className="min-h-full bg-[#101017]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-7 sm:py-9">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-5 rounded-3xl border border-[#d8c6ff]/18 bg-[radial-gradient(ellipse_at_top_left,#302244,#191822_65%)] p-5 sm:p-7">
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#d8c6ff]">
              <Sparkles size={15} aria-hidden="true" /> Pixora community
            </p>
            <h1 className="break-words text-3xl font-bold tracking-tight text-[#f7f4ff] sm:text-4xl">
              {username ? `Welcome back, ${username}` : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#c2bacf]">See what people are making and sharing.</p>
          </div>
          <Link to="/upload-post" className="inline-flex items-center gap-1.5 rounded-full bg-[#d8c6ff] px-4 py-2.5 text-sm font-semibold text-[#211333] hover:bg-[#eadfff]">
            <Plus size={17} aria-hidden="true" /> New post
          </Link>
        </header>

        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#f7f4ff]">Your feed</h2>
        {loading ? (
          <FeedSkeleton />
        ) : error ? (
          <section className="rounded-2xl border border-white/10 bg-[#191822] px-5 py-12 text-center" aria-live="polite">
            <h2 className="text-lg font-semibold">Couldn’t load the feed</h2>
            <p className="mt-2 text-sm text-zinc-400">{error}</p>
            <button type="button" onClick={() => void load()} className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
              <RotateCcw size={15} aria-hidden="true" /> Try again
            </button>
          </section>
        ) : posts.length ? (
          <div className="space-y-5">
            {posts.map((post) => <FeedPost key={post._id} post={post} />)}
            {nextCursor && (
              <div className="py-4 text-center">
                {pageError && <p role="alert" className="mb-3 text-sm text-red-300">{pageError}</p>}
                <button type="button" disabled={loadingMore} onClick={() => void load(nextCursor)} className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-60">
                  {loadingMore ? "Loading posts…" : "Load older posts"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-[#191822] px-5 py-12 text-center">
            <Camera className="mx-auto mb-4 text-[#d8c6ff]" size={26} aria-hidden="true" />
            <h2 className="text-lg font-semibold">No posts yet</h2>
            <p className="mt-2 text-sm text-zinc-400">Share a photo, a video, or something you’re working on.</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
