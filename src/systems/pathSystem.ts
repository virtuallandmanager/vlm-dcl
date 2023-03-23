import { PositionType } from "@decentraland/RestrictedActions";
import { Room } from "colyseus.js";
import { TDCLSessionData } from "src/types/DCLSession";

// Property names minimized for data efficiency
// P = player's relative position in scene
// R = camera rotation
// V = pov
// O = offset from startTime - tracked in seconds

export type PathPoint = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  -1 | 0 | 1 | 2
];
// [O, Px, Py, Pz, Rx, Ry, Rz, V]

export class PathSystem implements ISystem {
  pathId: string | null;
  playerPath: PathPoint[] = [];
  sessionData: TDCLSessionData;
  room: Room;
  pov: CameraMode = -1;
  started: boolean = false;
  finished: boolean = false;
  playerPosition: PositionType;
  cameraPosition: PositionType;
  cameraRotation: PositionType;

  constructor(sessionData: TDCLSessionData, room: Room) {
    try {
      onCameraModeChangedObservable.add((e) => {
        this.pov = e.cameraMode;
      });
      this.sessionData = sessionData;
      this.room = room;
      log("VLM: constructing path system", this.sessionData, sessionData);
      engine.addSystem(this);
      this.bindEvents();
    } catch (e) {
      throw e;
    }
  }

  bindEvents: CallableFunction = () => {
    this.room.onMessage("path_created_message", (message: any) => {
      log("message received from server");
      log(message);
      if (!this.pathId && message?.playerPath) {
        this.pathId = message.playerPath.sk;
      }
    });
  };

  getPathPoint: CallableFunction = () => {
    const prevPathPoint = this.lastPathPoint();
    this.approximatePathPoint();
    return [
      prevPathPoint ? Date.now() - this.sessionData.sessionStart : 0,
      this.playerPosition.x,
      this.playerPosition.y,
      this.playerPosition.z,
      this.cameraRotation.x,
      this.cameraRotation.y,
      this.cameraRotation.z,
      this.pov,
    ];
  };

  logPathPoint: CallableFunction = () => {
    const prevPathPoint = this.lastPathPoint(),
      nextPathPoint = this.getPathPoint();

    const existingPoint =
      prevPathPoint && this.comparePoints(nextPathPoint, prevPathPoint);
    log("logPathPoint");
    // try {
    if (existingPoint) {
      return;
    }
    log("logPathPoint not returned");
    this.playerPath.push(nextPathPoint);
    log("VLM: full path: ", this.playerPath);

    if (this.playerPath.length == 1 && !this.pathId) {
      log("VLM: creating path");
      this.room.send("create_path", {
        pathPoint: nextPathPoint,
        sessionToken: this.sessionData.sessionToken,
      });
    } else {
      this.room.send("update_path", {
        pathPoint: nextPathPoint,
        sessionToken: this.sessionData.sessionToken,
        pathId: this.pathId,
      });
    }

    if (this.playerPath.length == 10000) {
      this.clear()
    }

    // } catch (error) {
    //   log("vlm error: ", JSON.stringify(error), this.session, this.session.room, this);
    // }
  };

  clear: CallableFunction = () => {
    this.playerPath.length = 0;
    this.pathId = null;
  };

  logAnalyticsEvent: CallableFunction = (eventType: string, metadata: any) => {
    const nextPathPoint = this.getPathPoint();

    this.room.send("log_event", {
      eventType,
      metadata,
      pathPoint: nextPathPoint,
    });
  };

  comparePoints: CallableFunction = (pointA: PathPoint, pointB: PathPoint) => {
    if (!pointA.length || !pointB.length) {
      return;
    }
    const xMatch = pointA[1] == pointB[1],
      yMatch = pointA[2] == pointB[2],
      zMatch = pointA[3] == pointB[3];

    return xMatch && yMatch && zMatch;
  };

  lastPathPoint: CallableFunction = () => {
    if (this.playerPath && this.playerPath.length) {
      return this.playerPath[this.playerPath.length - 1];
    }
  };

  end: CallableFunction = () => {
    this.finished = true;
    this.pathId = null;
    return this.playerPath;
  };

  approximatePathPoint: CallableFunction = () => {
    const playerPosition = { ...Camera.instance.feetPosition },
      cameraRotation = { ...Camera.instance.rotation.eulerAngles },
      cameraPosition = { ...Camera.instance.position },
      floorHeight = 0.17;

    [playerPosition, cameraPosition, cameraRotation].forEach((obj) => {
      Object.keys(obj).forEach((key: string) => {
        obj[key] = Number(obj[key].toFixed(1));
        obj[key] = obj[key] > floorHeight ? obj[key] : floorHeight;
      });
    });

    this.playerPosition = playerPosition;
    this.cameraPosition = cameraPosition;
    this.cameraRotation = cameraRotation;
  };

  counter: number = 0;
  delay: number = 0.5;

  update(dt: number) {
    if (this.counter <= this.delay) {
      this.counter += dt;
      return;
    } else {
      this.counter = 0;
    }

    if (this.finished) {
      engine.removeSystem(this);
      return;
    }

    const lastPathPoint = this.lastPathPoint();

    if (!lastPathPoint || Date.now() >= lastPathPoint[0] + 500) {
      this.logPathPoint();
    }
  }
}
