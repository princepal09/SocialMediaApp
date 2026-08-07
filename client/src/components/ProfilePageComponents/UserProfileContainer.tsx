import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import UserInfo from "./UserInfo";
import UserPosts from "./UserPosts";
import Spinner from "../general/Spinner";

import { getUserProfileInfo, geUserPosts } from "../../api/userProfile.api";
import { IUserProfileInfo, PostsResponse } from "../../types/userProfile";

const UserProfileContainer = () => {
  const { username } = useParams<{ username: string }>();

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

        {userPostLoading ? <Spinner /> : <UserPosts userPosts={userPosts} />}
      </div>
    </div>
  );
};

export default UserProfileContainer;
