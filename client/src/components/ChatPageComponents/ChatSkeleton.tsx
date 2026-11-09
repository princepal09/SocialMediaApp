function ChatSkeleton() {
  return (
    <div className="flex h-full min-h-0 animate-pulse flex-col overflow-hidden bg-black text-white">

      {/* ================= HEADER ================= */}

      <header className="flex items-center justify-between border-b border-white/10 bg-black px-5 py-4">

        <div className="flex items-center gap-3">

          {/* Receiver Avatar */}
          <div className="size-11 shrink-0 rounded-full bg-white/10" />

          {/* Receiver Name */}
          <div className="space-y-2">
            <div className="h-3.5 w-28 rounded-full bg-white/10" />
            <div className="h-2.5 w-16 rounded-full bg-white/5" />
          </div>

        </div>

        {/* Live Status */}
        <div className="h-3 w-20 rounded-full bg-white/10" />

      </header>


      {/* ================= MESSAGES ================= */}

      <main className="flex-1 overflow-hidden bg-black px-4 py-6 sm:px-6">

        <div className="mx-auto flex h-full max-w-3xl flex-col justify-end gap-6">

          {/* Incoming Message 1 */}
          <div className="flex items-end gap-2">

            <div className="mb-1 size-8 shrink-0 rounded-full bg-white/10" />

            <div className="max-w-[75%] space-y-2">

              <div className="h-10 w-48 rounded-2xl rounded-bl-md bg-zinc-900" />

              <div className="h-2 w-12 rounded-full bg-white/5" />

            </div>

          </div>


          {/* Outgoing Message 1 */}
          <div className="flex items-end justify-end gap-2">

            <div className="max-w-[75%] space-y-2">

              <div className="ml-auto h-10 w-56 rounded-2xl rounded-br-md bg-indigo-900/40" />

              <div className="ml-auto h-2 w-12 rounded-full bg-white/5" />

            </div>

            <div className="mb-1 size-8 shrink-0 rounded-full bg-white/10" />

          </div>


          {/* Incoming Message 2 */}
          <div className="flex items-end gap-2">

            <div className="mb-1 size-8 shrink-0 rounded-full bg-white/10" />

            <div className="max-w-[75%] space-y-2">

              <div className="h-20 w-52 overflow-hidden rounded-2xl rounded-bl-md bg-zinc-900">

                <div className="h-full w-full bg-white/5" />

              </div>

              <div className="h-2 w-12 rounded-full bg-white/5" />

            </div>

          </div>


          {/* Outgoing Message 2 */}
          <div className="flex items-end justify-end gap-2">

            <div className="max-w-[75%] space-y-2">

              <div className="h-10 w-40 rounded-2xl rounded-br-md bg-indigo-900/40" />

              <div className="ml-auto h-2 w-12 rounded-full bg-white/5" />

            </div>

            <div className="mb-1 size-8 shrink-0 rounded-full bg-white/10" />

          </div>


          {/* Incoming Message 3 */}
          <div className="flex items-end gap-2">

            <div className="mb-1 size-8 shrink-0 rounded-full bg-white/10" />

            <div className="max-w-[75%] space-y-2">

              <div className="h-10 w-64 rounded-2xl rounded-bl-md bg-zinc-900" />

              <div className="h-2 w-12 rounded-full bg-white/5" />

            </div>

          </div>


          {/* Outgoing Message 3 */}
          <div className="flex items-end justify-end gap-2">

            <div className="max-w-[75%] space-y-2">

              <div className="h-14 w-52 rounded-2xl rounded-br-md bg-indigo-900/40" />

              <div className="ml-auto h-2 w-12 rounded-full bg-white/5" />

            </div>

            <div className="mb-1 size-8 shrink-0 rounded-full bg-white/10" />

          </div>

        </div>

      </main>


      {/* ================= INPUT SKELETON ================= */}

      <footer className="border-t border-white/10 bg-black px-4 py-4 sm:px-6">

        <div className="mx-auto max-w-3xl">

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-xl">

            {/* Image Button */}
            <div className="size-10 shrink-0 rounded-xl bg-white/5" />

            {/* Text Input */}
            <div className="h-4 flex-1 rounded-full bg-white/5" />

            {/* Send Button */}
            <div className="size-10 shrink-0 rounded-xl bg-indigo-900/40" />

          </div>

        </div>

      </footer>

    </div>
  );
}

export default ChatSkeleton;