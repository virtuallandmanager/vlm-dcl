export namespace VLMSession {
  export class Config {
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

    constructor(config: Config) {
      this.sk = config.sk || this.sk;
      this.userId = config.userId;
      this.connectedWallet = config.connectedWallet;
      this.sessionStart = config?.sessionStart || Date.now();
      this.sessionEnd = config?.sessionEnd;
      this.sessionToken = config?.sessionToken;
      this.expires = config?.expires;
      this.sceneId = config?.sceneId;
      this.world = config?.world;
      this.worldLocation = config?.worldLocation;
      this.ts = config.ts || this.ts;
    }
  }

  export class User {
    sk?: string;
    displayName: string;
    connectedWallet?: string;
    lastIp?: string;
    activeSessionId?: string;
    hasConnectedWeb3: boolean;
    world: string;
    createdAt?: number;

    constructor(config: User) {
      this.sk = config.sk;
      this.connectedWallet = config.connectedWallet;
      this.displayName = config.displayName || "";
      this.lastIp = config.lastIp;
      this.hasConnectedWeb3 = config.hasConnectedWeb3;
      this.world = config.world;
      this.createdAt = config.createdAt;
    }
  }

  export namespace Path {
    export class Config {
      sk?: string;
      segments?: Segment[];

      constructor(config: Config) {
        this.sk = config.sk || this.sk;
        this.segments = config.segments;
      }
    }

    export class Segment {
      sk?: string; // Sort Key
      pathId?: string;
      type?: SegmentType;
      path: Point[];

      constructor(config: Segment) {
        this.sk = config.sk || this.sk;
        this.pathId = config.pathId;
        this.type = config.type;
        this.path = config.path;
      }
    }

    export enum SegmentType {
      LOADING,
      IDLE,
      STATIONARY_DISENGAGED,
      STATIONARY_ENGAGED,
      RUNNING_DISENGAGED,
      WALKING_DISENGAGED,
      RUNNING_ENGAGED,
      WALKING_ENGAGED,
    }

    export type Point = [number, number, number, number, number, number, number, -1 | 0 | 1 | 2];
  }

  export const PointLegend = {
    0: "X-Position",
    1: "Y-Position",
    2: "Z-Position",
    3: "Timestamp",
    4: "X-Rotation",
    5: "Y-Rotation",
    6: "POV",
  };
}
