import { VLMWidget } from "../components/VLMWidget.component";

export abstract class VLMWidgetManager {

  static configureWidgets: CallableFunction = (configs: VLMWidget.DCLConfig[]) => {
    try {
      configs = sortConfigs(configs);
      configs.forEach((config: VLMWidget.DCLConfig) => {
        if (!VLMWidget.configs[config.id]) {
          VLMWidget.configs[config.id] = {
            order: config.order,
            id: config.id,
            value: config.value,
            update: () => { },
          };
          if (config.hasOwnProperty('init')) {
            VLMWidget.configs[config.id].init = config?.init;
          }
          if (config.hasOwnProperty('update')) {
            VLMWidget.configs[config.id].update = config?.update;
          }
          if (config.hasOwnProperty('delete')) {
            VLMWidget.configs[config.id].delete = config?.delete;
          }
        }
      });
      log('VLM - Configured Widgets', configs);
    } catch (error) {
      throw error;
    }
  };

  static setState: CallableFunction = (configs: VLMWidget.VLMConfig[]) => {
    try {
      if (!configs) {
        return;
      }
      configs = sortConfigs(configs);
      configs.forEach((config: VLMWidget.VLMConfig) => {
        if (!VLMWidget.configs[config.id]) {
          return;
        }
        const widget = { ...VLMWidget.configs[config.id] };
        VLMWidget.configs[config.id] = {
          ...widget,
          sk: config.sk,
          id: config.id,
          order: config.order,
          value: config.value,
          type: config.type,
        };
      });
      log('VLM - Set Widget State', VLMWidget.configs)
    } catch (error) {
      throw error;
    }
  };

  static init: CallableFunction = () => {
    const configArray = Object.keys(VLMWidget.configs).map((key: string) => VLMWidget.configs[key]);
    const sortedConfigs = sortConfigs(configArray);
    sortedConfigs.forEach((config: VLMWidget.DCLConfig) => {
      if (!VLMWidget.configs[config.id]) {
        return;
      }
      if (!config || config.type === VLMWidget.ControlType.TRIGGER) {
        return VLMWidget.configs;
      } else if (config.init) {
        config?.init(config);
      } else {
        config?.update(config);
      }
    });
    return VLMWidget.configs;
  };

  static create: CallableFunction = (widget: VLMWidget.DCLConfig) => {
    try {
      if (!VLMWidget.configs[widget.id]) {
        VLMWidget.configs[widget.id] = {
          sk: widget.sk,
          id: widget.id,
          value: widget.value,
          update: () => { },
        };
      }
      VLMWidget.configs[widget.id].value = widget.value;

      if (typeof VLMWidget.configs[widget.id].init === "function") {
        VLMWidget.configs[widget.id].init(widget);
      }
      log('VLM - Created Widget', VLMWidget.configs[widget.id]);
    } catch (error) {
      throw error;
    }
  };

  static update: CallableFunction = (widget: VLMWidget.DCLConfig, user: { connectedWallet: string, displayName: string }) => {
    try {
      if (!VLMWidget.configs[widget.id]) {
        VLMWidget.configs[widget.id] = {
          sk: widget.sk,
          id: widget.id,
          value: widget.value,
          update: () => { },
        };
      }
      VLMWidget.configs[widget.id].value = widget.value;
      VLMWidget.configs[widget.id].update({ ...widget, user });
      log('VLM - Updated Widget', VLMWidget.configs[widget.id]);
    } catch (error) {
      throw error;
    }
  };

  static delete: CallableFunction = (widgetId: string) => {
    try {
      const config = VLMWidget.configs[widgetId];
      config.value = false;
      if (!config) {
        return;
      } else if (config.delete) {
        config?.delete(config);
      } else {
        config?.update(config);
      }
      delete VLMWidget.configs[widgetId];
      log('VLM - Deleted Widget', widgetId);
    } catch (error) {
      throw error;
    }
  };
}

const sortConfigs = (configs: VLMWidget.DCLConfig[]) => {
  const configsAreOrdered = configs.some((config: VLMWidget.DCLConfig) => config.hasOwnProperty('order'));
  if (!configsAreOrdered) {
    return configs;
  }

  const sortedConfigs = configs.sort((a: VLMWidget.DCLConfig, b: VLMWidget.DCLConfig) => {
    if (a.order && b.order == undefined) {
      return -1;
    } else if (a.order == undefined && b.order) {
      return 1;
    }

    if (a.order < b.order) {
      return -1;
    } else if (a.order > b.order) {
      return 1;
    } else {
      return 0;
    }
  });
  configs = sortedConfigs;
  log('VLM - Sorted Widgets', configs)
  return sortedConfigs
}