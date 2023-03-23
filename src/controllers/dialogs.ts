// TODO: Add Dialog Bubbles
export abstract class VLMDialogs {
  static init: CallableFunction = (dialogs: Array<any>) => {
    if (!dialogs) {
      return;
    }
  };

  static create: CallableFunction = (dialog: any) => {};

  static update: CallableFunction = (
    dialogs: Array<any>,
    property: string,
    id: string
  ) => {};

  static delete: CallableFunction = (id: string) => {};
}
