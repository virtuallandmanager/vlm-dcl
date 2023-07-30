import { VLMWidget } from "../components/VLMWidget.component";

export abstract class VLMWidgetManager {
  static configs: {
    [uuid: string]: VLMWidget.DCLConfig;
  } = {};

  static configureWidgets: CallableFunction = (configs: VLMWidget.DCLConfig[]) => {
    try {
      configs.forEach((config: VLMWidget.DCLConfig) => {
        if (config.init) {
          VLMWidgetManager.configs[config.id].init = config.init;
        }
        if (config.update) {
          VLMWidgetManager.configs[config.id].update = config.update;
        }
        if (config.delete) {
          VLMWidgetManager.configs[config.id].delete = config.delete;
        }
      });
      return VLMWidgetManager.init();
    } catch (error) {
      log(error);
    }
  };

  static setState: CallableFunction = (configs: VLMWidget.VLMConfig[]) => {
    try {
      if (!configs) {
        return;
      }
      configs.forEach((config: VLMWidget.VLMConfig) => {
        VLMWidgetManager.configs[config.id] = {
          sk: config.sk,
          id: config.id,
          value: config.value,
          update: (config: VLMWidget.VLMConfig) => {
            log(config);
          },
        };
      });
    } catch (error) {
      throw error;
    }
  };

  static init: CallableFunction = () => {
    Object.keys(VLMWidgetManager.configs).forEach((widgetConfigId: string) => {
      const config = VLMWidgetManager.configs[widgetConfigId];
      if (!config) {
        return VLMWidgetManager.configs;
      } else if (config.init) {
        config.init(config);
      } else {
        config.update(config);
      }
    });
    return VLMWidgetManager.configs;
  };

  static create: CallableFunction = (widget: VLMWidget.DCLConfig, widgetId: string) => {
    if (!VLMWidgetManager.configs[widgetId]) {
      VLMWidgetManager.configs[widgetId] = {
        sk: widget.sk,
        id: widget.id,
        value: widget.value,
        update: () => {},
      };
    }
    VLMWidgetManager.configs[widgetId].value = widget.value;

    if (typeof VLMWidgetManager.configs[widgetId]?.init === "function") {
      VLMWidgetManager.configs[widgetId].init!(widget);
    }
  };

  static update: CallableFunction = (widget: VLMWidget.DCLConfig, widgetId: string) => {
    if (!VLMWidgetManager.configs[widgetId]) {
      VLMWidgetManager.configs[widgetId] = {
        sk: widget.sk,
        id: widget.id,
        value: widget.value,
        update: () => {},
      };
    }
    VLMWidgetManager.configs[widgetId].value = widget.value;
    VLMWidgetManager.configs[widgetId].update(widget);
  };

  static delete: CallableFunction = (widgetId: string) => {
    const config = VLMWidgetManager.configs[widgetId];
    config.value = false;
    if (!config) {
      return;
    } else if (config.delete) {
      config.delete(config);
    } else {
      config.update(config);
    }
    delete VLMWidgetManager.configs[widgetId];
  };
}
