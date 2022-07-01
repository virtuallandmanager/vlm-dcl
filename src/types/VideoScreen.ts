import { TEntity, TEntityInstance } from "./Entity";
import { TTransform } from "./Transform";

export enum EVideoSourceTypes {
  LIVE,
  PLAYLIST,
  NONE
}

export type TVideoScreen = TEntity & {
  type: EVideoSourceTypes;
  customRendering: boolean;
  offType: EVideoSourceTypes;
  liveLink?: string;
  playlist?: string[];
  offImage?: string;
  emission: number;
  volume?: number;
  noLoop?: boolean;
  id: string;
  customId?: string;
  instances: Array<TVideoScreenInstance>;
};

export type TVideoScreenInstance = TEntityInstance & {
  id: string;
  customRendering: boolean;
  customId: string;
  position: TTransform;
  scale: TTransform;
  rotation: TTransform;
};
