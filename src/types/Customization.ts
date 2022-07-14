export type TCustomizationFunctions = {
  create?: (customizations: TCustomization[]) => void | Promise<void>;
  update?: (customizations: TCustomization[], customizationId: string) => void | Promise<void>;
  remove?: (customizationId: string) => void | Promise<void>;
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
