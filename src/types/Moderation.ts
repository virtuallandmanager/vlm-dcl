import { TNFTConfig } from "./NFT";
import { TPlayerConfig } from "./Player";

export type TModerationConfig = {
  allowCertainWearables?: boolean;
  banCertainWearables?: boolean;
  allowCertainUsers?: boolean;
  banCertainUsers?: boolean;
  allowWeb3Only?: boolean;
  allowedWearables?: TNFTConfig[];
  bannedWearables?: TNFTConfig[];
  bannedUsers?: TPlayerConfig[];
  allowedUsers?: TPlayerConfig[];
  banActions?: EBanActions[];
  banWallType?: EBanWallType
};

export enum EBanActions {
  WALL,
  BLACKOUT
}

export enum EBanWallType {
  BLACK,
  INVISIBLE,
  MIRROR
}
