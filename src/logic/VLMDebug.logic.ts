export class VLMDebug {
  public static debug: boolean = false
  public static scope: { events: boolean; moderation: boolean; path: boolean; session: boolean; videos: boolean; widgets: boolean } = {
    events: false,
    moderation: false,
    path: false,
    session: false,
    videos: false,
    widgets: false,
  }

  static init = (debugConfig: boolean | string[]): void => {
    if (debugConfig) {
      this.debug = true
      return
    }

    if (Array.isArray(debugConfig)) {
      debugConfig.forEach((scope: string) => {
        switch (scope) {
          case 'events':
            this.scope.events = true
          case 'moderation':
            this.scope.moderation = true
          case 'path':
            this.scope.path = true
          case 'session':
            this.scope.session = true
          case 'videos':
            this.scope.videos = true
          case 'widgets':
            this.scope.widgets = true
          default:
        }
      })
    }
  }

  static log = (...args: any): void => {
    if (!this.debug) {
      return
    }
    switch (args[0]) {
      case 'path':
        this.logPath(...args.filter((arg: any, index: number) => index !== 0))
        break
      case 'session':
        this.logSessionInfo(...args.filter((arg: any, index: number) => index !== 0))
        break
      case 'event':
        this.logEvent(...args.filter((arg: any, index: number) => index !== 0))
        break
      case 'info':
        this.logInfo(...args.filter((arg: any, index: number) => index !== 0))
        break
      case 'playlist':
        this.logPlaylistInfo(...args.filter((arg: any, index: number) => index !== 0))
        break
      case 'video':
        this.logVideoInfo(...args.filter((arg: any, index: number) => index !== 0))
        break
      case 'moderation':
        this.logModeration(...args.filter((arg: any, index: number) => index !== 0))
        break
      case 'widget':
        this.logWidgetInfo(...args.filter((arg: any, index: number) => index !== 0))
        break
      case 'error':
        this.logError(...args.filter((arg: any, index: number) => index !== 0))
        break
      default:
        this.logInfo(...args)
        break
    }
  }

  static logInfo = (...args: any): void => {
    if (this.debug) {
      console.log('VLM - ', ...args)
    }
  }

  static logWidgetInfo = (...args: any): void => {
    if (this.debug && this.scope.widgets) {
      console.log('VLM - WIDGET - ', ...args)
    }
  }

  static logPlaylistInfo = (...args: any): void => {
    console.log('VLM - PLAYLIST - ', ...args, this.debug, this.scope)
    if (this.debug && this.scope.videos) {
      console.log('VLM - PLAYLIST - ', ...args)
    }
  }

  static logVideoInfo = (...args: any): void => {
    console.log('VLM - VIDEO - ', ...args)
    if (this.debug && this.scope.videos) {
      console.log('VLM - VIDEO - ', ...args)
    }
  }

  static logModeration = (...args: any): void => {
    if (this.debug && this.scope.moderation) {
      console.log('VLM - MODERATION - ', ...args)
    }
  }

  static logSessionInfo = (...args: any): void => {
    if (this.debug && this.scope.session) {
      console.log('VLM - SESSION - ', ...args)
    }
  }

  static logPath = (...args: any): void => {
    if (this.debug && this.scope.path) {
      console.log('VLM - PATH - ', ...args)
    }
  }

  static logError = (...args: any): void => {
    if (this.debug) {
      console.log('VLM - ERROR - ', ...args)
    }
  }

  static logEvent = (...args: any): void => {
    if (this.debug && this.scope.events) {
      console.log('VLM - EVENT - ', ...args)
    }
  }
}
