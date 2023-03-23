import {
  TCustomizationConfig,
  TCustomizationConfigs,
} from "../types/Customization";

export abstract class VLMCustomizations {
  static configs: TCustomizationConfigs = {};
  static setState = (configs: TCustomizationConfig[]) => {
    if (!configs) {
      return;
    }
    configs.forEach((config: TCustomizationConfig) => {
      this.configs[config.id] = {
        id: config.id,
        value: config.value,
        update: (config: TCustomizationConfig) => {
          log(config);
        },
      };
    });
  };

  static setFunctions = (configs: TCustomizationConfig[]) => {
    configs.forEach((config: TCustomizationConfig) => {
      if (config.init) {
        this.configs[config.id].init = config.init;
      }
      if (config.update) {
        this.configs[config.id].update = config.update;
      }
      if (config.delete) {
        this.configs[config.id].delete = config.delete;
      }
    });
    return this.init();
  };

  static init = () => {
    Object.keys(this.configs).forEach(
      (customizationConfigId: string) => {
        const config = this.configs[customizationConfigId];
        if (!config) {
          return this.configs;
        } else if (config.init) {
          config.init(config);
        } else {
          config.update(config);
        }
      }
    );
    return this.configs;
  };

  static update = (
    customization: TCustomizationConfig,
    customizationId: string
  ) => {
    if (!this.configs[customizationId]) {
      this.configs[customizationId] = {
        id: customization.id,
        value: customization.value,
        update: () => {},
      };
    }
    this.configs[customizationId].value = customization.value;
    this.configs[customizationId].update(customization);
  };

  static delete = (customizationId: string) => {
    const config = this.configs[customizationId];
    config.value = false;
    if (!config) {
      return;
    } else if (config.delete) {
      config.delete(config);
    } else {
      config.update(config);
    }
    delete this.configs[customizationId];
  };
}
