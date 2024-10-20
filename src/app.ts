import { UserData } from '~system/UserIdentity'
import { VLMEnvironment, VLMInitConfig } from './environment'
import { VLMSessionManager } from './logic/VLMSession.logic'
import { VLMEventListeners } from './logic/VLMSystemListeners.logic'
import { VLMLogManager } from './logic/VLMLogging'
import { VLMWidgetManager } from './logic/VLMWidget.logic'
import { VLMEventManager } from './logic/VLMSystemEvents.logic'
import { VLMWidget } from './components/VLMWidget.component'
import { VLMVideo } from './components/VLMVideo.component'
import { VLMImage } from './components/VLMImage.component'
import { VLMSound } from './components/VLMSound.component'
import { VLMMesh } from './components/VLMMesh.component'
import { configurePaths } from './shared/paths'
import { VLMDebug } from './logic/VLMDebug.logic'
import { AutoDanceService } from './services/AutoDance.service'
import { ReactEcsRenderer, UIMode, UIService } from './services/UI.service'
import { VLMClaimPoint } from './components'

/**
 * The main entry point for the VLM library.
 * @public
 */
export abstract class VLM {
  public static version: string = __VERSION__

  public static activeServer: string

  public static user: UserData

  public static defaultConfig: VLMInitConfig = { env: 'prod', uiMode: UIMode.AUTO, modelFolder: 'models', soundFolder: 'sounds' }
  
  /**
   * Initializes the VLM library with the given configuration.
   * @param config - The VLM initialization options.
   * @public
   */
  public static init: CallableFunction = async (config: VLMInitConfig) => {
    return new Promise(async (resolve, reject) => {
      try {
        config = { ...this.defaultConfig, ...config }

        configurePaths({ modelFolder: config?.modelFolder, soundFolder: config?.soundFolder })

        VLMEventManager.events.on('VLMSceneInitEvent', () => {
          resolve(VLM.storage)
        })

        if (config?.widgets) {
          await VLMWidgetManager.configureWidgets(config.widgets)
        }

        if (!ReactEcsRenderer.rendererSet && config.uiMode !== UIMode.SCENE) {
          ReactEcsRenderer.setUiRenderer()
        }

        await VLMEnvironment.init(config)

        const session = await VLMSessionManager.start(VLM.version)

        if (!session?.sceneRoom) {
          VLMDebug.log('INIT ERROR: Failed to connect to the scene server. This may be due to a missing sceneId in the scene.json file.')
          resolve({ error: 'Failed to connect to the scene server. This may be due to a missing sceneId in the scene.json file.' })
          return
        }

        await VLMEventListeners.init()
      } catch (error) {
        VLMLogManager.logError(error, { ...config, message: 'VLM INIT ERROR', version: VLM.version, env: config?.env || 'prod' })
        reject(error)
      }
    })
  }

  public static configureWidgets: CallableFunction = async (options: VLMWidget.Config[]) => {
    return VLMWidgetManager.configureWidgets(options)
  }

  public static configureEcs: CallableFunction = async (ecs: any, ui: any) => {
    return VLMEnvironment.configureEcs(ecs, ui)
  }

  public static sendMessage: CallableFunction = async (id: string, data?: unknown) => {
    VLMEventListeners.sendMessage(id, data)
  }

  public static onMessage: CallableFunction = async (id: string, callback: CallableFunction) => {
    VLMEventListeners.onMessage(id, callback)
  }

  public static setState: CallableFunction = async (id: string, value: CallableFunction) => {
    VLMEventListeners.setState(id, value)
  }

  public static getState: CallableFunction = async (id: string) => {
    VLMEventListeners.getState(id)
  }

  public static recordAction: CallableFunction = async (id: string, data?: unknown) => {
    VLMEventListeners.recordAction(id, data)
  }

  public static setClaimFunctions: CallableFunction = async (
    customId: string,
    claimFunctions: VLMClaimPoint.Config[],
    options: { disableDefaults: boolean },
  ) => {
    return VLMClaimPoint.setClaimFunctions(customId, claimFunctions, options)
  }

  public static Storage: VLMStorage = {
    videos: {
      configs: VLMVideo.configs,
      instances: VLMVideo.instances,
    },
    images: {
      configs: VLMImage.configs,
      instances: VLMImage.instances,
    },
    models: {
      configs: VLMMesh.configs,
      instances: VLMMesh.instances,
    },
    sounds: {
      configs: VLMSound.configs,
      instances: VLMSound.instances,
    },
    claimPoints: {
      configs: VLMClaimPoint.configs,
      instances: VLMClaimPoint.instances,
    },
    widgets: {
      configs: VLMWidget.configs,
    },
  }

  public static storage = this.Storage

  public static toggleAutoDance = AutoDanceService.toggleGlobalAutoDance

  public static UI = () => UIService.internalComponents()
}

export type VLMStorage = {
  videos: {
    configs: { [customId: string]: VLMVideo.Config }
    instances: { [customId: string]: VLMVideo.Instance }
    // systems: { [customId: string]: VLMVideo.VLMVideoPlaylistSystem }
  }
  images: {
    configs: { [customId: string]: VLMImage.Config }
    instances: { [customId: string]: VLMImage.Instance }
  }
  models: {
    configs: { [customId: string]: VLMMesh.Config }
    instances: { [customId: string]: VLMMesh.Instance }
  }
  sounds: {
    configs: { [customId: string]: VLMSound.Config }
    instances: { [customId: string]: VLMSound.Instance }
    // systems: { [customId: string]: VLMSound.DCLSoundSystem }
  }
  claimPoints: {
    configs: { [customId: string]: VLMClaimPoint.Config }
    instances: { [customId: string]: VLMClaimPoint.Instance }
  }
  widgets: {
    configs: { [customId: string]: VLMWidget.Config }
  }
}
