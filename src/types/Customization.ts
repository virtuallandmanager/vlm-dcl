export type TCustomizationFunctions = {
  [id: string]: TCustomizationFunction;
};

export type TCustomizationFunction = {
  init?: () => void | Promise<void>;
  update?: (customization: TCustomization) => void | Promise<void>;
};

export enum ECustomizationType {
  toggle,
  text,
  selector
}

export type TCustomization = {
  id: string;
  type: ECustomizationType;
  value: boolean | string | number;
};
