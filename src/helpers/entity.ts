import { StoredEntityInstance, StoredEntityMaterial } from "../classes/index";
import { TEntityInstanceConfig, TEntityMaterialConfig } from "../types/index";

export function getId(ref: TEntityMaterialConfig | TEntityInstanceConfig | StoredEntityMaterial | StoredEntityInstance) {
  return ref.customId || ref.id;
}

export const getEntityByName = (name: string) =>
  Object.keys(engine.entities)
    .map((key) => engine.entities[key])
    .filter((entity) => (entity as Entity).name === name)[0];
