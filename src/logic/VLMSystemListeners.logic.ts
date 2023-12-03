import {
  onEnterSceneObservable,
  onLeaveSceneObservable,
  onPlayerDisconnectedObservable,
  onPlayerClickedObservable,
  onPlayerExpressionObservable,
  onProfileChanged,
  onEnterScene,
  onLeaveScene,
} from '@dcl/sdk/observables'
import {
  // VLMClaimEvent,
  VLMPathClientEvent,
  VLMPathServerEvent,
  VLMPlayerPosition,
  VLMSceneMessage,
  VLMSessionAction,
  VLMSessionEvent,
  VLMSettingsEvent,
  VLMSoundStateEvent,
  VLMUserMessage,
  VLMVideoStatusEvent,
  VLMWidgetInitEvent,
  VLMWitnessedAction,
} from '../components/VLMSystemEvents.component'
import { VLMEventManager } from './VLMSystemEvents.logic'
import { Room } from 'colyseus.js'
import { VLMSceneManager } from './VLMScene.logic'
import { VLMSession } from '../components/VLMSession.component'
import { getPlayerData, getPlayersInScene } from '~system/Players'
import { VLMPathManager } from './VLMPath.logic'
import { VLMNotificationManager, VLMSessionManager, VLMWidgetManager } from './index'
import { VLMVideo } from '../components/VLMVideo.component'
import { VLMSound } from '../components/VLMSound.component'
// import { VLMClaimPointManager } from './VLMClaimPoint.logic'
// import { VLMClaimPoint } from '../components'
import { VLMDebug } from './VLMDebug.logic'

export abstract class VLMEventListeners {
  static inboundMessageFunctions: { [uuid: string]: CallableFunction } = {}
  static sceneRoom: Room
  static sessionData: VLMSession.Config
  static sessionUser: VLMSession.User
  public static ignoreNextEmote: boolean = false

  static init: CallableFunction = () => {
    try {
      this.sceneRoom = VLMSessionManager.sceneRoom
      this.sessionData = VLMSessionManager.sessionData
      this.sessionUser = VLMSessionManager.sessionUser

      // onIdleStateChangedObservable.add(({ isIdle }) => {
      //   if (isIdle) {
      //     //IDLE
      //     VLMPathManager.idle = true;
      //     VLMEventManager.events.emit('VLMSessionAction', "Went Idle");
      //     VLMPathManager.startIdleSegment();
      //   } else {
      //     //ACTIVE
      //     const ent = new Entity();
      //     const delay = new VLMTimer.Delay(1000, () => {
      //       if (VLMPathManager.idle) {
      //         VLMPathManager.idle = false;
      //         VLMEventManager.events.emit('VLMSessionAction', "Became Active");
      //         VLMPathManager.startNewSegment();
      //       }
      //       engine.removeEntity(ent);
      //     });
      //     ent.addComponentOrReplace(delay);
      //     engine.addEntity(ent);
      //   }
      // });

      // onPointerLockedStateChange.add(({ locked }) => {
      //   if (locked) {
      //     VLMPathManager.engaged = true;
      //     VLMPathManager.startStationaryEngaged();
      //     VLMEventManager.events.emit('VLMSessionAction', "Engaged Cursor");
      //   } else {
      //     VLMPathManager.engaged = false;
      //     VLMPathManager.startStationaryDisengaged();
      //     VLMEventManager.events.emit('VLMSessionAction', "Disengaged Cursor");
      //   }
      // });

      onPlayerExpressionObservable.add(({ expressionId }) => {
        if (this.ignoreNextEmote) {
          this.ignoreNextEmote = false
          VLMDebug.log(`TRACKED ACTION - Emote Ignored - ${expressionId}`)
          return
        } else {
          VLMDebug.log(`TRACKED ACTION - Emote triggered - ${expressionId}`)
          VLMEventManager.events.emit('VLMSessionAction', 'Emote Used', { emote: expressionId })
          VLMEventManager.events.emit('VLMEmoteAction', expressionId)
        }
      })

      onPlayerClickedObservable.add((clickEvent) => {
        VLMEventManager.events.emit('VLMSessionAction', 'Viewed A User Profile', clickEvent)

        VLMDebug.log('session', 'TRACKED ACTION - Viewed A User Profile', clickEvent.userId)
      })

      // onPlayerConnectedObservable.add(async ({ userId }) => {
      //   if (VLMPathManager.engaged || VLMPathManager.moving) {
      //     let user = await getPlayerData({ userId });
      //     let otherPlayers = await getPlayersInScene();
      //     VLMDebug.log("SESSION ACTION: Witnessed Connection", userId);
      //     VLMEventManager.events.emit(new VLMWitnessedAction(`Witnessed ${user?.displayName || "Someone"} Connect`, { userId, otherPlayers }));
      //   }
      // });

      // onPlayerDisconnectedObservable.add(async ({ userId }) => {
      //   if (VLMPathManager.engaged || VLMPathManager.moving) {
      //     let otherPlayers = await getPlayersInScene();
      //     let user = await getPlayerData({ userId });
      //     VLMDebug.log("SESSION ACTION: Witnessed Disconnection", userId);
      //     VLMEventManager.events.emit(new VLMWitnessedAction(`Witnessed ${user?.displayName || "Someone"} Disconnect`, { userId, otherPlayers }));
      //   }
      // });

      onEnterSceneObservable.add(async ({ userId }) => {
        if (!this.sessionUser?.connectedWallet) {
          return
        }
        let otherPlayers = await getPlayersInScene({})
        if (userId == this.sessionUser?.connectedWallet) {
          VLMDebug.log('SESSION ACTION: Player Entered Scene Boundaries', userId)
          VLMEventManager.events.emit('VLMSessionAction', 'Player Entered Scene Boundaries', { userId, otherPlayers })
        } else if (VLMPathManager.moving || VLMPathManager.engaged) {
          VLMDebug.log('SESSION ACTION: Witnessed Player Enter Scene Boundaries', userId)
          let user = await getPlayerData({ userId })
          VLMEventManager.events.emit('VLMSessionAction', `Witnessed Scene Entry`, {
            userId,
            otherPlayers,
            witness: this.sessionUser.connectedWallet,
          })
        }
      })

      onLeaveSceneObservable.add(async ({ userId }) => {
        if (!this.sessionUser?.connectedWallet) {
          return
        }
        let otherPlayers = await getPlayersInScene({})
        if (userId == this.sessionUser?.connectedWallet) {
          VLMEventManager.events.emit('VLMSessionAction', 'Left Scene Boundaries', { userId, otherPlayers })
        } else if (VLMPathManager.moving || VLMPathManager.engaged) {
          let user = await getPlayerData({ userId })
          VLMEventManager.events.emit('VLMSessionAction', `Witnessed Scene Departure`, {
            userId,
            otherPlayers,
            witness: this.sessionUser.connectedWallet,
          })
        }
      })

      VLMEventManager.events.on('VLMSettingsEvent', (message: VLMSettingsEvent) => {
        // VLMModerationManager.updateSettings(message.settingData.settingValue);
      })

      // VLMEventManager.events.on('VLMClaimEvent', (message: VLMClaimEvent) => {
      //   VLMDebug.log('GIVEAWAY CLAIM - ', message)
      //   if (message.action == 'giveaway_claim') {
      //     this.sceneRoom.send('giveaway_claim', { ...message, sessionToken: this.sessionData?.sessionToken, sceneId: this.sessionData?.sceneId })
      //   } else if (message.action == 'giveaway_claim_response') {
      //     const claimPoint = VLMClaimPoint.configs[message.sk]
      //     VLMDebug.log(claimPoint)
      //     if (claimPoint) {
      //       claimPoint.requestInProgress = false
      //       VLMClaimPointManager.showMessage(message)
      //     }
      //   }
      // })

      VLMEventManager.events.on('VLMSessionAction', (action: string, metadata: unknown) => {
        if (this.sessionData?.sessionToken) {
          let pathPoint = VLMPathManager.getPathPoint()
          this.sceneRoom.send('session_action', { action, metadata, pathPoint, sessionToken: this.sessionData?.sessionToken })
          VLMDebug.log('LOGGED ANALYTICS ACTION - ', action, pathPoint, metadata)
        }
      })

      VLMEventManager.events.on('VLMSoundStateEvent', ({ elementData, userId }: VLMSoundStateEvent) => {
        const id = elementData.sk
        VLMDebug.log(id, VLMSound.configs[id])
        VLMDebug.log('SOUND STATE CHANGED', userId, this.sessionUser.sk)
        if (userId == this.sessionUser.sk) {
          VLMSound.configs[id].toggleLocators()
        }
      })

      VLMEventManager.events.on('VLMPathClientEvent', (message: VLMPathClientEvent) => {
        VLMDebug.log('Triggered client path event', message)

        switch (message.action) {
          case 'path_start':
            this.sceneRoom.send('path_start', { session: this.sessionData })
            break
          case 'path_segments_add':
            this.sceneRoom.send('path_segments_add', message)
            break
        }
      })

      VLMEventManager.events.on('VLMPathServerEvent', (message: VLMPathServerEvent) => {
        switch (message.action) {
          case 'path_started':
            const pathIds = this.sessionData.paths
            if (message.pathId && pathIds && pathIds.indexOf(message.pathId) < 0) {
              pathIds.push(message.pathId)
            }
            VLMPathManager.startPath(message)
            break
          case 'path_segments_added':
            VLMPathManager.trimStoredSegments(message)
            break
        }
      })

      VLMEventManager.events.on('VLMSceneMessage', (message: VLMSceneMessage) => {
        VLMDebug.log('event', 'SCENE MESSAGE RECEIVED', message)
        switch (message.action) {
          case 'init':
            VLMSceneManager.initScenePreset(message)
            VLMDebug.log('SCENE INIT', message)
            break
          case 'create':
            VLMSceneManager.createSceneElement(message)
            break
          case 'update':
            VLMSceneManager.updateSceneElement(message)
            break
          case 'delete':
            VLMSceneManager.deleteSceneElement(message)
            break
        }
      })

      VLMEventManager.events.on('VLMVideoStatusEvent', (message: VLMVideoStatusEvent) => {
        const videoId = message?.sk
        if (!videoId) {
          VLMDebug.log('error', 'VIDEO STATE CHANGED - NO VIDEO ID', message)
          return
        }

        const videoConfig = VLMVideo.configs[videoId]

        if (videoConfig?.liveSrc == message.url) {
          VLMDebug.log('VIDEO STATE CHANGED', message)
          videoConfig.setLiveState(message.status)
        } else if (videoConfig) {
          this.sceneRoom.send('scene_video_update', { ...message, reason: 'url_changed' })
        }
      })

      VLMEventManager.events.on('VLMWidgetInitEvent', async (initEvent: VLMWidgetInitEvent) => {
        await VLMWidgetManager.configureWidgets(initEvent.configs)
      })

      this.sceneRoom.onLeave(() => {
        VLMPathManager.endPath()
      })

      this.sceneRoom.onMessage('session_started', (message: VLMSessionEvent) => {
        VLMDebug.log(message)
        this.sessionData = message.session
        this.sessionUser = message.user
        VLMSessionManager.sessionData = message.session
        VLMSessionManager.sessionUser = message.user
        if (!this.sessionData?.sessionStart) {
          this.sessionData.sessionStart = Date.now()
        }
        new VLMPathManager()
      })

      this.sceneRoom.onMessage('user_message', (message: VLMUserMessage) => {
        VLMEventManager.events.emit('VLMUserMessage', message)
      })

      VLMEventManager.events.on('VLMUserMessage', async (message: VLMUserMessage) => {
        if (message?.type == 'inbound') {
          VLMDebug.log('event', 'MESSAGE RECEIVED FROM USER', message)
          this.inboundMessageFunctions[message.id]?.(message.data)
        } else if (message?.type == 'outbound') {
          this.sceneRoom.send('user_message', message)
        } else if (message?.type == 'getState') {
          this.sceneRoom.send('get_user_state', message)
        } else if (message?.type == 'setState') {
          this.sceneRoom.send('set_user_state', message)
        }
      })

      this.sceneRoom.onMessage('path_segments_added', (message: VLMPathServerEvent) => {
        VLMEventManager.events.emit('VLMPathServerEvent', message)
      })

      this.sceneRoom.onMessage('path_started', (message: VLMPathServerEvent) => {
        VLMEventManager.events.emit('VLMPathServerEvent', message)
      })

      this.sceneRoom.onMessage('scene_sound_locator', (message: VLMSoundStateEvent) => {
        VLMEventManager.events.emit('VLMSoundStateEvent', message)
      })

      this.sceneRoom.onMessage('show_sound_locators', (message: VLMSoundStateEvent) => {
        VLMEventManager.events.emit('VLMSoundStateEvent', message)
      })

      this.sceneRoom.onMessage('scene_preset_update', (message: VLMSceneMessage) => {
        VLMDebug.log('event', 'Scene Preset Updated!', message)
        if (message.action) {
          VLMEventManager.events.emit('VLMSceneMessage', message)
        }
      })

      this.sceneRoom.onMessage('scene_moderator_message', (config: { message: string; color: string; fontSize: number; delay: number }) => {
        VLMNotificationManager.addMessage(config.message, { ...config })
      })

      this.sceneRoom.onMessage('scene_moderator_crash', (user: { connectedWallet: string; displayName: string }) => {
        VLMDebug.log('moderation', 'Crashing user', user)
        // VLMModerationManager.setCrashUser(user);
      })

      this.sceneRoom.onMessage('scene_video_status', (message: VLMVideoStatusEvent) => {
        VLMDebug.log('event', 'Video State Changed!', message)
        VLMEventManager.events.emit('VLMVideoStatusEvent', message)
      })

      this.sceneRoom.onMessage('scene_setting_update', (message: VLMSettingsEvent) => {
        VLMDebug.log('event', 'Scene Setting Updated!', message)
        VLMEventManager.events.emit('VLMSettingsEvent', message)
      })

      // this.sceneRoom.onMessage('giveaway_claim_response', (message: VLMClaimEvent) => {
      //   VLMDebug.log('event', 'Claim response received', message)
      //   VLMEventManager.events.emit('VLMClaimEvent', { ...message, action: 'giveaway_claim_response' })
      // })

      this.sceneRoom.onMessage('request_player_position', (message: VLMPlayerPosition) => {
        VLMDebug.log('event', 'Player Position Requested', message)
        this.sceneRoom.send('send_player_position', { positionData: VLMPathManager.getPathPoint(), userId: this.sessionUser?.sk })
      })

      this.sceneRoom.send('session_start', this.sessionData)
    } catch (e) {
      VLMDebug.log('error', 'ERROR REGISTERING EVENT LISTENERS', e)
      throw e
    }
  }

  static sendMessage: CallableFunction = (id: string, data: boolean | string | number | Object | Array<unknown>) => {
    VLMEventManager.events.emit('VLMUserMessage', { id, data, type: 'outbound' })
  }

  static onMessage: CallableFunction = (id: string, callback: CallableFunction) => {
    VLMEventManager.events.emit('VLMUserMessage', { id, data: callback, type: 'inbound' })
  }

  static setState: CallableFunction = (id: string, data: boolean | string | number | Object | Array<unknown>) => {
    VLMEventManager.events.emit('VLMUserMessage', { id, data, type: 'setState' })
  }

  static getState: CallableFunction = (id: string, data: boolean | string | number | Object | Array<unknown>) => {
    VLMEventManager.events.emit('VLMUserMessage', { id, data, type: 'getState' })
  }

  static recordAction: CallableFunction = (id: string, data: boolean | string | number | Object | Array<unknown>) => {
    VLMEventManager.events.emit('VLMSessionAction', id, data)
  }
}
