import { PositionType } from "@decentraland/RestrictedActions";
import { TTransform } from "./Transform";

export enum EClickEventType {
  NONE,
  EXTERNAL,
  TRACKING_ONLY,
  SOUND,
  STREAM,
  MOVE,
  TELEPORT,
}

export type TClickEvent = {
  type: EClickEventType;
  showFeedback: boolean;
  hoverText: string;
  externalLink?: string;
  sound?: string;
  moveTo?: { cameraTarget: PositionType; position: PositionType, setCameraTarget: boolean };
  teleportTo?: string;
  hasTracking?: boolean;
  trackingId?: string;
  synced?: boolean;
};
