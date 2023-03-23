import { getUserData, UserData } from "@decentraland/Identity";

export let userWallet: string;
export let userData: UserData;

export const getUser = async () => {
  const newUserData = await getUserData();
  if (newUserData) {
    userData = newUserData;
    userWallet = newUserData.userId;
  }
  return newUserData
};
