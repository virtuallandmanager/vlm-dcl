import { getEntityByName } from "src/shared/entity";

export namespace VLMModeration {
  export enum BanActions {
    WALL,
    BLACKOUT,
  }

  export enum BanWallType {
    BLACK,
    INVISIBLE,
    MIRROR,
  }

  export class DCLConfig {
    sk: string;
    allowCertainWearables?: boolean;
    banCertainWearables?: boolean;
    allowCertainUsers?: boolean;
    banCertainUsers?: boolean;
    allowWeb3Only?: boolean;
    allowedWearables?: { contractAddress: string; itemId: string }[];
    bannedWearables?: { contractAddress: string; itemId: string }[];
    bannedUsers?: { walletAddress?: string; displayName?: string }[];
    allowedUsers?: { walletAddress?: string; displayName?: string }[];
    banActions?: BanActions[];
    banWallType?: BanWallType;

    constructor(config?: VLMConfig) {
      if (!config) {
        return;
      }
      this.sk = config.sk;
      this.allowCertainWearables = config.allowCertainWearables || this.allowCertainWearables;
      this.banCertainWearables = config.banCertainWearables || this.banCertainWearables;
      this.allowCertainUsers = config.allowCertainUsers || this.allowCertainUsers;
      this.banCertainUsers = config.banCertainUsers || this.banCertainUsers;
      this.allowWeb3Only = config.allowWeb3Only || this.allowWeb3Only;
      this.allowedWearables = config.allowedWearables || this.allowedWearables;
      this.bannedWearables = config.bannedWearables || this.bannedWearables;
      this.bannedUsers = config.bannedUsers || this.bannedUsers;
      this.allowedUsers = config.allowedUsers || this.allowedUsers;
      this.banActions = config.banActions || this.banActions;
      this.banWallType = config.banWallType || this.banWallType;
    }
  }
  export class VLMConfig extends DCLConfig {}
}
