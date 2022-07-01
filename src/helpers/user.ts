import { getUserAccount } from "@decentraland/EthereumController";

export let user: any;

export async function getUser() {
  user = await getUserAccount();
}
