import { PositionType } from "@decentraland/RestrictedActions";
import { VLMSession } from "../components/VLMSession.component";
import { VLMPathClientEvent, VLMPathServerEvent } from "../components/VLMSystemEvents.component";
import { VLMSessionManager } from "./VLMSession.logic";
import { VLMEventManager } from "./VLMSystemEvents.logic";
import { ColyRoom } from "../shared/interfaces";

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

export abstract class VLMPathManager implements ISystem {
  static motionButtonsPressed: { w: boolean; a: boolean; s: boolean; d: boolean; shift: boolean; [id: string]: boolean } = { w: false, a: false, s: false, d: false, shift: false };
  static moving: boolean = hasTruthyProperty((({ shift, ...data }) => data)(this.motionButtonsPressed));
  static walking: boolean = this.motionButtonsPressed.shift && this.moving;
  static running: boolean = !this.motionButtonsPressed.shift && this.moving;
  static engaged?: boolean;
  static idle?: boolean;
  static pathId?: string;
  static sceneRoom: ColyRoom;
  static sessionData: VLMSession.Config;
  static pathSegments: VLMSession.Path.Segment[] = [{ type: VLMSession.Path.SegmentType.LOADING, path: [] }];
  static pov: 0 | 1 | 2 = 2;
  static started: boolean = false;
  static finished: boolean = false;
  static loading: boolean = true;
  static counter: number = 0;
  static delay: number = 0.5;
  static playerPosition?: PositionType;
  static playerRotation?: PositionType;
  static cameraPosition?: PositionType;
  static cameraRotation?: PositionType;
  static segmentChangeDebounce?: number;
  static needsStateUpdate?: boolean;
  static pathStarted?: boolean = false;

  static startPath: CallableFunction = () => {
    this.sceneRoom = VLMSessionManager.sceneRoom;
    this.sessionData = VLMSessionManager.sessionData;
    VLMEventManager.events.fireEvent(new VLMPathClientEvent({ action: "path_start" }));
    engine.addSystem(this);
  };

  static endPath: CallableFunction = () => {
    VLMEventManager.events.fireEvent(new VLMPathClientEvent({ action: "path_end", pathId: this.pathId, pathSegments: this.pathSegments }));
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
      return;
    }
    try {
      const thousandPointPaths = this.pathSegments.some((segment) => segment?.path && segment.path.length >= 1000);
      const isFirstSegment = this.pathSegments[0].type == VLMSession.Path.SegmentType.LOADING;
      const latestSegment = this.pathSegments[0];
      const lastSegment = this.pathSegments[1];
      const latestSegmentStart = isFirstSegment ? this.sessionData.sessionStart : this.pathSegments[0].path[0][0];
      const debounced = Date.now() - (latestSegmentStart || 0);

      if (isFirstSegment) {
        this.initMovement();
        this.pathSegments[0].path.push(this.getPathPoint());
      }

      // make a stationary segment into a movement segment if the user moves within the first second of changing to stationary
      if (debounced < 2500 && segmentType && segmentType >= VLMSession.Path.SegmentType.RUNNING_DISENGAGED && lastSegment.type && lastSegment.type < VLMSession.Path.SegmentType.RUNNING_DISENGAGED) {
        latestSegment.type = segmentType;
        return;
      }

      // merge into the previous segment if we've coverted a new segment back to the same type
      if (lastSegment && latestSegment.type === lastSegment.type) {
        lastSegment.path = [...lastSegment.path, ...latestSegment.path];
        this.pathSegments.shift();
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
        log("New path type would be the same.");
        return;
      }
      const newPathPoint = this.getPathPoint();
      latestSegment.path.push(newPathPoint);
      const newSegment = new VLMSession.Path.Segment({ type, path: [newPathPoint] });
      this.pathSegments.unshift(newSegment);
      log("Started a new segment.", newSegment);
      log("All segments:", this.pathSegments);
      if (this.pathSegments.length > 25 || thousandPointPaths) {
        log("VLM FIRE ZE MISSILES!");
        VLMEventManager.events.fireEvent(new VLMPathClientEvent({ action: "path_segments_add", pathId: this.pathId, pathSegments: this.pathSegments }));
      }
    } catch (e) {
      throw e;
    }
  };

  static trimStoredSegments: CallableFunction = (message: VLMPathServerEvent) => {
    log("VLM: trimming path segments!", this.pathSegments);
    this.pathSegments.splice(this.pathSegments.length - message.added);
    log("VLM: trimmed path segments!", this.pathSegments);
  };

  static getPathPoint: CallableFunction = (firstPoint: boolean) => {
    this.approximatePathPoint();
    const offset = firstPoint ? 0 : Date.now() - this.sessionData.sessionStart;
    return [offset, this.playerPosition?.x, this.playerPosition?.y, this.playerPosition?.z, this.cameraRotation?.x, this.cameraRotation?.y, this.cameraRotation?.z, this.pov];
  };

  static logPathPoint: CallableFunction = (end: boolean) => {
    const prevPathPoint = this.lastPathPoint(),
      nextPathPoint = this.getPathPoint();

    this.updateMovingState();

    const existingPoint = prevPathPoint && this.comparePoints(nextPathPoint, prevPathPoint);
    // log(`Path Segment Type: ${this.pathSegments[0].type} | Path: ${this.pathSegments[0].path}`);
    try {
      if (!end && existingPoint) {
        return;
      }

      this.pathSegments[0].path.push(nextPathPoint);
    } catch (error) {}
  };

  static comparePoints: CallableFunction = (pointA: PathPoint, pointB: PathPoint) => {
    if (!pointA.length || !pointB.length) {
      return;
    }
    const xMatch = pointA[1] == pointB[1],
      yMatch = pointA[2] == pointB[2],
      zMatch = pointA[3] == pointB[3];

    return xMatch && yMatch && zMatch;
  };

  static lastPathPoint: CallableFunction = () => {
    if (this.pathSegments[0].path && this.pathSegments[0].path.length) {
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

    if (this.finished) {
      engine.removeSystem(this);
      return;
    } else if (!this.sessionData?.sessionStart) {
      return;
    }

    const lastPathPoint = this.lastPathPoint(),
      lastPointOffset = lastPathPoint[0];

    if (this.pathId && this.pathSegments[0].path.length >= 1000) {
      this.startNewSegment();
      return;
    }

    if (lastPathPoint && Date.now() >= lastPointOffset + 500) {
      this.logPathPoint();
    } else if (Date.now() < lastPointOffset + 500) {
      log("Waiting to log point");
      log(lastPointOffset - Date.now(), "since last point");
    } else {
      log("Failed to log path point", this.sessionData, lastPointOffset);
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
}
