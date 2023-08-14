import { VLMWidget } from "../components/VLMWidget.component";

export abstract class VLMWidgetManager {

  static configureWidgets: CallableFunction = (configs: VLMWidget.DCLConfig[]) => {
    try {
      configs.forEach((config: VLMWidget.DCLConfig) => {
        if (!VLMWidget.configs[config.id]) {
          VLMWidget.configs[config.id] = {
            id: config.id,
            value: config.value,
            update: () => { },
          };
          if (config.hasOwnProperty('init')) {
            VLMWidget.configs[config.id].init = config.init;
          }
          if (config.hasOwnProperty('update')) {
            VLMWidget.configs[config.id].update = config.update;
          }
          if (config.hasOwnProperty('delete')) {
            VLMWidget.configs[config.id].delete = config.delete;
          }
        }
      });
      log('VLM - Configured Widgets', VLMWidget.configs);
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
        const widget = { ...VLMWidget.configs[config.id] };
        VLMWidget.configs[config.id] = {
          ...widget,
          sk: config.sk,
          id: config.id,
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
    Object.keys(VLMWidget.configs).forEach((widgetConfigId: string) => {
      const config = VLMWidget.configs[widgetConfigId];
      if (!config || config.type === VLMWidget.ControlType.TRIGGER) {
        return VLMWidget.configs;
      } else if (config.init) {
        config.init(config);
      } else {
        config.update(config);
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

  static update: CallableFunction = (widget: VLMWidget.DCLConfig) => {
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
      VLMWidget.configs[widget.id].update(widget);
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
        config.delete(config);
      } else {
        config.update(config);
      }
      delete VLMWidget.configs[widgetId];
      log('VLM - Deleted Widget', widgetId);
    } catch (error) {
      throw error;
    }
  };
}
