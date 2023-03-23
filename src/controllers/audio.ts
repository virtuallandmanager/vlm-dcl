export abstract class VLMAudioStreams {
  static create: CallableFunction = (audioStreams: Array<any>) => {
    if (!audioStreams) {
      return;
    }
  };

  static update: CallableFunction = (
    audioStreams: Array<any>,
    property: string,
    id: string
  ) => {};

  static delete: CallableFunction = (id: string) => {};
}
