import { VLMWidget } from "../components/VLMWidget.component";

export abstract class VLMWidgetManager {

  static configureWidgets: CallableFunction = (configs: VLMWidget.DCLConfig[]) => {
    try {
      configs.forEach((config: VLMWidget.DCLConfig) => {
        if (!VLMWidget.configs[config.id]) {
          VLMWidget.configs[config.id] = {
            id: config.id,
            update: () => { },
          };
          if (config.init) {
            VLMWidget.configs[config.id].init = config.init;
          }
          if (config.update) {
            VLMWidget.configs[config.id].update = config.update;
          }
          if (config.delete) {
            VLMWidget.configs[config.id].delete = config.delete;
          }
        }
      });
    } catch (error) {
      throw error;
    }
  };

  static setState: CallableFunction = (configs: VLMWidget.VLMConfig[]) => {
    try {
      if (!configs) {
        return;
      }
      configs.forEach((config: VLMWidget.VLMConfig) => {
        VLMWidget.configs[config.id] = {
          sk: config.sk,
          id: config.id,
          value: config.value,
          update: (config: VLMWidget.VLMConfig) => {
            log(`VLM - USER ERROR - WIDGET ${config.id} WAS LOADED IN FROM VLM, BUT ITS FUNCTIONS WERE NOT CONFIGURED PROPERLY.`)
          },
        };
      });
    } catch (error) {
      throw error;
    }
  };

  static init: CallableFunction = () => {
    Object.keys(VLMWidget.configs).forEach((widgetConfigId: string) => {
      const config = VLMWidget.configs[widgetConfigId];
      if (!config) {
        return VLMWidget.configs;
      } else if (config.init) {
        config.init(config);
      } else {
        config.update(config);
      }
    });
    return VLMWidget.configs;
  };

  static create: CallableFunction = (widget: VLMWidget.DCLConfig, widgetId: string) => {
    try {
      if (!VLMWidget.configs[widgetId]) {
        VLMWidget.configs[widgetId] = {
          sk: widget.sk,
          id: widget.id,
          value: widget.value,
          update: () => { },
        };
      }
      VLMWidget.configs[widgetId].value = widget.value;

      if (typeof VLMWidget.configs[widgetId]?.init === "function") {
        VLMWidget.configs[widgetId].init!(widget);
      }
    } catch (error) {
      throw error;
    }
  };

  static update: CallableFunction = (widget: VLMWidget.DCLConfig, widgetId: string) => {
    try {
      if (!VLMWidget.configs[widgetId]) {
        VLMWidget.configs[widgetId] = {
          sk: widget.sk,
          id: widget.id,
          value: widget.value,
          update: () => { },
        };
      }
      VLMWidget.configs[widgetId].value = widget.value;
      VLMWidget.configs[widgetId].update(widget);
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
        config.delete(config);
      } else {
        config.update(config);
      }
      delete VLMWidget.configs[widgetId];
    } catch (error) {
      throw error;
    }
  };
}
