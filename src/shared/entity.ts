import { VLMBase } from "../components/VLMBaseConfig.component";

export const getEntityByName = (name: string) =>
  Object.keys(engine.entities)
    .map((key) => engine.entities[key])
    .filter((entity) => (entity as Entity).name === name)[0];

export const getEntityById = (id: string) =>
  Object.keys(engine.entities)
    .map((key) => engine.entities[key])
    .filter((entity) => (entity as VLMBase.Instance).sk === id || (entity as VLMBase.Instance).customId == id)[0];
