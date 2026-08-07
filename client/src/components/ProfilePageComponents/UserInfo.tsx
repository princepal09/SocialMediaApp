import { useRef, useState } from "react";
import { IUserProfileInfo } from "../../types/userProfile";
import { toast } from "sonner";
import {
  followUser,
  unfollowUser,
  updateProfileImage,
} from "../../api/userProfile.api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Pencil } from "lucide-react";
import { setUser } from "../../store/slices/authSlice";

interface UserInfoProps {
  user: IUserProfileInfo;
  setUserProfileInfo: React.Dispatch<
    React.SetStateAction<IUserProfileInfo | null>
  >;
}

const UserInfo = ({ user, setUserProfileInfo }: UserInfoProps) => {
  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const [isFollowing, setIsFollowing] = useState<boolean>(user.isFollowing);
  // console.log(isFollowing);
  const [followersCount, setFollowersCount] = useState(user.followersCount);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isOwnProfile = loggedInUser?.username === user.username;

  const dispatch = useDispatch();
  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    setImageUploading(true);

    const toastId = toast.loading("Updating profile image...");

    try {
      const response = await updateProfileImage(formData);
      dispatch(setUser(response.data));
      setUserProfileInfo((prev) =>
        prev
          ? {
              ...prev,
              profileImage: response.data.profileImage,
            }
          : prev,
      );

      toast.success("Profile image updated successfully", {
        id: toastId,
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile image", {
        id: toastId,
      });
    } finally {
      setImageUploading(false);
      toast.dismiss(toastId);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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

      <div className="flex items-center gap-5">
        {/* Profile Image */}
        <div className="relative w-20 h-20">
          <img
            src={user?.profileImage || "/defaultProfile.png"}
            alt={user?.username}
            className="w-20 h-20 rounded-full object-cover border-2 border-violet-500 shadow-[0_0_25px_rgba(168,85,247,0.8)]"
          />

          {isOwnProfile && (
            <button
              type="button"
              onClick={handlePickImage}
              disabled={imageUploading}
              className="absolute bottom-0 cursor-pointer right-0 w-7 h-7 rounded-full bg-white hover:bg-gray-100 text-black flex items-center justify-center border border-gray-300 shadow-md transition-all duration-200 hover:scale-105"
            >
              <Pencil size={14} />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfileImageChange}
          />
        </div>

        {/* User Info */}
        <div>
          <h1 className="text-2xl font-bold text-white">@{user?.username}</h1>

          <p className="text-sm text-zinc-400">{user?.email}</p>
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
          <h2 className="text-2xl font-bold text-white">{followersCount}</h2>

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
