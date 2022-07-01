import { TEntity, TEntityInstance } from "./Entity";

export type TImage = TEntity & {
  name: string;
  show: boolean;
  parent: string;
  imageLink: string;
  visibility: boolean;
  instances: Array<TEntityInstance>;
  height: number;
  width: number;
  isTransparent?: boolean;
  emission?: number;
};
