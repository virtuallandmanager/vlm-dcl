import { PositionType } from "@decentraland/RestrictedActions";
import { VLMSession } from "../components/VLMSession.component";
import { VLMPathClientEvent, VLMPathServerEvent } from "../components/VLMSystemEvents.component";
import { VLMSessionManager } from "./VLMSession.logic";
import { VLMEventManager } from "./VLMSystemEvents.logic";
import { Room } from "colyseus.js";
import { FlatFetchInit, signedFetch } from "@decentraland/SignedFetch";
import { VLMLogManager } from "./VLMLogging";
import { VLMEnvironment } from "../environment";

// Property names minimized for data efficiency
// O = offset from startTime - tracked in seconds
// P = player's relative position in scene
// R = camera rotation
// V = pov
const hasTruthyProperty = (obj: Record<string, any>): boolean => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !!obj[key]) {
      return true;
    }
  }
  return false;
};

export type PathPoint = [number, number, number, number, number, number, number, -1 | 0 | 1 | 2];
// [O, Px, Py, Pz, Rx, Ry, Rz, V]

export class VLMPathManager implements ISystem {
  static enableDebugging: boolean = false;
  static motionButtonsPressed: { w: boolean; a: boolean; s: boolean; d: boolean; shift: boolean;[id: string]: boolean } = { w: false, a: false, s: false, d: false, shift: false };
  static moving: boolean = hasTruthyProperty((({ shift, ...data }) => data)(this.motionButtonsPressed));
  static walking: boolean = this.motionButtonsPressed.shift && this.moving;
  static running: boolean = !this.motionButtonsPressed.shift && this.moving;
  static engaged?: boolean;
  static idle?: boolean;
  static pathId?: string;
  static sceneRoom: Room;
  static sessionData: VLMSession.Config;
  static pathSegments: VLMSession.Path.Segment[] = [{ type: VLMSession.Path.SegmentType.LOADING, path: [] }];
  static pov: 0 | 1 | 2 = 2;
  static started: boolean = false;
  static finished: boolean = false;
  static loading: boolean = true;
  static counter: number = 0;
  static delay: number = 1;
  static playerPosition?: PositionType;
  static playerRotation?: PositionType;
  static cameraPosition?: PositionType;
  static cameraRotation?: PositionType;
  static segmentChangeDebounce?: number;
  static addingPaths?: boolean = false;
  static pathStarted?: boolean = false;

  constructor() {
    VLMPathManager.sceneRoom = VLMSessionManager.sceneRoom;
    VLMPathManager.sessionData = VLMSessionManager.sessionData;
    VLMEventManager.events.fireEvent(new VLMPathClientEvent({ action: "path_start" }));
  }

  static startPath: CallableFunction = async (message: VLMPathServerEvent) => {
    const pathIds = this.sessionData.paths;
    if (message.pathId && pathIds && pathIds.indexOf(message.pathId) < 0) {
      pathIds.push(message.pathId);
    }
    VLMPathManager.pathId = message.pathId;
    VLMPathManager.pathStarted = true;
    VLMPathManager.startNewSegment();
    engine.addSystem(this);
  }

  static endPath: CallableFunction = async (error: any, metadata: any) => {
    try {
      const platformData = await VLMSessionManager.getPlatformData();
      const payload: FlatFetchInit = {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ error, sessionData: this.sessionData, pathId: this.pathId, pathSegments: this.pathSegments, metadata: { ...platformData, ...metadata, ts: Date.now() } }),
      };

      const config = await signedFetch(`${VLMEnvironment.apiUrl}/session/end`, payload);
      if (config.ok) {
        this.dbLog("VLM PATH TRACKING - PATH ENDED");
        return config.json;
      }
    } catch (error) {
      VLMLogManager.reportOutage();
    }
  };

  static initMovement: CallableFunction = async () => {
    const input = Input.instance;

    this.motionButtonsPressed.w = input.isButtonPressed(ActionButton.FORWARD).BUTTON_DOWN;
    this.motionButtonsPressed.s = input.isButtonPressed(ActionButton.BACKWARD).BUTTON_DOWN;
    this.motionButtonsPressed.a = input.isButtonPressed(ActionButton.LEFT).BUTTON_DOWN;
    this.motionButtonsPressed.d = input.isButtonPressed(ActionButton.RIGHT).BUTTON_DOWN;
    this.motionButtonsPressed.shift = input.isButtonPressed(ActionButton.WALK).BUTTON_DOWN;

    this.moving = this.motionButtonsPressed.w || this.motionButtonsPressed.a || this.motionButtonsPressed.s || this.motionButtonsPressed.d;
    this.walking = this.moving && this.motionButtonsPressed.shift;
    this.loading = false;
  };

  static startNewSegment: CallableFunction = (segmentType?: VLMSession.Path.SegmentType) => {
    if (!this.pathStarted) {
      this.dbLog("VLM PATH TRACKING - EXITED - PATH HASN'T STARTED");
      return;
    }
    try {
      const thousandPointPaths = this.pathSegments.some((segment) => segment?.path && segment.path?.length >= 1000);
      const isFirstSegment = this.pathSegments[0].type == VLMSession.Path.SegmentType.LOADING;
      const latestSegment = this.pathSegments[0];
      const lastSegment = this.pathSegments[1];
      const latestSegmentStart = isFirstSegment ? this.sessionData?.sessionStart || Date.now() : this.pathSegments[0].path[0][0];
      const debounced = Date.now() - (latestSegmentStart || 0);

      if (isFirstSegment) {
        this.initMovement();
        this.sessionData.sessionStart == this.sessionData?.sessionStart || Date.now();
        this.pathSegments[0].path.push(this.getPathPoint(true));
        this.dbLog("VLM PATH TRACKING - ADDED FIRST PATH SEGMENT");
      }

      // make a stationary segment into a movement segment if the user moves within the first second of changing to stationary
      if (debounced < 2500 && segmentType && segmentType >= VLMSession.Path.SegmentType.RUNNING_DISENGAGED && lastSegment.type && lastSegment.type < VLMSession.Path.SegmentType.RUNNING_DISENGAGED) {
        latestSegment.type = segmentType;
        this.dbLog("VLM PATH TRACKING - CHANGED SEGMENT TYPE - STARTED MOVING");
        return;
      }

      // merge into the previous segment if we've coverted a new segment back to the same type
      if (lastSegment && latestSegment.type === lastSegment.type) {
        lastSegment.path = [...lastSegment.path, ...latestSegment.path];
        this.pathSegments.shift();
        this.dbLog("VLM PATH TRACKING - MERGED IDENTICAL SEGMENTS");
        return;
      }

      if (debounced < 5000) {
        return;
      }

      let type;
      if (segmentType) {
        type = segmentType;
      } else if (this.walking && this.engaged) {
        type = VLMSession.Path.SegmentType.WALKING_ENGAGED;
      } else if (this.running && this.engaged) {
        type = VLMSession.Path.SegmentType.RUNNING_ENGAGED;
      } else if (this.walking) {
        type = VLMSession.Path.SegmentType.WALKING_DISENGAGED;
      } else if (this.running) {
        type = VLMSession.Path.SegmentType.RUNNING_DISENGAGED;
      } else if (this.idle) {
        type = VLMSession.Path.SegmentType.IDLE;
      } else if (this.engaged) {
        type = VLMSession.Path.SegmentType.STATIONARY_ENGAGED;
      } else if (this.loading) {
        type = VLMSession.Path.SegmentType.LOADING;
      } else {
        type = VLMSession.Path.SegmentType.STATIONARY_DISENGAGED;
      }

      if (this.pathSegments[0].type == type) {
        this.dbLog("VLM PATH TRACKING - NO CHANGE IN SEGMENT TYPE");
        return;
      }
      const newPathPoint = this.getPathPoint();
      latestSegment.path.push(newPathPoint);
      const newSegment = new VLMSession.Path.Segment({ type, path: [newPathPoint] });
      this.pathSegments.unshift(newSegment);
      if (!this.addingPaths && this.pathSegments?.length >= 25 || thousandPointPaths) {
        this.dbLog("VLM PATH TRACKING - SUBMITTING A BATCH OF PATH SEGMENTS");
        this.addingPaths = true;
        VLMEventManager.events.fireEvent(new VLMPathClientEvent({ action: "path_segments_add", pathId: this.pathId, pathSegments: this.pathSegments }));
      }
    } catch (e) {
      this.dbLog("VLM PATH TRACKING - ERROR STARTING NEW SEGMENT");
      throw e;
    }
  };

  static trimStoredSegments: CallableFunction = (message: VLMPathServerEvent) => {
    this.dbLog("VLM PATH TRACKING - TRIMMING PATH SEGMENTS");
    if (this.pathSegments?.length) {
      this.pathSegments.splice(this.pathSegments.length - message.added);
      this.dbLog("VLM PATH TRACKING - " + message.added + " PATH SEGMENTS TRIMMED ")
    }
    this.addingPaths = false;
  };

  static getPathPoint: CallableFunction = (firstPoint: boolean) => {
    this.approximatePathPoint();
    const offset = firstPoint ? 0 : Date.now() - (this.sessionData?.sessionStart || 0);
    const newPathPoint = [offset, this.playerPosition?.x, this.playerPosition?.y, this.playerPosition?.z, this.cameraRotation?.x, this.cameraRotation?.y, this.cameraRotation?.z, this.pov];
    this.dbLog("VLM PATH TRACKING - NEW PATH POINT \n" + JSON.stringify(newPathPoint));
    return newPathPoint
  };

  static logPathPoint: CallableFunction = (end: boolean) => {
    const prevPathPoint = this.lastPathPoint(),
      nextPathPoint = this.getPathPoint();

    this.updateMovingState();

    const existingPoint = prevPathPoint && this.comparePoints(nextPathPoint, prevPathPoint);
    try {
      if (!end && existingPoint) {
        this.dbLog("VLM PATH TRACKING - POINT ALREADY TRACKED");
        return;
      }

      this.pathSegments[0].path.push(nextPathPoint);
    } catch (error) {
      this.dbLog("VLM PATH TRACKING - ERROR LOGGING PATH POINT");
    }
  };

  static comparePoints: CallableFunction = (pointA: PathPoint, pointB: PathPoint) => {
    if (!pointA?.length || !pointB?.length) {
      return;
    }
    const xMatch = pointA[1] == pointB[1],
      yMatch = pointA[2] == pointB[2],
      zMatch = pointA[3] == pointB[3];

    return xMatch && yMatch && zMatch;
  };

  static lastPathPoint: CallableFunction = () => {
    if (this.pathSegments[0].path && this.pathSegments[0].path?.length) {
      return this.pathSegments[0].path[this.pathSegments[0].path.length - 1];
    } else {
      return this.getPathPoint();
    }
  };

  static approximatePathPoint: CallableFunction = () => {
    const playerPosition = { ...Camera.instance.feetPosition },
      cameraRotation = { ...Camera.instance.rotation.eulerAngles },
      cameraPosition = { ...Camera.instance.position },
      floorHeight = 0.17;

    [playerPosition, cameraPosition, cameraRotation].forEach((obj: PositionType) => {
      Object.keys(obj).forEach(() => {
        obj.x = Number(obj.x.toFixed(2));
        obj.y = Number(obj.x.toFixed(2));
        obj.z = Number(obj.x.toFixed(2));
      });
    });

    this.playerPosition = playerPosition;
    this.cameraPosition = cameraPosition;
    this.cameraRotation = cameraRotation;
  };

  static update(dt: number) {
    if (this.counter <= this.delay) {
      this.counter += dt;
      return;
    } else {
      this.counter = 0;
    }
    this.dbLog("VLM PATH TRACKING - UPDATE")
    const lastPathPoint = this.lastPathPoint(),
      lastPointOffset = lastPathPoint[0];

    if (this.pathId && this.pathSegments[0].path?.length >= 1000) {
      this.startNewSegment();
      this.dbLog("VLM PATH TRACKING - STARTED NEW SEGMENT - 1000 POINTS REACHED");
      return;
    }

    if (lastPathPoint && Date.now() >= lastPointOffset + 500) {
      this.dbLog("VLM PATH TRACKING - LOGGING PATH POINT")
      this.logPathPoint();
    } else if (Date.now() < lastPointOffset + 500) {
      this.dbLog("VLM PATH TRACKING - EXITED - NOT ENOUGH TIME PASSED SINCE LAST POINT");
    } else {
      this.dbLog("VLM PATH TRACKING - EXITED - " + this.sessionData + lastPointOffset);
      this.dbLog("VLM PATH TRACKING - EXITED - FAILED TO LOG PATH POINT");
    }
  }

  static updateMovingState: CallableFunction = async (button?: string, pressed?: boolean) => {
    if (button) {
      this.motionButtonsPressed[button] = !!pressed;
    }
    const isMoving = this.motionButtonsPressed.w || this.motionButtonsPressed.a || this.motionButtonsPressed.s || this.motionButtonsPressed.d,
      isWalking = this.motionButtonsPressed.shift && isMoving,
      isRunning = isMoving && !this.motionButtonsPressed.shift,
      isEngaged = this.engaged;

    if (isRunning && isEngaged) {
      this.startRunningEngaged();
    } else if (isWalking && isEngaged) {
      this.startWalkingEngaged();
    } else if (isRunning) {
      this.startRunningDisengaged();
    } else if (isWalking) {
      this.startWalkingDisengaged();
    } else if (!isMoving && isEngaged) {
      this.startStationaryEngaged();
    } else if (!this.idle) {
      this.startStationaryDisengaged();
    } else {
      this.startIdleSegment();
    }
  };

  static startRunningEngaged: CallableFunction = async () => {
    this.moving = true;
    this.walking = false;
    this.running = true;
    this.startNewSegment(VLMSession.Path.SegmentType.RUNNING_ENGAGED);
  };
  static startWalkingEngaged: CallableFunction = async () => {
    this.moving = true;
    this.walking = true;
    this.running = false;
    this.startNewSegment(VLMSession.Path.SegmentType.WALKING_ENGAGED);
  };

  static startRunningDisengaged: CallableFunction = async () => {
    this.moving = true;
    this.walking = false;
    this.running = true;
    this.startNewSegment(VLMSession.Path.SegmentType.RUNNING_DISENGAGED);
  };
  static startWalkingDisengaged: CallableFunction = async () => {
    this.moving = true;
    this.walking = true;
    this.running = false;
    this.startNewSegment(VLMSession.Path.SegmentType.WALKING_DISENGAGED);
  };

  static startStationaryEngaged: CallableFunction = async () => {
    this.moving = false;
    this.walking = false;
    this.running = false;
    this.engaged = true;
    this.startNewSegment(VLMSession.Path.SegmentType.STATIONARY_ENGAGED);
  };
  static startStationaryDisengaged: CallableFunction = async () => {
    this.moving = false;
    this.walking = false;
    this.running = false;
    this.engaged = false;
    this.startNewSegment(VLMSession.Path.SegmentType.STATIONARY_DISENGAGED);
  };
  static startIdleSegment: CallableFunction = async () => {
    this.moving = false;
    this.walking = false;
    this.running = false;
    this.engaged = false;
    this.idle = true;
    this.startNewSegment(VLMSession.Path.SegmentType.IDLE);
  };

  private static dbLog: CallableFunction = (message: string) => {
    if (this.enableDebugging) {
      log(message);
    }
  }
}
