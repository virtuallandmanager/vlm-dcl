import { TEntityInstanceConfig } from "./Entity";
import { TTransform } from "./Transform";

export type TNFTConfig = {
  id: string;
  customId?: string;
  parent?: string;
  instances?: TNFTInstanceConfig[];
  chain?: number | string;
  contractAddress: string;
  itemId?: number | string;
  tokenId?: number | string;
  style?: PictureFrameStyle;
  show?: boolean;
  color?: string;
  withCollisions?: boolean;
};

export type TNFTInstanceConfig = TEntityInstanceConfig & {
    id: string;
    customId?: string;
    customRendering?: boolean;
    name: string;
    parent?: string;
    position: TTransform;
    rotation: TTransform;
    scale: TTransform;
    show: boolean;
    withCollisions: boolean;
  };
  