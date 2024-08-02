import { isPreviewMode } from '~system/EnvironmentApi'
import { VLMWidget } from './components/VLMWidget.component'
import * as ecsLib from '@dcl/sdk/ecs'
import * as uiLib from '@dcl/sdk/react-ecs'
import { VLMDebug } from './logic/VLMDebug.logic'
import { UIMode } from './services/UI.service'

export let ecs: any = ecsLib
export let ui: any = uiLib

export abstract class VLMEnvironment {
  static devMode: boolean
  static debug: boolean = false
  private static wssUrls: { [env: string]: string } = {
    dev: 'ws://localhost:3010',
    staging: 'wss://staging-api.vlm.gg',
    prod: 'wss://api.vlm.gg',
  }

  private static apiUrls: { [env: string]: string } = {
    dev: 'http://localhost:3010',
    staging: 'https://staging-api.vlm.gg',
    prod: 'https://api.vlm.gg',
  }

  static apiUrl: string = 'https://api.vlm.gg'
  static wssUrl: string = 'wss://api.vlm.gg'

  static init: CallableFunction = async (config: VLMInitConfig) => {
    try {
      this.devMode = (await isPreviewMode({})).isPreview
      if (!config) {
        config = { env: 'prod' }
        VLMDebug.log('No config provided, defaulting to prod')
      }

      if (!config?.env || (config.env !== 'prod' && !this.devMode)) {
        config = { ...config, env: 'prod' }
      }

      if (config?.debug) {
        VLMDebug.init(config.debug)
      }

      if (config?.ecs) {
        ecs = config?.ecs
      }

      VLMDebug.log(`Initializing ${config.env} environment`)
      this.apiUrl = this.apiUrls[config.env]
      VLMDebug.log('HTTPS Server set to ' + this.apiUrl)
      this.wssUrl = this.wssUrls[config.env]
      VLMDebug.log('WebSocket Server set to ' + this.wssUrl)
    } catch (error) {
      throw error
    }
  }

  static configureEcs: CallableFunction = async (_ecs: any, _ui: any) => {
    ecs = _ecs || ecs
    ui = _ui || ui
  }
}

/**
 * Environment initialization options. Allow you to choose which server to connect to,
 * what folders are used in your project, and how the UI is set up.
 *
 * @public
 */
export type VLMInitConfig = {
  env: 'dev' | 'staging' | 'prod'
  widgets?: VLMWidget.Config[]
  modelFolder?: string
  soundFolder?: string
  debug?: boolean | string[]
  uiMode?: UIMode
  ecs?: any
}
