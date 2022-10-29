import { TCustomizationConfig, TCustomizationConfigs } from "./types/Customization";

export const customizationConfigs: TCustomizationConfigs = {};

export const setCustomizationState = (configs: TCustomizationConfig[]) => {
  log(configs);
  configs.forEach((config: TCustomizationConfig) => {
    customizationConfigs[config.id] = {
      id: config.id,
      value: config.value,
      update: (config: TCustomizationConfig) => {
        log(config);
      }
    };
  });
  log(customizationConfigs);
};

export const setCustomizationFunctions = (configs: TCustomizationConfig[]) => {
  configs.forEach((config: TCustomizationConfig) => {
    if (config.init) {
      customizationConfigs[config.id].init = config.init;
    }
    if (config.update) {
      customizationConfigs[config.id].update = config.update;
    }
    if (config.delete) {
      customizationConfigs[config.id].delete = config.delete;
    }
  });
  return initCustomizations();
};

export const initCustomizations = () => {
  Object.keys(customizationConfigs).forEach((customizationConfigId: string) => {
    const config = customizationConfigs[customizationConfigId];
    if (!config) {
    }
    if (config.init) {
      customizationConfigs[customizationConfigId].init(config);
    } else {
      customizationConfigs[customizationConfigId].update(config);
    }
  });
  return customizationConfigs;
};

export const updateCustomization = (customization: TCustomizationConfig, customizationId: string) => {
  customizationConfigs[customizationId].value = customization.value;
  customizationConfigs[customizationId].update(customization);
  log(customizationConfigs);
};

export const deleteCustomization = (customizationId: string) => {
  const config = customizationConfigs[customizationId];
  config.value = false;
  if (config.delete) {
    customizationConfigs[customizationId].delete(config);
  } else {
    customizationConfigs[customizationId].update(config);
  }
  delete customizationConfigs[customizationId];
};
