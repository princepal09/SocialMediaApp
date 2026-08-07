import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

const UserProfileContainer = () => {
  const { username } = useParams<{ username: string }>();

  const [userProfileInfo, setUserProfileInfo] =
    useState<IUserProfileInfo | null>(null);

  const [userPosts, setUserPosts] =
    useState<PostsResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [userPostLoading, setUserPostLoading] = useState(false);

  // Fetch Profile
  const refetchProfile = useCallback(async () => {
    if (!username) return;

    try {
      const response = await getUserProfileInfo(username);
      setUserProfileInfo(response.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch profile");
    }
  }, [username]);

  // Initial Profile Fetch
  useEffect(() => {
    if (!username) return;

    const init = async () => {
      setLoading(true);
      await refetchProfile();
      setLoading(false);
    };

    init();
  }, [username, refetchProfile]);

  // Fetch User Posts
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
      <div className="text-center text-white py-10">
        User not found
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <UserInfo
        user={userProfileInfo}
        refetchProfile={refetchProfile}
      />

      <div className="mt-8">
        {userPostLoading ? (
          <Spinner />
        ) : (
          <UserPosts userPosts={userPosts} />
        )}
      </div>
    </div>
  );
};

export default UserProfileContainer;