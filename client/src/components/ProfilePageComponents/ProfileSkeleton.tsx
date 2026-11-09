
function ProfileSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-6">

      {/* PROFILE HEADER */}
      <section className="rounded-3xl border border-white/10 bg-[#191822] p-5 sm:p-7">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

          {/* PROFILE IMAGE */}
          <div className="mx-auto size-28 shrink-0 rounded-full bg-white/10 sm:mx-0 sm:size-32" />

          {/* USER INFO */}
          <div className="min-w-0 flex-1 space-y-4">

            <div className="mx-auto h-6 w-40 rounded-full bg-white/10 sm:mx-0" />

            {/* STATS */}
            <div className="flex justify-center gap-8 sm:justify-start">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-2 text-center">
                  <div className="mx-auto h-5 w-10 rounded bg-white/10" />
                  <div className="h-3 w-16 rounded bg-white/5" />
                </div>
              ))}
            </div>

            {/* BIO */}
            <div className="space-y-2">
              <div className="h-3 w-full max-w-md rounded-full bg-white/10" />
              <div className="h-3 w-3/4 max-w-sm rounded-full bg-white/5" />
            </div>

          </div>
        </div>
      </section>

      {/* CREATE POST BUTTON */}
      <div className="flex justify-center sm:justify-end">
        <div className="h-12 w-full rounded-xl bg-white/10 sm:w-40" />
      </div>

      {/* POSTS HEADING */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="h-5 w-28 rounded-full bg-white/10" />
        <div className="h-4 w-16 rounded-full bg-white/5" />
      </div>

      {/* USER POSTS GRID */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">

        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-xl border border-white/10 bg-[#191822]"
          >
            {/* POST IMAGE */}
            <div className="aspect-square bg-white/5" />

            {/* POST DETAILS */}
            <div className="space-y-2 p-3">
              <div className="h-3 w-4/5 rounded-full bg-white/10" />
              <div className="h-2.5 w-2/5 rounded-full bg-white/5" />
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default ProfileSkeleton;
