import { TCustomization, TCustomizationFunction, TCustomizationFunctions } from "./types/Customization";

const customizationFunctions: TCustomizationFunctions = {};

export const setCustomizations = (customizationId: string, options: TCustomizationFunction) => {
  if (options.init) {
    customizationFunctions[customizationId].init = options.init;
  }
  if (options.update) {
    customizationFunctions[customizationId].update = options.update;
  }
  initCustomizations();
};

export const initCustomizations = () => {
  Object.keys(customizationFunctions).forEach((customizationFunction: any) => {
    customizationFunctions[customizationFunction].init();
  });
};

export const updateCustomization = (customization: TCustomization, customizationId: string) => {
  customizationFunctions[customizationId].update(customization);
};

export const deleteCustomization = (customizationId: string) => {
  delete customizationFunctions[customizationId];
};
