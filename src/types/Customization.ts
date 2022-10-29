export type TCustomizationConfigs = {
  [id: string]: TCustomizationConfig;
};

export type TCustomizationConfig = {
  id: string;
  type?: ECustomizationType;
  value?: string | boolean;
  init?: (config: TCustomizationConfig) => void;
  delete?: (config: TCustomizationConfig) => void;
  update: (config: TCustomizationConfig) => void;
};

export enum ECustomizationType {
  toggle,
  text,
  selector
}
