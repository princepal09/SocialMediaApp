import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { LoaderCircle, Search, User2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../api/auth.api";
import { toast } from "sonner";
import { setLogout } from "../../store/slices/authSlice";
import { useEffect, useRef, useState } from "react";
import { SearchUser } from "../../types/searchUser";
import { searchUsers } from "../../api/feed.api";

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Search users
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await searchUsers(query);

        setResults(res.data || []);
        setOpen(true);
      } catch (err) {
        console.log("Search error", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUserClick = (username: string) => {
    setQuery("");
    setResults([]);
    setOpen(false);

    navigate(`/profile/${username}`);
  };

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
    <nav className="relative flex items-center justify-between border-b border-white/10 bg-black px-4 py-4 text-white md:px-20">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-[#9929EA] md:text-3xl">
        Pixora
      </Link>

      {/* Search */}
      <div
        ref={searchRef}
        className="relative mx-4 hidden w-full max-w-md md:block"
      >
        <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900 px-3 transition focus-within:border-[#9929EA]/60 focus-within:ring-2 focus-within:ring-[#9929EA]/10">
          <Search size={18} className="shrink-0 text-zinc-500" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) {
                setOpen(true);
              }
            }}
            placeholder="Search users..."
            className="w-full  px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500"
          />

          {loading && (
            <LoaderCircle size={17} className="animate-spin text-[#9929EA]" />
          )}

          {!loading && query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              className="text-zinc-500 transition hover:text-white"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* Search Results */}
        {open && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/60">
            {loading && (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-zinc-400">
                <LoaderCircle size={16} className="animate-spin" />
                Searching...
              </div>
            )}

            {!loading && results.length === 0 && query.trim() && (
              <div className="px-4 py-8 text-center">
                <Search size={24} className="mx-auto mb-2 text-zinc-600" />

                <p className="text-sm text-zinc-400">No users found</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="max-h-96 overflow-y-auto p-2">
                {results.map((searchUser) => (
                  <button
                    key={searchUser._id}
                    type="button"
                    onClick={() => handleUserClick(searchUser.username)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white/5"
                  >
                    {/* Profile Image */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800">
                      {searchUser.profileImage ? (
                        <img
                          src={searchUser.profileImage}
                          alt={searchUser.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User2 size={19} className="text-zinc-400" />
                      )}
                    </div>

                    {/* User Details */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {searchUser.username}
                      </p>

                      {searchUser.bio && (
                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                          {searchUser.bio}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logged In User */}
      {user ? (
        <div className="flex shrink-0 items-center gap-3 md:gap-2">
          <Link to={`/profile/${user.username}`}>
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-700 md:h-10 md:w-10">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User2 size={18} />
              )}
            </div>
          </Link>

          <Link to={`/profile/${user.username}`}>
            <span className="hidden text-sm font-medium sm:block md:text-base">
              {user.username}
            </span>
          </Link>
        </div>
      ) : (
        <User2 className="h-6 w-6" />
      )}
    </nav>
  );
};

export default Navbar;
