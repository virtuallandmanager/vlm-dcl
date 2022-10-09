import { StoredEntityInstance, StoredEntityMaterial } from "../classes/index";
import { TEntityInstanceConfig, TEntityMaterialConfig } from "../types/index";

export const getEntityByName = (name: string) =>
  Object.keys(engine.entities)
    .map((key) => engine.entities[key])
    .filter((entity) => (entity as Entity).name === name)[0];

export const getEntityById = (id: string) =>
  Object.keys(engine.entities)
    .map((key) => engine.entities[key])
    .filter((entity) => (entity as StoredEntityInstance).id === id)[0];
