export declare namespace VLMModeration {
    enum BanActions {
        WALL = 0,
        BLACKOUT = 1
    }
    enum BanWallType {
        BLACK = 0,
        INVISIBLE = 1,
        MIRROR = 2
    }
    class Config {
        sk: string;
        allowCertainWearables?: boolean;
        banCertainWearables?: boolean;
        allowCertainUsers?: boolean;
        banCertainUsers?: boolean;
        allowWeb3Only?: boolean;
        allowedWearables?: {
            contractAddress: string;
            itemId: string;
        }[];
        bannedWearables?: {
            contractAddress: string;
            itemId: string;
        }[];
        bannedUsers?: {
            walletAddress?: string;
            displayName?: string;
        }[];
        allowedUsers?: {
            walletAddress?: string;
            displayName?: string;
        }[];
        banActions?: BanActions[];
        banWallType?: BanWallType;
        constructor(config: VLMConfig);
    }
    class VLMConfig extends Config {
    }
}
