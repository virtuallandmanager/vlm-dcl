import { VLMClaimPoint } from '../components/VLMClaimPoint.component'
import { VLMNotificationManager } from './VLMNotification.logic'
import { VLMDebug } from './VLMDebug.logic'

export abstract class VLMClaimPointManager {
  static init: CallableFunction = (claimPoints: VLMClaimPoint.VLMConfig[]) => {
    try {
      if (!claimPoints?.length) {
        return
      }
      claimPoints.forEach((claimPoint: VLMClaimPoint.VLMConfig) => {
        this.create(claimPoint)
      })
    } catch (error) {
      throw error
    }
  }

  static create: CallableFunction = (config: VLMClaimPoint.VLMConfig) => {
    try {
      new VLMClaimPoint.Config(config)
    } catch (error) {
      throw error
    }
  }

  static createInstance: CallableFunction = (config: VLMClaimPoint.VLMConfig, instance: VLMClaimPoint.Instance) => {
    try {
      if (!config.enabled || !instance.enabled) {
        return
      }
      const claimPointId = config.sk
      VLMClaimPoint.configs[claimPointId].createOrReplaceInstance(instance)
    } catch (error) {
      throw error
    }
  }

  static update: CallableFunction = (config: VLMClaimPoint.VLMConfig | any, property: string, id: string) => {
    try {
      const storedConfig: VLMClaimPoint.Config = VLMClaimPoint.configs[config.sk || id]

      if (!config || (!storedConfig && !config.enabled)) {
        return
      } else if (!storedConfig && config.enabled) {
        this.create(config)
        return
      }

      switch (property) {
        case 'enabled':
          storedConfig.enabled = config.enabled
          if (!config.enabled) {
            this.remove(config.sk)
          } else if (!storedConfig) {
            this.add(config.sk)
          }
        default:
          storedConfig.init(config)
      }
    } catch (error) {
      throw error
    }
  }

  static updateInstance: CallableFunction = (instanceConfig: VLMClaimPoint.Instance, property: string, id: string) => {
    try {
      const instance = VLMClaimPoint.instances[instanceConfig.sk],
        configId = instance.configId,
        config = VLMClaimPoint.configs[configId]

      if (!config) {
        VLMDebug.log(
          'error',
          `ERROR! - Config not found for instance ${instanceConfig.sk} -\n
        Please send us this error via Discord or by sending an email to support@vlm.gg`,
          '{ Instance config, property, id:',
          instanceConfig,
          property,
          id,
          '}',
        )
        return
      }

      const { position, scale, rotation } = instanceConfig

      switch (property) {
        case 'enabled':
          if (!config.enabled || !instanceConfig.enabled) {
            config.removeInstance(instanceConfig)
          } else if (instance && instanceConfig.enabled) {
            config.createOrReplaceInstance(instanceConfig)
          }
          break
        case 'transform':
          instance.updateTransform(position, scale, rotation)
          break
        default:
          instance.init(config, instanceConfig)
      }
    } catch (error) {
      throw error
    }
  }

  static showMessage: CallableFunction = (response: VLMClaimPoint.ClaimResponse) => {
    if (!VLMNotificationManager.initialized) {
      VLMNotificationManager.init()
    }
    VLMDebug.log('info', 'VLMClaimPointManager.showMessage', response)

    const claimPoint = VLMClaimPoint.configs[response.sk],
      messageOptions = claimPoint.messageOptions || null,
      messages = claimPoint.messages
      
    if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_ACCEPTED) {
      VLMNotificationManager.addMessage(messages.successfulClaim, messageOptions)
    } else if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_SERVER_ERROR) {
      VLMNotificationManager.addMessage(messages.errorMessage, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.BEFORE_EVENT_START) {
      VLMNotificationManager.addMessage(messages.beforeEventTime, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.AFTER_EVENT_END) {
      VLMNotificationManager.addMessage(messages.afterEventTime, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.EXISTING_WALLET_CLAIM) {
      VLMNotificationManager.addMessage(messages.existingClaim, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.CLAIM_COMPLETE) {
      VLMNotificationManager.addMessage(messages.claimComplete, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_IP_LIMIT) {
      VLMNotificationManager.addMessage(messages.ipLimitReached, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.SUPPLY_DEPLETED) {
      VLMNotificationManager.addMessage(messages.noSupply, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.INAUTHENTIC) {
      VLMNotificationManager.addMessage(messages.inauthenticConnection, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.NO_LINKED_EVENTS) {
      VLMNotificationManager.addMessage(messages.noLinkedEvents, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.PAUSED) {
      VLMNotificationManager.addMessage(messages.paused, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_DAILY_LIMIT) {
      VLMNotificationManager.addMessage(messages.dailyLimitReached, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_WEEKLY_LIMIT) {
      VLMNotificationManager.addMessage(messages.otherLimitReached, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_MONTHLY_LIMIT) {
      VLMNotificationManager.addMessage(messages.otherLimitReached, messageOptions)
    } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_YEARLY_LIMIT) {
      VLMNotificationManager.addMessage(messages.otherLimitReached, messageOptions)
    } else if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_DENIED) {
      VLMNotificationManager.addMessage(messages.claimDenied, messageOptions)
    }
  }

  static add: CallableFunction = (id: string) => {
    VLMClaimPoint.configs[id].addAll()
  }

  static delete: CallableFunction = (id: string) => {
    VLMClaimPoint.configs[id].delete()
  }

  static remove: CallableFunction = (id: string) => {
    VLMClaimPoint.configs[id].remove()
  }

  static removeInstance: CallableFunction = (instanceId: string) => {
    VLMClaimPoint.instances[instanceId].remove()
  }

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const instance = VLMClaimPoint.instances[instanceId]
    const configId = instance?.configId

    if (configId) {
      VLMClaimPoint.configs[configId].deleteInstance(instanceId)
    }
  }
}
