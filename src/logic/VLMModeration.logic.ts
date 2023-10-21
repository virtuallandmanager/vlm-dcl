import { getParcel } from "@decentraland/ParcelIdentity";
import { movePlayerTo } from "@decentraland/RestrictedActions";
import { parcelSize } from "../shared/defaults";
import { includes } from "../utils";
import { VLMModeration } from "../components/VLMModeration.component";
import { VLMSessionManager } from "./VLMSession.logic";
import { VLMNotificationManager } from "./VLMNotification.logic";

type PlayerConfig = {
  connectedWallet?: string;
  displayName?: string;
};

type ParcelBound = {
  x: number;
  z: number;
  n: number;
  e: number;
  s: number;
  w: number;
  nr: number;
  er: number;
  sr: number;
  wr: number;
  hasAdjacentNorth?: boolean;
  hasAdjacentEast?: boolean;
  hasAdjacentSouth?: boolean;
  hasAdjacentWest?: boolean;
};

class Blackout extends UIContainerRect {
  text: UIText;
  exitLink: UIText;
  exitClickBox: UIImage;

  constructor() {
    super(VLMModerationManager.canvas);
    this.width = "100%";
    this.height = "150%";
    this.color = Color4.Black();
    this.visible = false;

    this.text = new UIText(this);
    this.text.fontSize = 24;
    this.text.hAlign = "center";
    this.text.hTextAlign = "center";
    this.text.positionY = 50;
    this.text.color = Color4.White();
    this.text.value = VLMModerationManager.messages.bannedUser;

    this.exitClickBox = new UIImage(this, new Texture(""));
    this.exitClickBox.width = 300;
    this.exitClickBox.height = 24;
    this.exitClickBox.hAlign = "center";
    this.exitClickBox.opacity = 0;
    this.exitClickBox.positionY = -10;
    this.exitClickBox.onClick = new OnPointerDown(() => {
      teleportTo("0,0");
    });

    this.exitLink = new UIText(this);
    this.exitLink.fontSize = 24;
    this.exitLink.hAlign = "center";
    this.exitLink.hTextAlign = "center";
    this.exitLink.color = Color4.White();
    this.exitLink.isPointerBlocker = false;
    this.exitLink.value = "CLICK TO LEAVE AREA";
  }

  bannedUser: CallableFunction = () => {
    this.visible = true;
    this.text.value = VLMModerationManager.messages.bannedUser;
    this.text.visible = true;
    this.exitLink.visible = true;
  };

  bannedWearable: CallableFunction = () => {
    this.visible = true;
    this.text.value = VLMModerationManager.messages.bannedWearable;
    this.text.visible = true;
    this.exitLink.visible = true;
  };

  accessRestricted: CallableFunction = () => {
    this.visible = true;
    this.text.value = VLMModerationManager.messages.accessRestricted;
    this.text.visible = true;
    this.exitLink.visible = true;
  };

  hide: CallableFunction = () => {
    this.visible = false;
    this.text.visible = false;
    this.exitLink.visible = false;
  };
}

export abstract class VLMModerationManager implements ISystem {
  static moderationSettings: VLMModeration.DCLConfig;
  static accessAllowed: boolean;
  static bannedUser: boolean;
  static bannedWearable: boolean;
  static initialized: boolean;
  static canvas: UICanvas;
  static blackout: Blackout;
  static inScene: boolean = true;
  static parcels: string[];
  static baseParcel: { x: number; z: number };
  static sceneHeight: number;
  static parcelBounds: ParcelBound[] = [];
  static walls: Entity[] = [];
  static currentWallType: VLMModeration.BanWallType;
  static messages = {
    bannedUser: "You have been blocked from interacting with this scene.",
    bannedWearable: "One of your equipped wearables has been prohibited by this scene.",
    accessRestricted: "Access to this scene has been restricted.",
  };
  static crashUser: boolean = false;
  static timer: number = 0;
  static memoryHog: string[] = [];

  static update(dt: number) {
    if (this.timer < 1) {
      this.timer += dt;
      return;
    } else {
      this.timer = 0;
    }
    log('updating moderation')
    if (this.crashUser) {
      return this.crash(dt)
    }
    const { inScene, accessAllowed, bannedUser, bannedWearable } = this;
    if (inScene && (!accessAllowed || bannedUser || bannedWearable)) {
      this.banAction();
    } else {
      return;
    }
  }

  public static setCrashUser: CallableFunction = (user: { connectedWallet: string, displayName: string }) => {
    log(VLMSessionManager.sessionUser.connectedWallet, user.connectedWallet)
    log(VLMSessionManager.sessionUser.displayName, user.displayName)
    log(VLMSessionManager.sessionUser.connectedWallet == user.connectedWallet)
    log(VLMSessionManager.sessionUser.displayName == user.displayName)
    log(VLMSessionManager.sessionUser.connectedWallet == user.connectedWallet || VLMSessionManager.sessionUser.displayName == user.displayName)
    if (VLMSessionManager.sessionUser.connectedWallet == user.connectedWallet || VLMSessionManager.sessionUser.displayName == user.displayName) {
      VLMNotificationManager.addMessage(`${user.displayName}, you are being asked to leave the scene.`, { color: "red", fontSize: 16 });
      this.blackout = new Blackout();
      this.crashUser = true;
      this.crash();
      if (!this.initialized) {
        this.init();
      }
    }
  }

  private static crash: CallableFunction = (user: { connectedWallet: string, displayName: string }) => {
    if (Camera.instance.position.x === 0 && Camera.instance.position.y === 0 && Camera.instance.position.z === 0) {
      return
    } else {
      movePlayerTo({ x: 8, y: Camera.instance.position.y || 0.78, z: 8 })
    }
    log(Camera.instance.position.x, Camera.instance.position.y, Camera.instance.position.z)
    log(Camera.instance.feetPosition.x, Camera.instance.feetPosition.y, Camera.instance.feetPosition.z)
    const crashBoxes = [new Entity(), new Entity(), new Entity(), new Entity(), new Entity()],
      { x, y, z } = Camera.instance.position,
      positions = [{ x: x + 1.5, y: y, z: z }, { x: x - 1.5, y, z }, { x, y: y + 1.5, z }, { x, y, z: z + 1.5 }, { x, y, z: z - 1.5 }],
      box = new BoxShape();
    box.withCollisions = true;
    const blackBox = new Material();
    blackBox.albedoColor = Color4.Black();
    crashBoxes.forEach((crashBox, i) => {
      crashBox.addComponentOrReplace(box);
      crashBox.addComponentOrReplace(blackBox);
      crashBox.addComponentOrReplace(new Transform({ position: new Vector3(positions[i].x, positions[i].y, positions[i].z), scale: new Vector3(3, 3, 3) }));
      engine.addEntity(crashBox);
    });
    let largeString = "";
    for (let i = 0; i < 1_000_000_000; i++) {
      largeString += 'a';
    }
    this.memoryHog.push(largeString);

  }

  static init = async () => {
    engine.addSystem(this);
    this.initialized = true;
  }

  static updateSettings = async (config: VLMModeration.VLMConfig) => {
    if (!this.canvas) {
      this.canvas = new UICanvas();
      this.canvas.width = "100%";
      this.canvas.height = "100%";
    }
    log(`in updateSettings within VLMModeration ${config}`)
    this.moderationSettings = config;
    const scene = await getParcel();
    this.parcels = scene.land.sceneJsonData.scene.parcels;
    const base = scene.land.sceneJsonData.scene.base.split(",");
    this.baseParcel = { x: Number(base[0]), z: Number(base[1]) };

    this.findSceneBounds();
    this.runModerationChecks();
    onProfileChanged.add(() => {
      this.runModerationChecks();
    });
    onEnterSceneObservable.add(() => {
      this.inScene = true;
      this.runModerationChecks();
    });
    onLeaveSceneObservable.add(() => {
      this.inScene = false;
    });
  };

  static updateModeration = () => {
    this.runModerationChecks();
  };

  static runModerationChecks = async () => {
    this.accessAllowed = true;
    const moderationSettings = this.moderationSettings;

    if (moderationSettings.allowCertainWearables && !this.hasAllowedWearables()) {
      this.accessAllowed = false;
    }

    if (moderationSettings.banCertainWearables && this.hasBannedWearables()) {
      this.accessAllowed = false;
    }

    if (moderationSettings.allowCertainUsers && !this.isAllowedUser()) {
      this.accessAllowed = false;
    }

    if (moderationSettings.banCertainUsers && this.isBannedUser()) {
      this.accessAllowed = false;
    }

    if (this.accessAllowed) {
      this.readmitAction();
      return;
    } else {
      if (!this.initialized) {
        this.init();
      }
      this.banAction();
    }
    log(`Access Allowed: ${this.accessAllowed}`)
  };

  static wearableCheck = (wearableList: { contractAddress: string; itemId: string }[]) => {
    // check if the user is wearing a wearable in the list
    return VLMSessionManager.dclUserData.avatar.wearables.some((wearable: string) => {
      return wearableList.some((checkedWearable: { contractAddress: string; itemId: string }) => {
        return wearable.indexOf(checkedWearable.contractAddress) >= 0 && wearable.indexOf(String(checkedWearable.itemId)) > 0;
      });
    });
  };

  static hasAllowedWearables = () => {
    const allowedWearables = this.moderationSettings.allowedWearables;
    if (allowedWearables) {
      return this.wearableCheck(allowedWearables);
    }
  };

  static hasBannedWearables = () => {
    const bannedWearables = this.moderationSettings.bannedWearables;
    if (bannedWearables) {
      this.bannedWearable = this.wearableCheck(bannedWearables);
      return this.bannedWearable;
    }
  };

  static isBannedUser = () => {
    const bannedUsers = this.moderationSettings.bannedUsers;
    if (bannedUsers) {
      this.bannedUser = bannedUsers.some((user: PlayerConfig) => {
        let userName = VLMSessionManager.sessionUser.displayName;
        if (VLMSessionManager.sessionUser.displayName.indexOf("#") >= 0) {
          userName = userName.split("#")[0];
        }
        return userName === user.displayName || VLMSessionManager.sessionUser.displayName === user.displayName || VLMSessionManager.dclUserData.userId === user.connectedWallet;
      });
      return this.bannedUser;
    }
  };

  static isAllowedUser = () => {
    const allowedUsers = this.moderationSettings.allowedUsers;
    if (!allowedUsers) {
      return;
    } else {
      return allowedUsers.some((user: PlayerConfig) => {
        if (user && VLMSessionManager.sessionUser) {
          return (user.displayName && VLMSessionManager.sessionUser.displayName.indexOf(user.displayName) >= 0) || (user.connectedWallet && VLMSessionManager.dclUserData.userId === user.connectedWallet);
        }
      });
    }
  };

  static banAction = () => {
    if (!this.moderationSettings.banActions) {
      return;
    }
    if (includes(this.moderationSettings.banActions, VLMModeration.BanActions.WALL)) {
      this.movePlayer();
      if (!this.walls.length) {
        this.createWalls();
      } else {
        this.updateWalls();
      }
    }
    if (includes(this.moderationSettings.banActions, VLMModeration.BanActions.BLACKOUT)) {
      this.blackoutScreen();
    }
  };

  static readmitAction = () => {
    if (this.blackout) {
      this.blackout.hide();
    }
    if (this.walls.length) {
      this.removeWalls();
    }
    engine.removeSystem(this);
  };

  static blackoutScreen = () => {
    if (!this.blackout) {
      this.blackout = new Blackout();
    }
    if (this.bannedUser) {
      this.blackout.bannedUser();
      return;
    } else if (this.bannedWearable) {
      this.blackout.bannedWearable();
    } else if (!this.accessAllowed) {
      this.blackout.accessRestricted();
    }
  };

  static movePlayer = () => {
    const playerWorldPosition = Camera.instance.worldPosition;
    if (!this.parcelBounds.length) {
      return;
    }

    let insideParcel;
    for (let i = 0; i < this.parcelBounds.length; i++) {
      const parcelBound = this.parcelBounds[i];
      if ((parcelBound.e >= playerWorldPosition.x && parcelBound.w <= playerWorldPosition.x) &&
        (parcelBound.n >= playerWorldPosition.z && parcelBound.s <= playerWorldPosition.z)) {
        insideParcel = parcelBound;
        break;
      }
    }

    if (!insideParcel) {
      return;
    }

    const atNorthWall = playerWorldPosition.z > insideParcel.nr - 1 && !insideParcel.hasAdjacentNorth;
    const atEastWall = playerWorldPosition.x > insideParcel.er - 1 && !insideParcel.hasAdjacentEast;
    const atSouthWall = playerWorldPosition.z < insideParcel.sr + 1 && !insideParcel.hasAdjacentSouth;
    const atWestWall = playerWorldPosition.x < insideParcel.wr + 1 && !insideParcel.hasAdjacentWest;

    // if (atNorthWall) {
    //   movePlayerTo({
    //     x: playerWorldPosition.x,
    //     y: playerWorldPosition.y,
    //     z: insideParcel.n - 0.5, // Adjusted to move the player right to the boundary
    //   });
    // } else if (atEastWall) {
    //   movePlayerTo({
    //     x: insideParcel.e - 0.5, // Adjusted to move the player right to the boundary
    //     y: playerWorldPosition.y,
    //     z: playerWorldPosition.z,
    //   });
    // } else if (atSouthWall) {
    //   movePlayerTo({
    //     x: playerWorldPosition.x,
    //     y: playerWorldPosition.y,
    //     z: insideParcel.s + 0.5, // Adjusted to move the player right to the boundary
    //   });
    // } else if (atWestWall) {
    //   movePlayerTo({
    //     x: insideParcel.w + 0.5, // Adjusted to move the player right to the boundary
    //     y: playerWorldPosition.y,
    //     z: playerWorldPosition.z,
    //   });
    // }
    movePlayerTo({ x: 0, y: 0, z: 0 })
  };



  static findSceneBounds = async () => {
    this.parcelBounds = [];
    this.sceneHeight = Math.log(this.parcels.length + 1) * 20; // setting sceneHeight

    this.parcels.forEach((parcel: string) => {
      const [x, z] = parcel.split(",").map(Number);
      const bounds = {
        x, z,
        n: z * parcelSize + parcelSize,
        e: x * parcelSize + parcelSize,
        s: z * parcelSize,
        w: x * parcelSize,
        nr: (z - this.baseParcel.z) * parcelSize + parcelSize,
        er: (x - this.baseParcel.x) * parcelSize + parcelSize,
        sr: (z - this.baseParcel.z) * parcelSize,
        wr: (x - this.baseParcel.x) * parcelSize
      };
      this.parcelBounds.push(bounds);
    });

    this.parcelBounds.forEach((parcelBound) => {
      parcelBound.hasAdjacentNorth = this.parcelBounds.some(otherParcelBound =>
        (parcelBound.e === otherParcelBound.e || parcelBound.w === otherParcelBound.w) &&
        parcelBound.n === otherParcelBound.s);
      parcelBound.hasAdjacentEast = this.parcelBounds.some(otherParcelBound =>
        (parcelBound.n === otherParcelBound.n || parcelBound.s === otherParcelBound.s) &&
        parcelBound.e === otherParcelBound.w);
      parcelBound.hasAdjacentSouth = this.parcelBounds.some(otherParcelBound =>
        (parcelBound.e === otherParcelBound.e || parcelBound.w === otherParcelBound.w) &&
        parcelBound.s === otherParcelBound.n);
      parcelBound.hasAdjacentWest = this.parcelBounds.some(otherParcelBound =>
        (parcelBound.n === otherParcelBound.n || parcelBound.s === otherParcelBound.s) &&
        parcelBound.w === otherParcelBound.e);
    });
  };



  static createWalls = () => {
    let { sceneHeight, walls, parcelBounds } = this;

    if (walls.length) {
      this.updateWalls();
      return;
    }
    parcelBounds.forEach((parcelBound) => {
      const wallShape = new PlaneShape();
      const wallMat = new Material();
      const wallSize = new Vector3(parcelSize, sceneHeight, 1);
      const ceilingSize = new Vector3(parcelSize, parcelSize, 1);
      const rotatedWall = Quaternion.Euler(0, 90, 0);
      const rotatedCeiling = Quaternion.Euler(90, 0, 0);

      this.setWallMaterial(wallMat);

      const { nr, er, sr, wr } = parcelBound;

      const ceiling = new Entity();
      const ceilingPosition = new Vector3(er - parcelSize / 2, sceneHeight, nr - parcelSize / 2);
      ceiling.addComponentOrReplace(wallShape);
      ceiling.addComponentOrReplace(wallMat);
      ceiling.addComponentOrReplace(
        new Transform({
          position: ceilingPosition,
          scale: ceilingSize,
          rotation: rotatedCeiling,
        })
      );
      engine.addEntity(ceiling);
      walls.push(ceiling);

      const northWall = new Entity();
      const northWallPosition = new Vector3(er - parcelSize / 2, sceneHeight / 2, nr);
      wallShape.withCollisions = true;
      northWall.addComponentOrReplace(wallShape);
      northWall.addComponentOrReplace(wallMat);
      northWall.addComponentOrReplace(new Transform({ position: northWallPosition, scale: wallSize }));
      engine.addEntity(northWall);
      walls.push(northWall);

      const eastWall = new Entity();
      const eastWallPosition = new Vector3(er, sceneHeight / 2, nr - parcelSize / 2);
      eastWall.addComponentOrReplace(wallShape);
      eastWall.addComponentOrReplace(wallMat);
      eastWall.addComponentOrReplace(
        new Transform({
          position: eastWallPosition,
          scale: wallSize,
          rotation: rotatedWall,
        })
      );
      engine.addEntity(eastWall);
      walls.push(eastWall);

      const southWall = new Entity();
      const southWallPosition = new Vector3(er - parcelSize / 2, sceneHeight / 2, sr);
      southWall.addComponentOrReplace(wallShape);
      southWall.addComponentOrReplace(wallMat);
      southWall.addComponentOrReplace(new Transform({ position: southWallPosition, scale: wallSize }));
      engine.addEntity(southWall);
      walls.push(southWall);

      const westWall = new Entity();
      const westWallPosition = new Vector3(wr, sceneHeight / 2, nr - parcelSize / 2);
      westWall.addComponentOrReplace(wallShape);
      westWall.addComponentOrReplace(wallMat);
      westWall.addComponentOrReplace(
        new Transform({
          position: westWallPosition,
          scale: wallSize,
          rotation: rotatedWall,
        })
      );
      engine.addEntity(westWall);
      walls.push(westWall);

    });
  };

  static removeWalls = () => {
    this.walls.forEach((wall: Entity) => {
      engine.removeEntity(wall);
    });
    this.walls.length = 0;
  };

  static updateWalls = () => {
    if (this.currentWallType === this.moderationSettings.banWallType) {
      return;
    }
    this.walls.forEach((wall: Entity) => {
      const newMat = new Material();
      this.setWallMaterial(newMat);
      wall.addComponentOrReplace(newMat);
    });
  };

  static setWallMaterial = (wallMat: Material) => {
    switch (this.moderationSettings.banWallType) {
      case VLMModeration.BanWallType.BLACK:
        this.currentWallType = VLMModeration.BanWallType.BLACK;
        wallMat.albedoColor = Color4.Black();
        wallMat.specularIntensity = 0;
        wallMat.roughness = 1;
        wallMat.metallic = 0;
        break;
      case VLMModeration.BanWallType.MIRROR:
        this.currentWallType = VLMModeration.BanWallType.MIRROR;
        wallMat.albedoColor = new Color4(1, 1, 1, 1);
        wallMat.specularIntensity = 1;
        wallMat.roughness = 0;
        wallMat.metallic = 1;
        break;
      default:
        this.currentWallType = VLMModeration.BanWallType.INVISIBLE;
        wallMat.albedoColor = new Color4(0, 0, 0, 0);
        wallMat.specularIntensity = 1;
        wallMat.roughness = 0;
        wallMat.metallic = 1;
    }
  };
}
