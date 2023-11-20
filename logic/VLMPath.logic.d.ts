import { VLMSession } from "../components/VLMSession.component";
import { Room } from "colyseus.js";
import { Vector3 } from "@dcl/sdk/math";
export type PathPoint = [
    number | null,
    number | null,
    number | null,
    number | null,
    number | null,
    number | null,
    number | null,
    -1 | 0 | 1 | 2,
    number | null,
    number | null,
    number | null,
    number | null,
    number | null,
    number | null
];
export declare class VLMPathManager {
    static enableDebugging: boolean;
    static motionButtonsPressed: {
        w: boolean;
        a: boolean;
        s: boolean;
        d: boolean;
        shift: boolean;
        [id: string]: boolean;
    };
    static moving: boolean;
    static walking: boolean;
    static running: boolean;
    static engaged?: boolean;
    static idle?: boolean;
    static pathId?: string;
    static sceneRoom: Room;
    static sessionData: VLMSession.Config;
    static pathSegments: VLMSession.Path.Segment[];
    static pov: 0 | 1 | 2;
    static started: boolean;
    static finished: boolean;
    static loading: boolean;
    static counter: number;
    static updateCounter: number;
    static delay: number;
    static updateDelay: number;
    static playerPosition?: Vector3;
    static playerRotation?: Vector3;
    static cameraPosition?: Vector3;
    static cameraRotation?: Vector3;
    static segmentChangeDebounce?: number;
    static addingPaths?: boolean;
    static pathStarted?: boolean;
    constructor();
    static startPath: CallableFunction;
    static endPath: CallableFunction;
    static initMovement: CallableFunction;
    static startNewSegment: CallableFunction;
    static trimStoredSegments: CallableFunction;
    static getPathPoint: CallableFunction;
    static logPathPoint: CallableFunction;
    static comparePoints: CallableFunction;
    static lastPathPoint: CallableFunction;
    static approximatePathPoint: CallableFunction;
    static update(dt: number): void;
    static updateMovingState: CallableFunction;
    static startRunningEngaged: CallableFunction;
    static startWalkingEngaged: CallableFunction;
    static startRunningDisengaged: CallableFunction;
    static startWalkingDisengaged: CallableFunction;
    static startStationaryEngaged: CallableFunction;
    static startStationaryDisengaged: CallableFunction;
    static startIdleSegment: CallableFunction;
    private static dbLog;
}
