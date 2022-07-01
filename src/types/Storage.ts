import { StoredEntity } from "../classes/StoredEntity";
import { StoredVideoScreen } from "../classes/StoredVideoScreen";

export type TEntityStorage = {
  [id: string]: StoredEntity;
};

export type TVideoStorage = {
  [id: string]: StoredVideoScreen;
};
