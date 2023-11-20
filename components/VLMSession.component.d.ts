export declare namespace VLMSession {
    class Config {
        pk?: string;
        sk?: string;
        userId?: string;
        connectedWallet?: string;
        sessionStart: number;
        sessionEnd?: number;
        sessionToken?: string;
        paths?: string[];
        expires?: number;
        sceneId?: string;
        sessionId?: string;
        world?: number;
        worldLocation?: string;
        ts?: number;
        constructor(config: Config);
    }
    class User {
        sk?: string;
        displayName: string;
        connectedWallet?: string;
        lastIp?: string;
        activeSessionId?: string;
        hasConnectedWeb3: boolean;
        world: string;
        createdAt?: number;
        constructor(config: User);
    }
    namespace Path {
        class Config {
            sk?: string;
            segments?: Segment[];
            constructor(config: Config);
        }
        class Segment {
            sk?: string;
            pathId?: string;
            type?: SegmentType;
            path: Point[];
            constructor(config: Segment);
        }
        enum SegmentType {
            LOADING = 0,
            IDLE = 1,
            STATIONARY_DISENGAGED = 2,
            STATIONARY_ENGAGED = 3,
            RUNNING_DISENGAGED = 4,
            WALKING_DISENGAGED = 5,
            RUNNING_ENGAGED = 6,
            WALKING_ENGAGED = 7
        }
        type Point = [number, number, number, number, number, number, number, -1 | 0 | 1 | 2];
    }
    const PointLegend: {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
    };
}
