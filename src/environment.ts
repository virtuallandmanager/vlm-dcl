import { isPreviewMode } from '~system/EnvironmentApi'
import { VLMWidget } from './components/VLMWidget.component'
import * as ecsLib from '@dcl/sdk/ecs'
import { VLMDebug } from './logic/VLMDebug.logic'

export let ecs: any

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
      }
      
      if (config.env !== 'prod' && !this.devMode) {
        config.env = 'prod'
      }

      if (config?.debug) {
        VLMDebug.init(config.debug)
      }

      if (config?.ecs) {
        ecs = config?.ecs
      } else {
        ecs = ecsLib
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
}

/**
 * Environment initialization options. Allow you to choose which server to connect to.
 * @public
 */
export type VLMInitConfig = {
  env: 'dev' | 'staging' | 'prod'
  widgets?: VLMWidget.Config[]
  modelFolder?: string
  soundFolder?: string
  debug?: boolean | string[]
  ecs?: any
}
