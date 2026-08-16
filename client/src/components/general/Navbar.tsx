import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { LoaderCircle, Search, User2, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../api/auth.api";
import { toast } from "sonner";
import { setLogout } from "../../store/slices/authSlice";
import { useEffect, useRef, useState } from "react";
import { SearchUser } from "../../types/searchUser";
import { searchUsers } from "../../api/feed.api";
import SearchInput from "../NavbarComponents/SearchInput";
import SearchResults from "../NavbarComponents/SearchResults";

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ================= SEARCH USERS =================
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await searchUsers(query.trim());

        setResults(res.data || []);
        setOpen(true);
      } catch (err) {
        console.error("Search error", err);
        setResults([]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      const clickedDesktopSearch = searchRef.current?.contains(target);

      const clickedMobileSearch = mobileSearchRef.current?.contains(target);

      if (!clickedDesktopSearch && !clickedMobileSearch) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ================= USER CLICK =================
  const handleUserClick = (username: string) => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setMobileSearchOpen(false);

    navigate(`/profile/${username}`);
  };

  // ================= CLEAR SEARCH =================
  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  // ================= CLOSE MOBILE SEARCH =================
  const handleCloseMobileSearch = () => {
    setMobileSearchOpen(false);
    handleClearSearch();
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {
    try {
      const response = await logout();

      toast.success(response?.message || "Logged out successfully");

      dispatch(setLogout());

      navigate("/login");
    } catch (err: any) {
      toast.error(err?.message || "Failed to log out. Please try again.");

      console.error(err);
    }
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav
        className="
          flex h-[68px] w-full shrink-0 items-center
          border-b border-white/10
          bg-black px-4 text-white
          sm:px-5 lg:px-8
        "
      >
        {/* ================= LOGO ================= */}
        <Link
          to="/feed"
          className="
            shrink-0 text-2xl font-bold
            tracking-tight text-[#9929EA]
            sm:text-3xl
          "
        >
          Pixora
        </Link>

        {/* ================= DESKTOP SEARCH ================= */}
        <div
          ref={searchRef}
          className="
            relative mx-auto hidden
            w-full max-w-md px-6
            lg:block
          "
        >
          <SearchInput
            query={query}
            setQuery={setQuery}
            loading={loading}
            onClear={handleClearSearch}
          />

          {/* Desktop Search Results */}
          {open && (
            <SearchResults
              loading={loading}
              results={results}
              onUserClick={handleUserClick}
            />
          )}
        </div>

        {/* ================= RIGHT SECTION ================= */}
        <div className="ml-auto flex items-center gap-2">
          {/* MOBILE + TABLET SEARCH */}
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(true);
              setOpen(false);
            }}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl text-zinc-400
              transition hover:bg-white/5 hover:text-white
              lg:hidden
            "
            aria-label="Search users"
          >
            <Search size={21} />
          </button>
          {/* RESPONSIVE PROFILE */}
          <Link
            to={`/profile/${user?.username}`}
            className="
    group flex items-center gap-2
    rounded-xl px-1 py-1
    transition-all duration-200
    hover:bg-white/5
    sm:px-2
  "
          >
            {/* Profile Image */}
            <div
              className="
      flex h-8 w-8 shrink-0 items-center justify-center
      overflow-hidden rounded-full
      bg-zinc-900
      text-xs font-semibold text-white
      ring-1 ring-white/10
      transition-all duration-200
      group-hover:ring-[#9929EA]/60

      sm:h-9 sm:w-9
    "
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user?.username || "Profile"}
                  className="
          h-full w-full object-cover
          transition-transform duration-300
          group-hover:scale-105
        "
                />
              ) : (
                <span>{user?.username?.charAt(0).toUpperCase() || "U"}</span>
              )}
            </div>

            {/* Username - hidden only on very small screens */}
            <span
              className="
      hidden max-w-[120px]
      truncate text-sm font-medium text-white

      sm:block
    "
            >
              {user?.username}
            </span>
          </Link>
        </div>
      </nav>

      {/* ================= MOBILE + TABLET SEARCH ================= */}
      {mobileSearchOpen && (
        <div
          ref={mobileSearchRef}
          className="
            fixed inset-x-0 top-[68px] z-50
            border-b border-white/10
            bg-black p-3
            lg:hidden
          "
        >
          <div className="mx-auto w-full max-w-2xl">
            <div className="relative">
              <Search
                size={18}
                className="
                  pointer-events-none absolute
                  left-3 top-1/2
                  -translate-y-1/2
                  text-zinc-400
                "
              />

              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (query.trim()) {
                    setOpen(true);
                  }
                }}
                placeholder="Search users..."
                className="
                  h-11 w-full rounded-xl
                  border border-white/10
                  bg-zinc-950
                  py-2 pl-10 pr-20
                  text-sm text-white
                  outline-none
                  placeholder:text-zinc-500
                  focus:border-[#9929EA]
                  focus:ring-1
                  focus:ring-[#9929EA]/30
                "
              />

              {/* Loading */}
              {loading && (
                <LoaderCircle
                  size={18}
                  className="
                    absolute right-12 top-1/2
                    -translate-y-1/2
                    animate-spin text-zinc-400
                  "
                />
              )}

              {/* Clear */}
              {query && !loading && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="
                    absolute right-12 top-1/2
                    -translate-y-1/2
                    text-zinc-400
                    hover:text-white
                  "
                >
                  <X size={18} />
                </button>
              )}

              {/* Close */}
              <button
                type="button"
                onClick={handleCloseMobileSearch}
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-zinc-400
                  hover:text-white
                "
              >
                <X size={20} />
              </button>
            </div>

            {/* MOBILE SEARCH RESULTS */}
            {open && (
              <div
                className="
                  mt-2 max-h-[60vh]
                  overflow-y-auto rounded-xl
                  border border-white/10
                  bg-black p-2 shadow-2xl
                "
              >
                {loading ? (
                  <div className="flex justify-center py-6">
                    <LoaderCircle
                      size={22}
                      className="animate-spin text-[#9929EA]"
                    />
                  </div>
                ) : results.length > 0 ? (
                  results.map((searchUser) => (
                    <button
                      key={searchUser._id}
                      type="button"
                      onClick={() => handleUserClick(searchUser.username)}
                      className="
                        flex w-full items-center gap-3
                        rounded-lg px-3 py-3
                        text-left transition
                        hover:bg-white/5
                      "
                    >
                      {searchUser.profileImage ? (
                        <img
                          src={searchUser.profileImage}
                          alt={searchUser.username}
                          className="
                            h-10 w-10 shrink-0
                            rounded-full object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-full bg-zinc-900
                          "
                        >
                          <User2 size={19} className="text-zinc-400" />
                        </div>
                      )}

                      <span className="truncate text-sm font-medium text-white">
                        @{searchUser.username}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-zinc-400">
                    No users found
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
