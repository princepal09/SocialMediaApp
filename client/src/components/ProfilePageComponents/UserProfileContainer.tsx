import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import UserInfo from "./UserInfo";
import UserPosts from "./UserPosts";
import Spinner from "../general/Spinner";

import { getUserProfileInfo, geUserPosts } from "../../api/userProfile.api";
import { IUserProfileInfo, PostsResponse } from "../../types/userProfile";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Plus } from "lucide-react";

const UserProfileContainer = () => {
  const { username } = useParams<{ username: string }>();

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const [userProfileInfo, setUserProfileInfo] =
    useState<IUserProfileInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const [userPosts, setUserPosts] = useState<PostsResponse | null>(null);
  const [userPostLoading, setUserPostLoading] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setLoading(true);

      try {
        const response = await getUserProfileInfo(username);
        // console.log("userProfileInfo", response.data)
        setUserProfileInfo(response.data);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch profile");
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
        toast.error(err.message || "Failed to fetch posts");
      } finally {
        setUserPostLoading(false);
      }
    };

    fetchPosts();
  }, [username]);

  if (loading) {
    return <Spinner />;
  }

  if (!userProfileInfo) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        User not found
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-w-[64vw] pb-6">
        <UserInfo
          user={userProfileInfo}
          setUserProfileInfo={setUserProfileInfo}
        />

        <div className="flex justify-end">
          {loggedInUser?.username === username && (
            <Link
              to="/upload-post"
              className="group inline-flex mr-8 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
            >
              <Plus
                size={20}
                className="transition-transform duration-200 group-hover:rotate-90"
              />
              <span>Create Post</span>
            </Link>
          )}
        </div>
        {userPostLoading ? <Spinner /> : <UserPosts userPosts={userPosts} />}
      </div>
    </div>
  );
};

export default UserProfileContainer;
