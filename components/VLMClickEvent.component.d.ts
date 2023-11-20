import { Vector3 } from "@dcl/sdk/math";
export declare namespace VLMClickEvent {
    enum Actions {
        NONE = 0,
        EXTERNAL = 1,
        TRACKING_ONLY = 2,
        SOUND = 3,
        STREAM = 4,
        MOVE = 5,
        TELEPORT = 6
    }
    class Config {
        type: Actions;
        showFeedback: boolean;
        hoverText: string;
        externalLink?: string;
        sound?: string;
        moveTo?: {
            cameraTarget: Vector3;
            position: Vector3;
            setCameraTarget: boolean;
        };
        teleportTo?: string;
        hasTracking?: boolean;
        trackingId?: string;
        synced?: boolean;
        constructor(config: Config);
    }
}
