import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import UserInfo from "./UserInfo";
import UserPosts from "./UserPosts";
import ProfileSkeleton from "./ProfileSkeleton";

import {
  getUserProfileInfo,
  geUserPosts,
} from "../../api/userProfile.api";

import {
  IUserProfileInfo,
  PostsResponse,
} from "../../types/userProfile";

import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Plus } from "lucide-react";

const UserProfileContainer = () => {
  const { username } = useParams<{ username: string }>();

  const loggedInUser = useSelector(
    (state: RootState) => state.auth.user,
  );

  const [userProfileInfo, setUserProfileInfo] =
    useState<IUserProfileInfo | null>(null);

  const [loading, setLoading] = useState(true);

  const [userPosts, setUserPosts] =
    useState<PostsResponse | null>(null);

  const [userPostLoading, setUserPostLoading] =
    useState(true);

  // FETCH USER PROFILE
  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setLoading(true);

      try {
        const response = await getUserProfileInfo(username);

        setUserProfileInfo(response.data);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch profile";

        toast.error(message);
        setUserProfileInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  // FETCH USER POSTS
  useEffect(() => {
    if (!username) return;

    const fetchPosts = async () => {
      setUserPostLoading(true);

      try {
        const response = await geUserPosts(username);

        setUserPosts(response.data);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch posts";

        toast.error(message);
        setUserPosts(null);
      } finally {
        setUserPostLoading(false);
      }
    };

    fetchPosts();
  }, [username]);

  // DELETE POST FROM UI
  const handleDeletePostFromUi = (postId: string) => {
    setUserPosts((prev) =>
      prev
        ? prev.filter((post) => post._id !== postId)
        : null,
    );

    setUserProfileInfo((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        postCount: Math.max(0, prev.postCount - 1),
      };
    });
  };

  // PROFILE LOADING SKELETON
  if (loading) {
    return (
      <div className="h-full w-full overflow-x-hidden overflow-y-auto bg-[#101017]">
        <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 md:px-6 lg:px-8">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  // USER NOT FOUND
  if (!userProfileInfo) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#101017] px-4 text-center text-white">
        <div>
          <h2 className="text-xl font-semibold">
            User not found
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            This profile may not exist or is unavailable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto bg-[#101017]">

      <div
        className="
          mx-auto
          w-full
          max-w-5xl
          px-3
          pb-6
          sm:px-4
          md:px-6
          lg:px-8
        "
      >

        {/* USER INFO */}
        {/* Update Profile Image + Update Bio functionality */}
        {/* stays inside UserInfo */}

        <UserInfo
          user={userProfileInfo}
          setUserProfileInfo={setUserProfileInfo}
        />

        {/* CREATE POST - ONLY FOR LOGGED-IN USER */}

        {loggedInUser?.username === username && (
          <div
            className="
              mt-3
              flex
              w-full
              justify-center
              sm:justify-end
            "
          >
            <Link
              to="/upload-post"
              className="
                group
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                px-4
                py-3
                font-semibold
                text-white
                shadow-lg
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:from-blue-700
                hover:to-indigo-700
                hover:shadow-xl
                active:scale-[0.98]
                sm:w-auto
                sm:px-5
              "
            >
              <Plus
                size={20}
                className="
                  transition-transform
                  duration-200
                  group-hover:rotate-90
                "
              />

              <span>Create Post</span>
            </Link>
          </div>
        )}

        {/* USER POSTS */}

        <div className="mt-5 w-full">

          {userPostLoading ? (

            /* POSTS SKELETON */

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">

              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="
                    animate-pulse
                    overflow-hidden
                    rounded-xl
                    border
                    border-white/10
                    bg-[#191822]
                  "
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

          ) : (

            <UserPosts
              onDeletePost={handleDeletePostFromUi}
              userPosts={userPosts}
            />

          )}

        </div>

      </div>
    </div>
  );
};

export default UserProfileContainer;