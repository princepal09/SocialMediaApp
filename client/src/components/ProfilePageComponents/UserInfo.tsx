import { useState } from "react";
import { IUserProfileInfo } from "../../types/userProfile";
import { toast } from "sonner";
import { followUser, unfollowUser } from "../../api/userProfile.api";

interface UserInfoProps {
  user: IUserProfileInfo;
}

const UserInfo = ({ user }: UserInfoProps) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(user.isFollowing);
  console.log(isFollowing)
  const [followersCount, setFollowersCount] = useState(user.followersCount);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.username);
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        await followUser(user.username);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        toast.success(`You started following ${user.username}`);
      }
    } catch (err: any) {
      toast.error(err.message);
      console.log("ERROR WHILE FOLLOW FOLLOWING", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-5">
      {/* Header */}
      <div className="flex px-4 items-start justify-between">
        <div className="flex flex-col gap-4">
          {/* Avatar */}
          <img
            src={user?.profileImage || "/avatar1.jpg"}
            alt={user?.username}
            className="w-20 h-20 rounded-full object-cover border-2 border-violet-500 shadow-[0_0_25px_rgba(168,85,247,0.8)]"
          />

          {/* User Info */}
          <div>
            <h1 className="text-2xl  font-bold text-white">
              @{user?.username}
            </h1>

            <p className="text-sm text-zinc-400">{user?.email}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex mt-7 gap-2">
          <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={`
    px-5 py-2 rounded-xl text-sm font-medium cursor-pointer
    transition-all duration-300 ease-in-out
    active:scale-95 text-white
    disabled:opacity-60
    ${
      isFollowing
        ? "bg-zinc-700 hover:bg-red-600"
        : "bg-violet-600 hover:bg-violet-700"
    }
  `}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>

          <button className="px-5 py-2 rounded-xl border border-zinc-700 text-white text-sm hover:bg-zinc-900">
            Message
          </button>
        </div>
      </div>

      {/* Bio */}
      {user?.bio ? (
        <div className="mt-6 rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-2">
            Bio
          </p>

          <p className="text-sm text-zinc-200">{user.bio}</p>
        </div>
      ) : (
        ""
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-5">
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 py-4 text-center">
          <h2 className="text-2xl font-bold text-white">{user.postCount}</h2>

          <p className="text-[11px] tracking-widest uppercase text-zinc-500">
            Posts
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 py-4 text-center">
          <h2 className="text-2xl font-bold text-white">
            {followersCount}
          </h2>

          <p className="text-[11px] tracking-widest uppercase text-zinc-500">
            Followers
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 py-4 text-center">
          <h2 className="text-2xl font-bold text-white">
            {user.followingCount}
          </h2>

          <p className="text-[11px] tracking-widest uppercase text-zinc-500">
            Following
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
