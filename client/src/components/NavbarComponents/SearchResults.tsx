import { LoaderCircle, User2 } from "lucide-react";
import { SearchUser } from "../../types/searchUser";

interface SearchResultsProps {
  loading: boolean;
  results: SearchUser[];
  onUserClick: (username: string) => void;
}

const SearchResults = ({
  loading,
  results,
  onUserClick,
}: SearchResultsProps) => {
  return (
    <div
      className="
        absolute left-6 right-6 top-full z-50
        mt-2 max-h-[70vh]
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
            onClick={() =>
              onUserClick(searchUser.username)
            }
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
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900">
                <User2
                  size={18}
                  className="text-zinc-400"
                />
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
  );
};

export default SearchResults;