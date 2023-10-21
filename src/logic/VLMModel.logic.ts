import { VLMModel } from "../components/VLMModel.component";

export abstract class VLMModelManager {
  static init: CallableFunction = (models: VLMModel.VLMConfig[]) => {
    try {
      if (!models) {
        return;
      }
      models.forEach((model: VLMModel.VLMConfig) => {
        this.create(model);
      });
    } catch (error) {
      throw error;
    }
  };

  static create: CallableFunction = (config: VLMModel.VLMConfig) => {
    try {
      if (!config.enabled) {
        return;
      }
      new VLMModel.DCLConfig(config);
    } catch (error) {
      throw error;
    }
  };

  static createInstance: CallableFunction = (config: VLMModel.VLMConfig, instance: VLMModel.VLMInstanceConfig) => {
    try {
      if (!config.enabled || !instance.enabled) {
        return;
      }
      const modelId = config.sk;
      VLMModel.configs[modelId].createInstance(instance);
    } catch (error) {
      throw error;
    }
  };

  static update: CallableFunction = (config: VLMModel.VLMConfig | any, property: string, id: string) => {
    try {
      const model: VLMModel.DCLConfig = VLMModel.configs[config.sk || id];

      if (!config || (!model && !config.enabled)) {
        return;
      } else if (!model && config.enabled) {
        new VLMModel.DCLConfig(config);
      }

      switch (property) {
        case "enabled":
          if (!config.enabled) {
            this.remove(config.sk);
          } else if (model) {
            this.add(config.sk);
          } else {
            new VLMModel.DCLConfig(config);
          }
          break;
        case "modelSrc":
          model.updateModelSrc(config.modelSrc);
          break;
        case "clickEvent":
          model.updateClickEvent(config.clickEvent);
          break;
        case "parent":
          model.updateParent(config.parent);
          break;
        case "customId":
          model.updateCustomId(config.customId);
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  static updateInstance: CallableFunction = (instanceConfig: VLMModel.VLMInstanceConfig, property: string, id: string) => {
    try {
      const instance = VLMModel.instances[instanceConfig.sk],
        configId = instance.configId,
        config = VLMModel.configs[configId];

      if (!config) {
        return;
      } else if (!instance && instanceConfig.enabled) {
        config.createInstance(instanceConfig);
      }

      const { position, scale, rotation } = instanceConfig;

      switch (property) {
        case "enabled":
          if (!config.enabled || !instanceConfig.enabled) {
            config.removeInstance(instanceConfig.sk);
          } else if (instance && instanceConfig.enabled) {
            config.addInstance(instanceConfig.sk);
          }
          break;
        case "transform":
          instance.updateTransform(position, scale, rotation);
          break;
        case "clickEvent":
          instance.updateClickEvent(instanceConfig.clickEvent);
          break;
        case "properties":
          instance.updateParent(instanceConfig.parent);
          instance.updateCustomId(instanceConfig.customId);
          instance.updateCustomRendering(instanceConfig.customRendering);
          break;
        case "customId":
          instance.updateCustomId(instanceConfig.customId);
          break;
        case "customRendering":
          instance.updateCustomRendering(instanceConfig.customRendering);
          break;
        case "parent":
          instance.updateParent(instanceConfig.parent);
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  static add: CallableFunction = (id: string) => {
    VLMModel.configs[id].showAll();
  };

  static delete: CallableFunction = (id: string) => {
    VLMModel.configs[id].delete();
  };

  static remove: CallableFunction = (id: string) => {
    VLMModel.configs[id].remove();
  };

  static removeInstance: CallableFunction = (instanceId: string) => {
    VLMModel.instances[instanceId].remove()
  };

  static deleteInstance: CallableFunction = (instanceId: string) => {
    log("VLM - Deleting Instance - Step 1", instanceId)

    const instanceids = Object.keys(VLMModel.instances).map((key) => {
      return key
    })
    const instancenames = Object.keys(VLMModel.instances).map((key) => {
      return VLMModel.instances[key].name
    })
    log(instanceids)
    log(instancenames)

    const instance = VLMModel.instances[instanceId];
    const configId = instance?.configId;

    log("VLM - Deleting Instance - Step 2", instance, instanceId)

    if (configId) {
      log("VLM - Deleting Instance - Step 3", instanceId, configId)
      VLMModel.configs[configId].deleteInstance(instanceId);
    }
  };
}
