import { VLMEnvironment } from '../environment'
import { UserData, getUserData } from '~system/UserIdentity'
import { VLMSession } from '../components/VLMSession.component'
import { VLMNotificationManager } from './VLMNotification.logic'
import { signedFetch } from '~system/SignedFetch'
import {
  EnvironmentRealm,
  getCurrentRealm,
  getPlatform,
} from '~system/EnvironmentApi'
import { getSceneInformation } from '~system/Runtime'
import { ColyseusClient, ColyseusRoom } from '../shared/interfaces'
import { VLMDebug } from './VLMDebug.logic'

export abstract class VLMSessionManager {
  static dclUserData: UserData
  static sessionUser: VLMSession.User
  static sessionData: VLMSession.Config
  static client: ColyseusClient
  static playerPathId?: string
  static sceneRoom: ColyseusRoom
  static platformData: PlatformData = {}
  static connected: boolean
  static connecting: boolean

  static start: CallableFunction = async (version: string) => {
    try {
      await this.getPlatformData(version)
      if (!this.platformData?.sceneId) {
        return {}
      }
      const { session, user } = await this.requestToken()
      this.sessionData = session
      this.sessionUser = user

      if (this.sessionData) {
        this.sceneRoom = await this.joinRelayRoom(this.sessionData)
      }
      return { sceneRoom: this.sceneRoom, sessionData: this.sessionData }
    } catch (error) {
      VLMDebug.log('VLM CONNECTION ERROR! :', error, this.sceneRoom)
      throw error
    }
  }

  static end: CallableFunction = async () => {
    if (this.sceneRoom) {
      this.sceneRoom.send('session_end', {
        session: this.sessionData,
      })
      this.sceneRoom.leave(true)
    }
  }

  static requestToken: CallableFunction = async () => {
    let body = JSON.stringify({
      ...this.platformData,
    })

    try {
      let res = await signedFetch({
        url: `${VLMEnvironment.apiUrl}/auth/decentraland`,
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body,
        },
      })
      let json
      if (res.body) {
        json = JSON.parse(res.body)
      }
      return json
    } catch (error) {
      VLMNotificationManager.addMessage(
        'There was a problem loading this scene...please try to refresh. An error has been logged.',
      )
      throw error
    }
  }

  static joinRelayRoom: CallableFunction = async (
    session?: VLMSession.Config,
  ) => {
    try {
      this.client = new ColyseusClient(VLMEnvironment.wssUrl)
      VLMDebug.log('Connecting...', this.client)
      const sceneRoom = await this.client.joinOrCreate('vlm_scene', {
        ...this.platformData,
        ...session,
      })

      VLMDebug.log('Connected!', sceneRoom)
      VLMDebug.log('Session Data', this.sessionData)

      if (sceneRoom) {
        this.sceneRoom = sceneRoom
        this.connected = true
        this.connecting = false
      }

      return sceneRoom
    } catch (error) {
      VLMNotificationManager.addMessage(
        'Virtual Land Manager could not load the scene...please try to refresh. An error has been logged.',
      )
      throw error
    }
  }

  static reconnect: CallableFunction = () => {
    try {
      this.connected = false
    } catch (error) {
      throw error
    }
  }

  static getPlatformData: CallableFunction = async (packageVersion: string) => {
    try {
      let [userData, sceneInfo, platformInfo, realmInfo] = await Promise.all([
        getUserData({}),
        getSceneInformation({}),
        getPlatform({}),
        getCurrentRealm({}),
      ])

      const sceneJsonData = JSON.parse(sceneInfo.metadataJson),
        baseParcel = sceneJsonData.scene.base,
        parcels = sceneJsonData.scene.parcels,
        sceneId = sceneJsonData?.vlm?.sceneId,
        user = userData.data
          ? (({ avatar, ...data }) => data)(userData.data)
          : {}

      const platformData = this.platformData
      platformData.world = 'decentraland'
      platformData.subPlatform = platformInfo.platform
      platformData.sceneJsonData = sceneJsonData
      platformData.baseParcel = baseParcel
      platformData.sceneId = sceneId
      platformData.user = user as UserData
      platformData.location = {
        world: 'decentraland',
        location: sceneJsonData?.display?.title,
        coordinates: baseParcel.split(','),
        parcels,
        realm: realmInfo.currentRealm,
        integrationData: { sdkVersion: sceneJsonData.runtimeVersion, packageVersion },
      }
      platformData.environment = VLMEnvironment.devMode ? 'dev' : 'prod'
      this.dclUserData = userData as UserData
      return { ...this.platformData, ...platformData }
    } catch (error) {
      throw error
    }
  }
}

export type VLMSceneJsonData = {
  vlm?: { sceneId?: string }
}

export type PlatformData = {
  user?: UserData
  baseParcel?: string
  sceneJsonData?: VLMSceneJsonData
  sceneId?: string
  subPlatform?: string
  world?: string
  environment?: string
  location?: {
    world: string
    location?: string
    coordinates?: string[] | number[]
    parcels?: string[]
    realm?: EnvironmentRealm
    integrationData?: IntegrationData
  }
}

export type IntegrationData = {
  sdkVersion?: string
  packageVersion?: string
}
