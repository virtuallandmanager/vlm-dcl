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

export const updateCustomization = (customizationId: string) => {
  customizationFunctions[customizationId].update();
};

export const deleteCustomization = (customizationId: string) => {
  delete customizationFunctions[customizationId];
};
