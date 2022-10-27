import { getUserData, UserData } from "@decentraland/Identity";

export let userWallet: string;
export let userData: UserData;

export const getUser = async () => {
  userData = await getUserData();
  userWallet = userData.userId;
  log(userData)
}