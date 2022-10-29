export type TDialogConfig = {
  enabled: boolean;
  dialogType: EDialogType;
  messages: string[];
}

export enum EDialogType {
  WELCOME,
  POSITIONED
}