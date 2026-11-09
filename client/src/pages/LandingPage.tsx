import { ArrowDown, ArrowRight, Camera, Heart, Images, MessageCircle, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Images, title: "Share your work", description: "Publish photos, videos, and the story behind them." },
  { icon: Users, title: "Find your people", description: "Discover profiles, follow creators, and join the conversation." },
  { icon: MessageCircle, title: "Keep in touch", description: "Send direct messages and share images in real time." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#101017] text-[#f7f4ff]">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[#d8c6ff] text-[#211333]">
            <Camera size={19} aria-hidden="true" />
          </span>
          Pixora
        </Link>
        <Link to="/login" className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold transition hover:bg-white/10">
          Sign in
        </Link>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-10 sm:pt-16 lg:grid-cols-[1.06fr_0.94fr] lg:gap-20 lg:py-24">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8c6ff]/25 bg-[#d8c6ff]/8 px-3.5 py-1.5 text-xs font-semibold text-[#e3d6ff]">
            <Sparkles size={14} aria-hidden="true" />
            A social space for creators
          </p>
          <h1 className="max-w-2xl text-[clamp(3rem,7vw,6.75rem)] font-bold leading-[0.95] tracking-[-0.065em]">
            Share what <span className="text-[#d8c6ff]">you make.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#c2bacf] sm:text-lg">
            Post your latest work, follow creators you admire, and pick up the conversation in direct messages.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-[#d8c6ff] px-6 py-3 font-semibold text-[#211333] transition hover:bg-[#eadfff]">
              Create an account <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-[#e4d9f3] hover:text-white">
              Explore features <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        <figure className="min-w-0 rounded-[1.75rem] border border-white/12 bg-[#1c1a26] p-3.5 shadow-2xl shadow-black/25 sm:p-5">
          <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#c2bacf]">
            <span className="flex items-center gap-2 font-medium"><span className="size-2 rounded-full bg-[#d8c6ff]" /> The Pixora feed</span>
            <span className="rounded-full border border-white/12 px-2.5 py-1">Sample post</span>
          </figcaption>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#15141c]">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#e1c5af] text-xs font-bold text-[#39241b]">AM</span>
              <div>
                <p className="text-sm font-semibold">Avery Miles</p>
                <p className="text-xs text-[#bdb5ca]">@averyframes</p>
              </div>
            </div>
            <svg viewBox="0 0 600 340" role="img" aria-label="Illustrated desert ridges under a lavender sky" className="block aspect-[30/17] w-full">
              <defs>
                <linearGradient id="desert-sky" x2="0" y2="1">
                  <stop stopColor="#55427d" />
                  <stop offset="1" stopColor="#e8a696" />
                </linearGradient>
              </defs>
              <path fill="url(#desert-sky)" d="M0 0h600v340H0z" />
              <circle cx="425" cy="115" r="58" fill="#f8d8ac" />
              <path fill="#967094" d="M0 200 85 152l51 15 71-63 34 11 100 91 65-35 78 15 116-34v188H0z" />
              <path fill="#6b4e79" d="m0 229 106-37 77 34 101-29 103 43 103-43 110 12v131H0z" />
              <path fill="#402f54" d="m0 265 115 12 73-27 88 29 94-24 78 24 152-41v102H0z" />
              <path fill="#251f38" d="m0 290 120 20 123-12 87 18 90-4 180-44v72H0z" />
            </svg>
            <div className="space-y-2 px-4 py-3.5">
              <div className="flex gap-4 text-[#e3d6ff]">
                <span className="inline-flex items-center gap-1.5 text-xs"><Heart size={16} aria-hidden="true" /> 24 likes</span>
                <span className="inline-flex items-center gap-1.5 text-xs"><MessageCircle size={16} aria-hidden="true" /> 3 comments</span>
              </div>
              <p className="text-sm text-[#e6deef]">Desert studies, volume one.</p>
            </div>
          </div>
        </figure>
      </section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-8 px-5 pb-12 sm:px-10">
        <h2 className="mb-5 text-xl font-semibold tracking-tight">Make yourself at home</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-[#171620] p-5">
              <Icon size={20} className="mb-3 text-[#d8c6ff]" aria-hidden="true" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#c2bacf]">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
