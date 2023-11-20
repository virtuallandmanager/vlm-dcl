import { VLMNotification } from "./VLMNotification.component";
import { VLMBase } from "./VLMBase.component";
export declare namespace VLMClaimPoint {
    const configs: {
        [uuid: string]: VLMClaimPoint.Config;
    };
    const instances: {
        [uuid: string]: VLMClaimPoint.Instance;
    };
    class Config extends VLMBase.Config {
        sk: string;
        instanceIds: string[];
        messageOptions?: VLMNotification.MessageOptions;
        requestInProgress: boolean;
        constructor(config: VLMConfig);
        addAll: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        createOrReplaceInstance: CallableFunction;
        removeInstance: CallableFunction;
        deleteInstance: CallableFunction;
    }
    type VLMConfig = Config & VLMBase.VLMTextureConfig & {
        instances: Instance[];
    };
    class Instance extends VLMBase.Instance {
        constructor(config: Config, instance: Instance);
        init: CallableFunction;
        add: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
    }
    interface ClaimResponse {
        sk: string;
        giveawayId?: string;
        responseType?: ClaimResponseType;
        reason?: ClaimRejection;
    }
    enum ClaimRejection {
        PAUSED = 0,
        BEFORE_EVENT_START = 1,
        AFTER_EVENT_END = 2,
        EXISTING_WALLET_CLAIM = 3,
        SUPPLY_DEPLETED = 4,
        INAUTHENTIC = 5,
        SUSPICIOUS = 6,
        NO_LINKED_EVENTS = 7,
        OVER_IP_LIMIT = 8,
        OVER_DAILY_LIMIT = 9,
        OVER_WEEKLY_LIMIT = 10,
        OVER_MONTHLY_LIMIT = 11,
        OVER_YEARLY_LIMIT = 12,
        OVER_LIMIT = 13
    }
    enum ClaimResponseType {
        CLAIM_ACCEPTED = 0,
        CLAIM_DENIED = 1,
        CLAIM_IN_PROGRESS = 2,
        CLAIM_SERVER_ERROR = 3
    }
    interface ClaimPointProperties {
        enableKiosk?: boolean;
        enableSpin?: boolean;
        type?: ClaimPointType;
        imgSrc?: string;
        modelSrc?: string;
        mannequinType?: MannequinType;
        hoverText?: string;
        color1?: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        color2?: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        color3?: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        kioskImgSrc?: string;
        itemYOffset?: number;
        itemScale?: number;
    }
    enum ClaimPointType {
        MARKETPLACE_IMAGE = 0,
        CUSTOM_IMAGE = 1,
        MODEL = 2,
        MANNEQUIN = 3
    }
    enum MannequinType {
        MALE = 0,
        FEMALE = 1,
        MATCH_PLAYER = 2
    }
}
