import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import UserInfo from "./UserInfo";
import UserPosts from "./UserPosts";
import Spinner from "../general/Spinner";

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

  const [loading, setLoading] = useState(false);

  const [userPosts, setUserPosts] =
    useState<PostsResponse | null>(null);

  const [userPostLoading, setUserPostLoading] =
    useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setLoading(true);

      try {
        const response = await getUserProfileInfo(username);

        setUserProfileInfo(response.data);
      } catch (err: any) {
        toast.error(
          err.message || "Failed to fetch profile",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (!username) return;

    const fetchPosts = async () => {
      setUserPostLoading(true);

      try {
        const response = await geUserPosts(username);

        setUserPosts(response.data);
      } catch (err: any) {
        toast.error(
          err.message || "Failed to fetch posts",
        );
      } finally {
        setUserPostLoading(false);
      }
    };

    fetchPosts();
  }, [username]);

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
        postCount: Math.max(
          0,
          prev.postCount - 1,
        ),
      };
    });
  };

  if (loading) {
    return <Spinner />;
  }

  if (!userProfileInfo) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4 text-center text-white">
        User not found
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto">
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
        {/* USER INFO
            Update Profile Image + Update Bio functionality
            stays inside UserInfo
        */}
        <UserInfo
          user={userProfileInfo}
          setUserProfileInfo={setUserProfileInfo}
        />

        {/* CREATE POST - PRESERVED */}
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
        <div className="w-full">
          {userPostLoading ? (
            <Spinner />
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