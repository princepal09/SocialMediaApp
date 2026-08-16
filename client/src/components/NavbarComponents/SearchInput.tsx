import { LoaderCircle, Search, X } from "lucide-react";

interface SearchInputProps {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  onClear: () => void;
}

const SearchInput = ({
  query,
  setQuery,
  loading,
  onClear,
}: SearchInputProps) => {
  return (
    <div className="relative">
      <Search
        size={18}
        className="
          pointer-events-none
          absolute left-3 top-1/2
          -translate-y-1/2
          text-zinc-400
        "
      />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="
          h-10 w-full rounded-xl
          border border-white/10 bg-zinc-950
          py-2 pl-10 pr-10
          text-sm text-white outline-none
          placeholder:text-zinc-500
          focus:border-[#9929EA]
          focus:ring-1 focus:ring-[#9929EA]/30
        "
      />

      {loading ? (
        <LoaderCircle
          size={18}
          className="
            absolute right-3 top-1/2
            -translate-y-1/2
            animate-spin text-zinc-400
          "
        />
      ) : (
        query && (
          <button
            type="button"
            onClick={onClear}
            className="
              absolute right-3 top-1/2
              -translate-y-1/2
              text-zinc-400 hover:text-white
            "
          >
            <X size={18} />
          </button>
        )
      )}
    </div>
  );
};


export default SearchInput;