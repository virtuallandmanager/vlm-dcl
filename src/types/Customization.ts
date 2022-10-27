export type TCustomizationConfigs = {
  [id: string]: TCustomizationConfig;
};

export type TCustomizationConfig = {
  id: string;
  type?: ECustomizationType;
  value?: string | boolean;
  init?: any;
  update: any;
};

export enum ECustomizationType {
  toggle,
  text,
  selector
}
