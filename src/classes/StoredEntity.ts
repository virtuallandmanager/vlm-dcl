import { TImage } from "../types/Image";

export class StoredEntity extends Entity {
  data: TImage;
  material?: Material;
  basicMaterial?: BasicMaterial;
  texture: Texture;
  constructor(name: string) {
    super(name);
  }
}
