import { TrackUserFlag } from "@dcl/npc-scene-utils";
import { TCustomization, TCustomizationFunctions } from "./types/Customization";

const customizationFunctions: TCustomizationFunctions = {
  create: ([]) => {},
  update: () => {},
  remove: () => {}
};

export function setCustomizations(options: TCustomizationFunctions) {
  if (options.create) {
    customizationFunctions.create = options.create;
  }
  if (options.update) {
    customizationFunctions.update = options.update;
  }
  if (options.remove) {
    customizationFunctions.remove = options.remove;
  }
}

export function createCustomizations(customizations: TCustomization[]) {
  customizationFunctions.create(customizations);
}

export function updateCustomization(customizations: TCustomization[], customizationId: string) {
  let customization;
  for (let i = 0; i < customizations.length, i++; ) {
    if (customizations[i].id === customizationId) {
      customization = customizations[i];
    }
  }
  if (!customization) {
    return;
  }
  customizationFunctions.update(customization, customizationId);
}

export function removeCustomization(customizationId: string) {
  customizationFunctions.remove(customizationId);
}
