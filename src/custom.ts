import { TCustomizationConfig, TCustomizationConfigs } from "./types/Customization";

const customizationConfigs: TCustomizationConfigs = {};

export const setCustomizationState = (configs: TCustomizationConfig[]) => {
  configs.forEach((config: TCustomizationConfig) => {
    customizationConfigs[config.id] = { id: config.id, value: config.value, update: () => {} };
  });
  log(customizationConfigs);
};

export const setCustomizationFunctions = (configs: TCustomizationConfig[]) => {
  log("CUSTOM - SET CUSTOMIZATION FUNCTIONS");
  configs.forEach((config: TCustomizationConfig) => {
    log("UPDATE", config);
    if (config.init) {
      customizationConfigs[config.id].init = config.init;
    }
    if (config.update) {
      customizationConfigs[config.id].update = config.update;
    }
  });
  log(`CUSTOM - UPDATE`, customizationConfigs);
  initCustomizations();
};

export const initCustomizations = () => {
  Object.keys(customizationConfigs).forEach((customizationConfigId: string) => {
    const config = customizationConfigs[customizationConfigId];
    if (!config) {
      log(`CUSTOM ${customizationConfigId} does not exist`);
    }
    if (config.init) {
      log(`CUSTOM - INITING ${customizationConfigId}`);
      customizationConfigs[customizationConfigId].init(config.value);
    } else {
      log(`CUSTOM - UPDATING ${customizationConfigId}`);
      customizationConfigs[customizationConfigId].update(config.value);
    }
  });
};

export const updateCustomization = (customization: TCustomizationConfig, customizationId: string) => {
  customizationConfigs[customizationId].value = customization.value;
  customizationConfigs[customizationId].update(customization.value);
  log(customizationConfigs);
};

export const deleteCustomization = (customizationId: string) => {
  customizationConfigs[customizationId].update(false);
  delete customizationConfigs[customizationId];
};
