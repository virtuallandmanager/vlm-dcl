import { VLMSceneMessage } from '../components/VLMSystemEvents.component'
import { VLMImage } from '../components/VLMImage.component'
// import { VLMClaimPoint } from "../components/VLMClaimPoint.component";
import { VLMSound } from '../components/VLMSound.component'
import { VLMVideo } from '../components/VLMVideo.component'
import { VLMImageManager } from './VLMImage.logic'
import { VLMVideoManager } from './VLMVideo.logic'
import { VLMSoundManager } from './VLMSound.logic'
import { VLMWidgetManager } from './VLMWidget.logic'
import { VLMScene } from '../components/VLMScene.component'
import { VLMEventManager } from './VLMSystemEvents.logic'
// import { VLMClaimPointManager } from "./VLMClaimPoint.logic";
import { VLMMeshManager } from './VLMMesh.logic'
import { VLMMesh } from '../components/VLMMesh.component'
import { VLMDebug } from './VLMDebug.logic'

export type VLMSceneElement = VLMImage.VLMConfig | VLMSound.VLMConfig | VLMVideo.VLMConfig | VLMMesh.VLMConfig
//| VLMClaimPoint.VLMConfig;
export type VLMSceneElementInstance = VLMImage.Instance | VLMSound.Instance | VLMVideo.Instance | VLMMesh.Instance
export abstract class VLMSceneManager {
  static sceneId: string
  static store: { [uuid: string]: VLMSceneElement } = {}
  static scenePreset?: VLMScene.Preset

  static initScenePreset: CallableFunction = (message: VLMSceneMessage) => {
    try {
      VLMDebug.log('Initializing Scene', message)
      const scenePreset = message.scenePreset
      const sceneSettings = message.sceneSettings
      if (!scenePreset) {
        return
      }
      VLMMeshManager.init(scenePreset.models)
      VLMImageManager.init(scenePreset.images)
      VLMVideoManager.init(scenePreset.videos)
      VLMSoundManager.init(scenePreset.sounds)
      // VLMClaimPointManager.init(scenePreset.claimPoints);

      if (scenePreset?.widgets?.length) {
        // set initial widget states
        VLMWidgetManager.setState(scenePreset.widgets)
        VLMWidgetManager.init(scenePreset.widgets)
      }

      if (sceneSettings?.moderation) {
        VLMDebug.log('Moderation Settings', sceneSettings.moderation)
        this.updateSceneSetting({ setting: 'moderation', settingData: sceneSettings.moderation })
      }

      VLMEventManager.events.emit('VLMSceneInitEvent')
    } catch (error) {
      throw error
    }
  }

  static changeScenePreset: CallableFunction = (message: VLMSceneMessage) => {
    VLMMesh.reset()
    VLMImage.reset()
    VLMVideo.reset()
    VLMSound.reset()
    // VLMClaimPoint.reset()
    // VLMWidgetManager.reset()
    this.initScenePreset(message)
  }

  static updateScenePreset: CallableFunction = (message: VLMSceneMessage) => {
    this.scenePreset = message?.scenePreset
  }

  static createSceneElement: CallableFunction = (message: VLMSceneMessage) => {
    try {
      if (message.instance) {
        return this.createSceneElementInstance(message)
      }
      switch (message.element) {
        case 'image':
          VLMImageManager.create(message.elementData)
          break
        case 'video':
          VLMVideoManager.create(message.elementData)
          break
        case 'model':
          VLMMeshManager.create(message.elementData)
          break
        case 'sound':
          VLMSoundManager.create(message.elementData)
          break
        case 'widget':
          VLMWidgetManager.create(message.elementData)
          break
        case 'claimpoint':
          // VLMClaimPointManager.create(message.elementData);
          break
      }
    } catch (error) {
      throw error
    }
  }

  static createSceneElementInstance: CallableFunction = (message: VLMSceneMessage) => {
    try {
      switch (message.element) {
        case 'image':
          VLMImageManager.createInstance(message.elementData, message.instanceData)
          break
        case 'model':
          VLMMeshManager.createInstance(message.elementData, message.instanceData)
          break
        case 'video':
          VLMVideoManager.createInstance(message.elementData, message.instanceData)
          break
        case 'sound':
          VLMSoundManager.createInstance(message.elementData, message.instanceData)
          break
      }
    } catch (error) {
      throw error
    }
  }

  static updateSceneElement: CallableFunction = (message: VLMSceneMessage) => {
    try {
      if (message.instance) {
        return this.updateSceneElementInstance(message)
      } else if (message.setting) {
        return this.updateSceneSetting(message)
      }
      switch (message.element) {
        case 'image':
          VLMImageManager.update(message.elementData, message.property, message.id)
          break
        case 'video':
          VLMVideoManager.update(message.elementData, message.property, message.id)
          break
        case 'sound':
          VLMSoundManager.update(message.elementData, message.property, message.id)
          break
        case 'model':
          VLMMeshManager.update(message.elementData, message.property, message.id)
          break
        case 'widget':
          VLMWidgetManager.update(message.elementData, message.user)
          break
        case 'claimpoint':
          // VLMClaimPointManager.update(message.elementData, message.property, message.id);
          break
      }
    } catch (error) {
      throw error
    }
  }

  static updateSceneSetting: CallableFunction = (message: VLMSceneMessage) => {
    try {
      if (!message?.settingData) return
      switch (message.setting) {
        case 'localization':
          // TODO: add localization code
          break
        case 'moderation':
          // VLMModerationManager.updateSettings(message.settingData.settingValue);
          break
      }
    } catch (error) {
      throw error
    }
  }

  static updateSceneElementInstance: CallableFunction = (message: VLMSceneMessage) => {
    try {
      switch (message.element) {
        case 'image':
          VLMImageManager.updateInstance(message.instanceData, message.property, message.id)
          break
        case 'model':
          VLMMeshManager.updateInstance(message.instanceData, message.property, message.id)
          break
        case 'video':
          VLMVideoManager.updateInstance(message.instanceData, message.property, message.id)
          break
        case 'sound':
          VLMSoundManager.updateInstance(message.instanceData, message.property, message.id)
          break
      }
    } catch (error) {
      throw error
    }
  }

  static deleteSceneElement: CallableFunction = (message: VLMSceneMessage) => {
    try {
      if (message.instance) {
        return this.deleteSceneElementInstance(message)
      }

      const id = message?.elementData?.sk || message.id
      switch (message.element) {
        case 'image':
          VLMImageManager.delete(id)
          break
        case 'video':
          VLMVideoManager.delete(id)
          break
        case 'model':
          VLMMeshManager.delete(id)
          break
        case 'sound':
          VLMSoundManager.delete(id)
          break
        case 'widget':
          VLMWidgetManager.delete(id)
          break
        case 'claimpoint':
          // VLMClaimPointManager.delete(id);
          break
      }
    } catch (error) {
      throw error
    }
  }

  static deleteSceneElementInstance: CallableFunction = (message: VLMSceneMessage) => {
    try {
      const id = message?.instanceData?.sk || message.id
      switch (message.element) {
        case 'image':
          VLMImageManager.deleteInstance(id)
          break
        case 'video':
          VLMVideoManager.deleteInstance(id)
        case 'model':
          VLMMeshManager.deleteInstance(id)
          break
        case 'sound':
          VLMSoundManager.deleteInstance(id)
          break
      }
    } catch (error) {
      throw error
    }
  }
}
