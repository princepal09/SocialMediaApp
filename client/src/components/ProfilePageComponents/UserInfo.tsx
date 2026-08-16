import { useEffect, useRef, useState } from "react";
import { IUserProfileInfo } from "../../types/userProfile";
import { toast } from "sonner";
import {
  addBio,
  followUser,
  unfollowUser,
  updateBio,
  updateProfileImage,
} from "../../api/userProfile.api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Pencil } from "lucide-react";
import { setUser } from "../../store/slices/authSlice";
import { getOrCreateConversations } from "../../api/chat.api";
import { useNavigate } from "react-router-dom";

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

  const [messageLoading, setMessageLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState(user.bio || "");
  const [bioLoading, setBioLoading] = useState(false);

  const dispatch = useDispatch();
  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const navigate = useNavigate();

  useEffect(() => {
    setBioInput(user.bio || "");
  }, [user]);

  const handleSaveBio = async () => {
    const bio = bioInput.trim();

    if (!bio) {
      toast.error("Bio cannot be empty");
      return;
    }

    setBioLoading(true);

    try {
      let response;

      if (!user.bio) {
        response = await addBio(bio);
        toast.success("Bio added successfully");
      } else {
        response = await updateBio(bio);
        toast.success("Bio updated successfully");
      }

      dispatch(setUser(response.data));

      setUserProfileInfo((prev) =>
        prev
          ? {
              ...prev,
              bio: response.data.bio,
            }
          : prev,
      );

      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setBioLoading(false);
    }
  };

  const handleClickMessage = async () => {
    setMessageLoading(true);
    try {
      const response = await getOrCreateConversations(user._id);
      navigate(
        `/chat/${user.username}/rcid/${user._id}/cid/${response.data._id}`,
        {
          state: {
            profileImage: user?.profileImage,
          },
        },
      );
    } catch (err: any) {
      toast.error(err.messsage || "Cannot send message");
    } finally {
      setMessageLoading(false);
    }
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
      // console.log(response.data)
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
    <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 md:px-6 md:py-5">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        {/* Profile section */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          {/* Profile Image */}
          <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
            <img
              src={user?.profileImage || "/defaultProfile.png"}
              alt={user?.username}
              className="
              h-16 w-16 rounded-full object-cover
              border-2 border-violet-500
              shadow-[0_0_25px_rgba(168,85,247,0.8)]
              sm:h-20 sm:w-20
            "
            />

            {isOwnProfile && (
              <button
                type="button"
                onClick={handlePickImage}
                disabled={imageUploading}
                className="
                absolute bottom-0 right-0
                flex h-7 w-7 items-center justify-center
                rounded-full border border-gray-300
                bg-white text-black shadow-md
                transition-all duration-200
                hover:scale-105 hover:bg-gray-100
                disabled:opacity-50
              "
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
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
              @{user?.username}
            </h1>

            <p className="truncate text-xs text-zinc-400 sm:text-sm">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Follow / Message buttons */}
        {!isOwnProfile && (
          <div className="flex w-full flex-col gap-2 xs:flex-row md:w-auto md:flex-row md:gap-3">
            <button
              onClick={handleFollowToggle}
              disabled={loading}
              className={`
              w-full rounded-xl px-4 py-2.5
              text-sm font-medium text-white
              transition-all duration-300
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-60
              md:w-auto md:px-5

              ${
                isFollowing
                  ? "bg-zinc-700 hover:bg-red-600"
                  : "bg-violet-600 hover:bg-violet-700"
              }
            `}
            >
              {loading ? "Please wait..." : isFollowing ? "Unfollow" : "Follow"}
            </button>

            <button
              disabled={messageLoading}
              onClick={handleClickMessage}
              className="
              w-full cursor-pointer
              rounded-xl border border-zinc-700
              px-4 py-2.5
              text-sm text-white
              transition-colors
              hover:bg-zinc-800
              disabled:cursor-not-allowed
              disabled:opacity-50
              md:w-auto md:px-5
            "
            >
              {messageLoading ? "Loading..." : "Message"}
            </button>
          </div>
        )}
      </div>

      {/* Bio */}
      {(user.bio || isOwnProfile) && (
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:mt-6 sm:rounded-2xl sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-widest text-zinc-500">
              Bio
            </p>

            {isOwnProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-violet-400 hover:text-violet-300"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>

          {isEditing ? (
            <>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="Write something about yourself..."
                className="
                w-full resize-none rounded-lg
                border border-zinc-700 bg-zinc-800
                p-3 text-sm text-white outline-none
                focus:border-violet-500
                sm:text-base
              "
              />

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => {
                    setBioInput(user.bio || "");
                    setIsEditing(false);
                  }}
                  className="
                  w-full rounded-lg bg-zinc-700
                  px-4 py-2 text-sm text-white
                  hover:bg-zinc-600
                  sm:w-auto
                "
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveBio}
                  disabled={bioLoading}
                  className="
                  w-full rounded-lg bg-violet-600
                  px-4 py-2 text-sm text-white
                  hover:bg-violet-700
                  disabled:opacity-60
                  sm:w-auto
                "
                >
                  {bioLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </>
          ) : (
            <p className="break-words text-sm text-zinc-200">{user.bio}</p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-center sm:rounded-2xl sm:py-4">
          <h2 className="truncate text-lg font-bold text-white sm:text-2xl">
            {user.postCount}
          </h2>

          <p className="truncate text-[9px] uppercase tracking-wide text-zinc-500 sm:text-[11px] sm:tracking-widest">
            Posts
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-center sm:rounded-2xl sm:py-4">
          <h2 className="truncate text-lg font-bold text-white sm:text-2xl">
            {followersCount}
          </h2>

          <p className="truncate text-[9px] uppercase tracking-wide text-zinc-500 sm:text-[11px] sm:tracking-widest">
            Followers
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-center sm:rounded-2xl sm:py-4">
          <h2 className="truncate text-lg font-bold text-white sm:text-2xl">
            {user.followingCount}
          </h2>

          <p className="truncate text-[9px] uppercase tracking-wide text-zinc-500 sm:text-[11px] sm:tracking-widest">
            Following
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
