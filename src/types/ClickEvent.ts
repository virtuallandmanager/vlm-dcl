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
  moveTo?: { cameraTarget: TTransform; position: TTransform, setCameraTarget: boolean };
  teleportTo?: string;
  hasTracking?: boolean;
  trackingId?: string;
  synced?: boolean;
};
