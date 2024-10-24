import { Entity } from '@dcl/sdk/ecs';
import { VLMNotification } from './VLMNotification.component';
import { VLMBase } from './VLMBase.component';
import { VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMInstancedItem, VLMTextureOptions } from '../shared/interfaces';
import { MaterialService } from '../services/Material.service';
import { MeshService } from '../services/Mesh.service';
import { TransformService } from '../services/Transform.service';
import { ColliderService } from '../services/Collider.service';
import { ClickEventService } from '../services/ClickEvent.service';
import defaultMessages from '../messages/giveaway';
export declare namespace VLMClaimPoint {
    const configs: {
        [uuid: string]: VLMClaimPoint.Config;
    };
    const instances: {
        [uuid: string]: VLMClaimPoint.Instance;
    };
    type VLMConfig = VLMBaseProperties & VLMClickable & VLMTextureOptions & VLMInstancedItem;
    class Config extends VLMBase.Config {
        services: {
            material: MaterialService;
            mesh: MeshService;
            collider: ColliderService;
            transform: TransformService;
            clickEvent: ClickEventService;
        };
        messageOptions?: VLMNotification.MessageOptions;
        giveawayId: string;
        properties: ClaimPointProperties;
        messages: typeof defaultMessages;
        requestComplete: boolean;
        hasCustomFunctions: boolean;
        disableDefaults: boolean;
        customFunctions?: CustomFunctions;
        requestInProgress: boolean;
        constructor(config: VLMConfig);
        setStorage: CallableFunction;
        init: CallableFunction;
        addAll: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        createOrReplaceInstance: CallableFunction;
        removeInstance: CallableFunction;
        deleteInstance: CallableFunction;
        claim: CallableFunction;
        runClaimFunction: CallableFunction;
    }
    const setClaimFunctions: CallableFunction;
    class Instance extends VLMBase.Instance {
        kioskEntities: {
            topEntity?: Entity;
            glassEntity?: Entity;
            baseEntity?: Entity;
            baseTopEntity?: Entity;
            baseBottomEntity?: Entity;
            buttonEntity?: Entity;
            buttonHousingEntity?: Entity;
            boothLightEntity?: Entity;
        };
        claimItemEntity?: Entity;
        entity: Entity;
        properties: ClaimPointProperties;
        constructor(config: Config, instanceConfig: VLMInstanceProperties);
        setStorage: CallableFunction;
        init: CallableFunction;
        add: CallableFunction;
        remove: CallableFunction;
        removeKiosk: CallableFunction;
        delete: CallableFunction;
        generateClaimItem: CallableFunction;
        spinClaimItem: CallableFunction;
        generateStandardBooth: CallableFunction;
        generateClaimButton: CallableFunction;
        generateBoothLight: CallableFunction;
        pressButton: CallableFunction;
        updateTransform: CallableFunction;
    }
    interface ClaimResponse {
        sk: string;
        giveawayId?: string;
        responseType?: ClaimResponseType;
        reason?: ClaimRejection;
    }
    enum ClaimStatus {
        PENDING = "pending",
        QUEUED = "queued",
        IN_PROGRESS = "in_progress",
        COMPLETE = "complete"
    }
    enum ClaimRejection {
        PAUSED = "paused",
        BEFORE_EVENT_START = "before_event_start",
        AFTER_EVENT_END = "after_event_end",
        EXISTING_WALLET_CLAIM = "existing_wallet_claim",
        CLAIM_COMPLETE = "claim_complete",
        SUPPLY_DEPLETED = "supply_depleted",
        INAUTHENTIC = "inauthentic",
        SUSPICIOUS = "suspicious",
        NO_LINKED_EVENTS = "no_linked_events",
        OVER_IP_LIMIT = "over_ip_limit",
        OVER_DAILY_LIMIT = "over_daily_limit",
        OVER_WEEKLY_LIMIT = "over_weekly_limit",
        OVER_MONTHLY_LIMIT = "over_monthly_limit",
        OVER_YEARLY_LIMIT = "over_yearly_limit",
        OVER_LIMIT = "over_limit"
    }
    enum ClaimResponseType {
        CLAIM_ACCEPTED = "claim_accepted",
        CLAIM_DENIED = "claim_denied",
        CLAIM_IN_PROGRESS = "claim_in_progress",
        CLAIM_SERVER_ERROR = "claim_server_error"
    }
    interface ClaimPointProperties {
        enableKiosk?: boolean;
        enableSpin?: boolean;
        enableButton?: boolean;
        enableLight?: boolean;
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
        color4?: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        color5?: {
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
    type CustomFunctions = {
        noWallet: CallableFunction;
        claimSubmitted: CallableFunction;
        claimInProgress: CallableFunction;
        successfulClaim: CallableFunction;
        beforeEventTime: CallableFunction;
        afterEventTime: CallableFunction;
        existingClaim: CallableFunction;
        claimComplete: CallableFunction;
        dailyLimitReached: CallableFunction;
        otherLimitReached: CallableFunction;
        ipLimitReached: CallableFunction;
        noSupply: CallableFunction;
        inauthenticConnection: CallableFunction;
        noLinkedEvents: CallableFunction;
        paused: CallableFunction;
        claimDenied: CallableFunction;
        errorMessage: CallableFunction;
    };
}
//# sourceMappingURL=VLMClaimPoint.component.d.ts.map