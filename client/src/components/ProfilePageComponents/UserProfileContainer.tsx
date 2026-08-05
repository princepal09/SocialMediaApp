import { useEffect, useState } from "react";
import UserInfo from "./UserInfo";
import { IUserProfileInfo } from "../../types/userProfile";
import { useParams } from "react-router-dom";
import { getUserProfileInfo, geUserPosts } from "../../api/userProfile.api";
import { toast } from "sonner";
import Spinner from "../general/Spinner";
import UserPosts from "./UserPosts";
import { PostsResponse } from "../../types/userProfile";

const UserProfileContainer = () => {
  const { username } = useParams<{ username: string }>();
  const [userProfileInfo, setUserProfileInfo] =
    useState<IUserProfileInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [userPosts, setUserPosts] = useState<PostsResponse | null>(null);
  const [userPostLoading, setuserPostLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!username) return;
    const getUserProfileData = async () => {
      setLoading(true);
      try {
        const response = await getUserProfileInfo(username);
        console.log(response);
        setUserProfileInfo(response?.data);
      } catch (err: any) {
        console.log("Failed to fetch profile", err);
        toast.error(err.message || "Failed to fetch the user");
      } finally {
        setLoading(false);
      }
    };

    getUserProfileData();
  }, [username]);

  const getPostUser = async () => {
    if (!username) return;
    setuserPostLoading(true);
    try {
      const response = await geUserPosts(username);
      // console.log("getPOst User", response.data);
      setUserPosts(response.data);
    } catch (err: any) {
      toast.error(err.message);
      console.log("GET USER POST", err);
    } finally {
      setuserPostLoading(false);
    }
  };

  useEffect(() => {
    getPostUser();
  }, [username]);

  if (loading) {
    return <Spinner />;
  }

  if (!userProfileInfo) {
    return <div className="min-w-[64w] text-white p-6">User not found</div>;
  }
  return (
    <div className="min-w-[64vw] flex-col flex">
      <UserInfo user={userProfileInfo} />

      {userPostLoading ? <Spinner /> : <UserPosts userPosts={userPosts} />}
    </div>
  );
};

export default UserProfileContainer;
