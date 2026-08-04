import React, { useEffect, useState } from "react";
import UserInfo from "./UserInfo";
import { IUserProfileInfo } from "../../types/userProfile";
import { useParams } from "react-router-dom";
import { getUserProfileInfo } from "../../api/userProfile.api";
import { toast } from "sonner";
import Spinner from "../general/Spinner";

const UserProfileContainer = () => {
  const { username } = useParams<{ username: string }>();
  const [userProfileInfo, setUserProfileInfo] =
    useState<IUserProfileInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!userProfileInfo) {
    return <div className="min-w-[64w] text-white p-6">User not found</div>;
  }
  return (
    <div className="min-w-[64vw]">
      <UserInfo user={userProfileInfo} />
    </div>
  );
};

export default UserProfileContainer;
