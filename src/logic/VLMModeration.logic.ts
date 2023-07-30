import { getParcel } from "@decentraland/ParcelIdentity";
import { movePlayerTo } from "@decentraland/RestrictedActions";
import { parcelSize } from "../shared/defaults";
import { includes } from "../utils";
import { VLMModeration } from "../components/VLMModeration.component";
import { VLMSessionManager } from "./VLMSession.logic";

type PlayerConfig = {
  walletAddress?: string;
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
  static canvas: UICanvas;
  static blackout: Blackout;
  static inScene: boolean;
  static parcels: string[];
  static baseParcel: { x: number; z: number };
  static sceneHeight: number;
  static parcelBounds: ParcelBound[] = [];
  static walls: Entity[] = [];
  static messages = {
    bannedUser: "You have been blocked from interacting with this scene.",
    bannedWearable: "One of your equipped wearables has been prohibited by this scene.",
    accessRestricted: "Access to this scene has been restricted.",
  };

  static update(dt: number) {
    const { inScene, accessAllowed, bannedUser, bannedWearable } = this;
    if (inScene && (!accessAllowed || bannedUser || bannedWearable)) {
      this.banAction();
    } else {
      return;
    }
  }

  static updateSettings = async (config: VLMModeration.VLMConfig) => {
    if (!this.canvas) {
      this.canvas = new UICanvas();
      this.canvas.width = "100%";
      this.canvas.height = "100%";
    }
    this.moderationSettings = config;
    const scene = await getParcel();
    this.parcels = scene.land.sceneJsonData.scene.parcels;
    const base = scene.land.sceneJsonData.scene.base.split(",");
    this.baseParcel = { x: Number(base[0]), z: Number(base[1]) };

    this.findSceneBounds();
    engine.addSystem(this);
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
      this.banAction();
    }
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
        let hasHash;
        if (VLMSessionManager.sessionUser.displayName.indexOf("#") >= 0) {
          userName = userName.split("#")[0];
          hasHash = true;
        }
        return userName === user.displayName || VLMSessionManager.sessionUser.displayName === user.displayName || VLMSessionManager.dclUserData.userId === user.walletAddress;
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
          return (user.displayName && VLMSessionManager.sessionUser.displayName.indexOf(user.displayName) >= 0) || (user.walletAddress && VLMSessionManager.dclUserData.userId === user.walletAddress);
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
      this.createWalls();
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
    const playerPosition = Camera.instance.position;
    const playerFeetPosition = Camera.instance.feetPosition;
    const playerWorldPosition = Camera.instance.worldPosition;
    // log(`World: ${playerWorldPosition}`);
    if (!this.parcelBounds.length) {
      return;
    }
    const insideParcel = this.parcelBounds.filter((parcelBound) => {
      let withinNSBounds, withinEWBounds;
      withinEWBounds = parcelBound.e >= playerWorldPosition.x && parcelBound.w <= playerWorldPosition.x;
      withinNSBounds = parcelBound.n >= playerWorldPosition.z && parcelBound.s <= playerWorldPosition.z;
      // log(parcelBound.x, parcelBound.z, `EW: ${withinEWBounds}`, `NS: ${withinNSBounds}`);
      return withinEWBounds && withinNSBounds;
    });

    const sameZ = this.parcelBounds.filter((parcelBound) => insideParcel.some((ip) => parcelBound.z == ip.z)).sort((a, b) => b.z - a.z);
    const sameX = this.parcelBounds.filter((parcelBound) => insideParcel.some((ip) => parcelBound.x == ip.x)).sort((a, b) => b.x - a.x);

    this.inScene = !!insideParcel.length;
    if (!this.inScene) {
      return;
    }
    const atNorthWall = playerPosition.z < insideParcel[0].nr + 1 && playerPosition.z > insideParcel[0].nr - 1;
    const atEastWall = playerPosition.x < insideParcel[0].er + 1 && playerPosition.x > insideParcel[0].er - 1;
    const atSouthWall = playerPosition.z < insideParcel[0].sr + 1 && playerPosition.z > insideParcel[0].sr - 1;
    const atWestWall = playerPosition.x < insideParcel[0].wr + 1 && playerPosition.x > insideParcel[0].wr - 1;

    // log(`In Scene: ${inScene}`);
    // log(`At North Wall: ${atNorthWall}`);
    // log(`At East Wall: ${atEastWall}`);
    // log(`At South Wall: ${atSouthWall}`);
    // log(`At West Wall: ${atWestWall}`);
    // log({ x: playerFeetPosition.x, y: playerFeetPosition.y, z: insideParcel[0].n / insideParcel[0].z });

    if (atNorthWall && !insideParcel[0].hasAdjacentNorth) {
      movePlayerTo({
        x: playerFeetPosition.x,
        y: playerFeetPosition.y,
        z: insideParcel[0].nr,
      });
    } else if (atEastWall && !insideParcel[0].hasAdjacentEast) {
      movePlayerTo({
        x: insideParcel[0].er,
        y: playerFeetPosition.y,
        z: playerFeetPosition.z,
      });
    } else if (atSouthWall && !insideParcel[0].hasAdjacentSouth) {
      movePlayerTo({
        x: playerFeetPosition.x,
        y: playerFeetPosition.y,
        z: insideParcel[0].sr,
      });
    } else if (atWestWall && !insideParcel[0].hasAdjacentWest) {
      movePlayerTo({
        x: insideParcel[0].wr,
        y: playerFeetPosition.y,
        z: playerFeetPosition.z,
      });
    } else if (insideParcel[0].x > 0) {
      movePlayerTo({
        x: sameZ[sameX.length - 1].er,
        y: playerFeetPosition.y,
        z: playerFeetPosition.z,
      });
    } else {
      movePlayerTo({
        x: sameZ[0].er,
        y: playerFeetPosition.y,
        z: playerFeetPosition.z,
      });
    }
  };

  static findSceneBounds = async () => {
    let { sceneHeight, parcels, parcelBounds, baseParcel } = this;
    sceneHeight = Math.log(parcels.length + 1) * 20;
    parcels.forEach((parcel: string) => {
      const parcelArr = parcel.split(","),
        x = Number(parcelArr[0]),
        z = Number(parcelArr[1]);
      let n = z * parcelSize + parcelSize,
        e = x * parcelSize + parcelSize,
        s = z * parcelSize,
        w = x * parcelSize,
        nr = (z - baseParcel.z) * parcelSize + parcelSize,
        er = (x - baseParcel.x) * parcelSize + parcelSize,
        sr = (z - baseParcel.z) * parcelSize,
        wr = (x - baseParcel.x) * parcelSize;

      if (z < 0) {
        s = s + parcelSize;
        sr = sr + parcelSize;
      }

      if (x < 0) {
        w = w + parcelSize;
        wr = wr + parcelSize;
      }

      const bounds = { x, z, n, e, s, w, nr, er, sr, wr };
      parcelBounds.push(bounds);

      log(parcelBounds);

      parcelBounds.forEach((parcelBound) => {
        const hasAdjacentNorth = parcelBounds.some((otherParcelBound) => (parcelBound.e === otherParcelBound.e || parcelBound.w === otherParcelBound.w) && parcelBound.n === otherParcelBound.s);
        const hasAdjacentEast = parcelBounds.some((otherParcelBound) => (parcelBound.n === otherParcelBound.n || parcelBound.s === otherParcelBound.s) && parcelBound.e === otherParcelBound.w);
        const hasAdjacentSouth = parcelBounds.some((otherParcelBound) => (parcelBound.e === otherParcelBound.e || parcelBound.w === otherParcelBound.w) && parcelBound.s === otherParcelBound.n);
        const hasAdjacentWest = parcelBounds.some((otherParcelBound) => (parcelBound.n === otherParcelBound.n || parcelBound.s === otherParcelBound.s) && parcelBound.w === otherParcelBound.e);

        parcelBound.hasAdjacentNorth = hasAdjacentNorth;
        parcelBound.hasAdjacentEast = hasAdjacentEast;
        parcelBound.hasAdjacentSouth = hasAdjacentSouth;
        parcelBound.hasAdjacentWest = hasAdjacentWest;
      });
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
      ceiling.addComponent(wallShape);
      ceiling.addComponent(wallMat);
      ceiling.addComponent(
        new Transform({
          position: ceilingPosition,
          scale: ceilingSize,
          rotation: rotatedCeiling,
        })
      );
      engine.addEntity(ceiling);
      walls.push(ceiling);

      if (!parcelBound.hasAdjacentNorth) {
        const northWall = new Entity();
        const northWallPosition = new Vector3(er - parcelSize / 2, sceneHeight / 2, nr);
        wallShape.withCollisions = true;
        northWall.addComponent(wallShape);
        northWall.addComponent(wallMat);
        northWall.addComponent(new Transform({ position: northWallPosition, scale: wallSize }));
        engine.addEntity(northWall);
        walls.push(northWall);
      }
      if (!parcelBound.hasAdjacentEast) {
        const eastWall = new Entity();
        const eastWallPosition = new Vector3(er, sceneHeight / 2, nr - parcelSize / 2);
        eastWall.addComponent(wallShape);
        eastWall.addComponent(wallMat);
        eastWall.addComponent(
          new Transform({
            position: eastWallPosition,
            scale: wallSize,
            rotation: rotatedWall,
          })
        );
        engine.addEntity(eastWall);
        walls.push(eastWall);
      }
      if (!parcelBound.hasAdjacentSouth) {
        const southWall = new Entity();
        const southWallPosition = new Vector3(er - parcelSize / 2, sceneHeight / 2, sr);
        southWall.addComponent(wallShape);
        southWall.addComponent(wallMat);
        southWall.addComponent(new Transform({ position: southWallPosition, scale: wallSize }));
        engine.addEntity(southWall);
        walls.push(southWall);
      }
      if (!parcelBound.hasAdjacentWest) {
        const westWall = new Entity();
        const westWallPosition = new Vector3(wr, sceneHeight / 2, nr - parcelSize / 2);
        westWall.addComponent(wallShape);
        westWall.addComponent(wallMat);
        westWall.addComponent(
          new Transform({
            position: westWallPosition,
            scale: wallSize,
            rotation: rotatedWall,
          })
        );
        engine.addEntity(westWall);
        walls.push(westWall);
      }
    });
  };

  static removeWalls = () => {
    this.walls.forEach((wall: Entity) => {
      engine.removeEntity(wall);
    });
    this.walls.length = 0;
  };

  static updateWalls = () => {
    this.walls.forEach((wall: Entity) => {
      const wallMat = wall.getComponent(Material);
      this.setWallMaterial(wallMat);
    });
  };

  static setWallMaterial = (wallMat: Material) => {
    switch (this.moderationSettings.banWallType) {
      case VLMModeration.BanWallType.BLACK:
        wallMat.albedoColor = Color4.Black();
        wallMat.specularIntensity = 0;
        wallMat.roughness = 1;
        wallMat.metallic = 0;
        break;
      case VLMModeration.BanWallType.MIRROR:
        wallMat.specularIntensity = 1;
        wallMat.roughness = 0;
        wallMat.metallic = 1;
        break;
      default:
        wallMat.albedoColor = new Color4(0, 0, 0, 0);
    }
  };
}
