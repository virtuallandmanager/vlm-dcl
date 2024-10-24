import { VLMEventManager } from './VLMSystemEvents.logic';
import { VLMSceneManager } from './VLMScene.logic';
import { onEnterScene, onLeaveScene } from '@dcl/sdk/src/players';
import { VLMPathManager } from './VLMPath.logic';
import { VLMNotificationManager, VLMSessionManager, VLMWidgetManager } from './index';
import { VLMVideo } from '../components/VLMVideo.component';
import { VLMSound } from '../components/VLMSound.component';
import { VLMClaimPointManager } from './VLMClaimPoint.logic';
import { VLMClaimPoint } from '../components';
import { VLMDebug } from './VLMDebug.logic';
import { ecs } from '../environment';
import { getPlayerData, getPlayersInScene } from '~system/Players';
export class VLMEventListeners {
    static { this.inboundMessageFunctions = {}; }
    static { this.ignoreNextEmote = false; }
    static { this.ignoredEmote = null; }
    static { this.init = () => {
        try {
            VLMDebug.log('INITIALIZING EVENT LISTENERS');
            this.sceneRoom = VLMSessionManager.sceneRoom;
            this.sessionData = VLMSessionManager.sessionData;
            this.sessionUser = VLMSessionManager.sessionUser;
            onEnterScene(async (player) => {
                if (!player)
                    return;
                if (!this.sessionUser?.connectedWallet) {
                    return;
                }
                const userId = player.userId;
                let otherPlayers = await getPlayersInScene({});
                if (userId == this.sessionUser?.connectedWallet) {
                    VLMDebug.log('SESSION ACTION: Player Entered Scene Boundaries', userId);
                    VLMEventManager.events.emit('VLMSessionAction', 'Player Entered Scene Boundaries', { userId, otherPlayers });
                }
                else if (VLMPathManager.moving || VLMPathManager.engaged) {
                    VLMDebug.log('SESSION ACTION: Witnessed Player Enter Scene Boundaries', userId);
                    let user = await getPlayerData({ userId });
                    VLMEventManager.events.emit('VLMSessionAction', `Witnessed Scene Entry`, {
                        userId,
                        otherPlayers,
                        witness: this.sessionUser.connectedWallet,
                    });
                }
            });
            onLeaveScene(async (userId) => {
                if (!userId)
                    return;
                console.log('LEFT SCENE', userId);
                if (!this.sessionUser?.connectedWallet) {
                    return;
                }
                let otherPlayers = await getPlayersInScene({});
                if (userId == this.sessionUser?.connectedWallet) {
                    VLMEventManager.events.emit('VLMSessionAction', 'Left Scene Boundaries', { userId, otherPlayers });
                }
                else if (VLMPathManager.moving || VLMPathManager.engaged) {
                    let user = await getPlayerData({ userId });
                    VLMEventManager.events.emit('VLMSessionAction', `Witnessed Scene Departure`, {
                        userId,
                        otherPlayers,
                        witness: this.sessionUser.connectedWallet,
                    });
                }
            });
            ecs.AvatarEmoteCommand.onChange(ecs.engine.PlayerEntity, (emote) => {
                if (!emote)
                    return;
                if (this.ignoreNextEmote) {
                    this.ignoredEmote = emote.emoteUrn;
                    this.ignoreNextEmote = false;
                    VLMDebug.log(`TRACKED ACTION - Emote Ignored - ${emote.emoteUrn}`);
                    return;
                }
                else if (this.ignoredEmote == emote.emoteUrn) {
                    VLMDebug.log(`TRACKED ACTION - Ignored stationary re-trigger - ${emote.emoteUrn}`);
                    return;
                }
                else {
                    VLMDebug.log(`TRACKED ACTION - Emote triggered - ${emote.emoteUrn}`);
                    this.ignoredEmote = emote.emoteUrn;
                    VLMEventManager.events.emit('VLMSessionAction', 'Emote Used', { emote });
                    VLMEventManager.events.emit('VLMEmoteAction', emote.emoteUrn);
                }
            });
            VLMEventManager.events.on('VLMSettingsEvent', (message) => {
            });
            VLMEventManager.events.on('VLMClaimEvent', (message) => {
                VLMDebug.log('GIVEAWAY CLAIM - ', message);
                if (message.action == 'giveaway_claim') {
                    this.sceneRoom.send('giveaway_claim', { ...message, sessionToken: this.sessionData?.sessionToken, sceneId: this.sessionData?.sceneId });
                }
                else if (message.action == 'giveaway_claim_response') {
                    const claimPoint = VLMClaimPoint.configs[message.sk];
                    if (claimPoint) {
                        claimPoint.requestInProgress = false;
                    }
                    if (claimPoint.hasCustomFunctions) {
                        claimPoint.runClaimFunction(message);
                    }
                    else {
                        VLMClaimPointManager.showMessage(message);
                    }
                }
            });
            VLMEventManager.events.on('VLMSessionAction', (action, metadata) => {
                console.log('VLMSessionAction', action, metadata);
                if (this.sessionData?.sessionToken) {
                    let pathPoint = VLMPathManager.getPathPoint();
                    this.sceneRoom.send('session_action', { action, metadata, pathPoint, sessionToken: this.sessionData?.sessionToken });
                    VLMDebug.log('LOGGED ANALYTICS ACTION - ', action, pathPoint, metadata);
                }
                else {
                    VLMDebug.log('error', 'ERROR LOGGING ANALYTICS ACTION - NO SESSION TOKEN', action, metadata);
                }
            });
            VLMEventManager.events.on('VLMSoundStateEvent', ({ elementData, userId }) => {
                const id = elementData.sk;
                VLMDebug.log(id, VLMSound.configs[id]);
                VLMDebug.log('SOUND STATE CHANGED', userId, this.sessionUser.sk);
                if (userId == this.sessionUser.sk) {
                    VLMSound.configs[id].toggleLocators();
                }
            });
            VLMEventManager.events.on('VLMPathClientEvent', (message) => {
                VLMDebug.log('Triggered client path event', message);
                switch (message.action) {
                    case 'path_start':
                        break;
                    case 'path_segments_add':
                        this.sceneRoom.send('path_segments_add', message);
                        break;
                    case 'path_movement_started':
                        this.ignoredEmote = null;
                        break;
                }
            });
            VLMEventManager.events.on('VLMPathServerEvent', (message) => {
                switch (message.action) {
                    case 'path_started':
                        const pathIds = this.sessionData.paths;
                        if (message.pathId && pathIds && pathIds.indexOf(message.pathId) < 0) {
                            pathIds.push(message.pathId);
                        }
                        VLMPathManager.startPath(message);
                        break;
                    case 'path_segments_added':
                        VLMPathManager.trimStoredSegments(message);
                        break;
                }
            });
            VLMEventManager.events.on('VLMSceneMessage', (message) => {
                VLMDebug.log('event', 'SCENE MESSAGE RECEIVED', message);
                switch (message.action) {
                    case 'init':
                        VLMSceneManager.initScenePreset(message);
                        VLMDebug.log('SCENE INIT', message);
                        break;
                    case 'create':
                        VLMSceneManager.createSceneElement(message);
                        break;
                    case 'update':
                        VLMSceneManager.updateSceneElement(message);
                        break;
                    case 'delete':
                        VLMSceneManager.deleteSceneElement(message);
                        break;
                }
            });
            VLMEventManager.events.on('VLMVideoStatusEvent', (message) => {
                const videoId = message?.sk;
                if (!videoId) {
                    VLMDebug.log('error', 'VIDEO STATE CHANGED - NO VIDEO ID', message);
                    return;
                }
                const videoConfig = VLMVideo.configs[videoId];
                if (videoConfig?.liveSrc == message.url) {
                    VLMDebug.log('VIDEO STATE CHANGED', message);
                    videoConfig.setLiveState(message.status);
                }
                else if (videoConfig) {
                    this.sceneRoom.send('scene_video_update', { ...message, reason: 'url_changed' });
                }
            });
            VLMEventManager.events.on('VLMWidgetInitEvent', async (initEvent) => {
                await VLMWidgetManager.configureWidgets(initEvent.configs);
            });
            this.sceneRoom.onLeave(() => {
                VLMPathManager.endPath();
            });
            this.sceneRoom.onMessage('session_started', (message) => {
                VLMDebug.log(message);
                this.sessionData = message.session;
                this.sessionUser = message.user;
                VLMSessionManager.sessionData = message.session;
                VLMSessionManager.sessionUser = message.user;
                if (!this.sessionData?.sessionStart) {
                    this.sessionData.sessionStart = Date.now();
                }
                new VLMPathManager();
            });
            this.sceneRoom.onMessage('user_message', (message) => {
                VLMEventManager.events.emit('VLMUserMessage', message);
            });
            VLMEventManager.events.on('VLMUserMessage', async (message) => {
                if (message?.type == 'inbound') {
                    VLMDebug.log('event', 'MESSAGE RECEIVED FROM USER', message);
                    this.inboundMessageFunctions[message.id]?.(message.data);
                }
                else if (message?.type == 'outbound') {
                    this.sceneRoom.send('user_message', message);
                }
                else if (message?.type == 'getState') {
                    this.sceneRoom.send('get_user_state', message);
                }
                else if (message?.type == 'setState') {
                    this.sceneRoom.send('set_user_state', message);
                }
                else if (message?.type == 'getPlayerState') {
                    this.sceneRoom.send('get_player_state', message);
                }
                else if (message?.type == 'setPlayerState') {
                    this.sceneRoom.send('set_player_state', message);
                }
            });
            this.sceneRoom.onMessage('path_segments_added', (message) => {
                VLMEventManager.events.emit('VLMPathServerEvent', message);
            });
            this.sceneRoom.onMessage('path_started', (message) => {
                VLMEventManager.events.emit('VLMPathServerEvent', message);
            });
            this.sceneRoom.onMessage('scene_sound_locator', (message) => {
                VLMEventManager.events.emit('VLMSoundStateEvent', message);
            });
            this.sceneRoom.onMessage('show_sound_locators', (message) => {
                VLMEventManager.events.emit('VLMSoundStateEvent', message);
            });
            this.sceneRoom.onMessage('scene_preset_update', (message) => {
                VLMDebug.log('event', 'Scene Preset Updated!', message);
                if (message.action) {
                    VLMEventManager.events.emit('VLMSceneMessage', message);
                }
            });
            this.sceneRoom.onMessage('scene_change_preset', (message) => {
                VLMDebug.log('event', 'Scene Preset Changed!', message);
                VLMSceneManager.changeScenePreset(message);
            });
            this.sceneRoom.onMessage('scene_moderator_message', (config) => {
                VLMNotificationManager.addMessage(config.message, { ...config });
            });
            this.sceneRoom.onMessage('scene_moderator_crash', (user) => {
                VLMDebug.log('moderation', 'Crashing user', user);
            });
            this.sceneRoom.onMessage('scene_video_status', (message) => {
                VLMDebug.log('event', 'Video State Changed!', message);
                VLMEventManager.events.emit('VLMVideoStatusEvent', message);
            });
            this.sceneRoom.onMessage('scene_setting_update', (message) => {
                VLMDebug.log('event', 'Scene Setting Updated!', message);
                VLMEventManager.events.emit('VLMSettingsEvent', message);
            });
            this.sceneRoom.onMessage('giveaway_claim_response', (message) => {
                VLMDebug.log('event', 'Claim response received', message);
                VLMEventManager.events.emit('VLMClaimEvent', { ...message, action: 'giveaway_claim_response' });
            });
            this.sceneRoom.onMessage('request_player_position', (message) => {
                VLMDebug.log('event', 'Player Position Requested', message);
                this.sceneRoom.send('send_player_position', {
                    positionData: VLMPathManager.getPathPoint(),
                    userId: this.sessionUser?.sk,
                    connectedWallet: this.sessionUser?.connectedWallet,
                });
            });
            this.sceneRoom.send('session_start', this.sessionData);
        }
        catch (e) {
            VLMDebug.log('error', 'ERROR REGISTERING EVENT LISTENERS', e);
            throw e;
        }
    }; }
    static { this.sendMessage = (id, data) => {
        VLMEventManager.events.emit('VLMUserMessage', { id, data, type: 'outbound' });
    }; }
    static { this.onMessage = (id, callback) => {
        VLMEventManager.events.emit('VLMUserMessage', { id, data: callback, type: 'inbound' });
    }; }
    static { this.setState = (id, data) => {
        VLMEventManager.events.emit('VLMUserMessage', { id, data, type: 'setState' });
    }; }
    static { this.getState = (id, data) => {
        VLMEventManager.events.emit('VLMUserMessage', { id, data, type: 'getState' });
    }; }
    static { this.setPlayerState = (id, data) => {
        VLMEventManager.events.emit('VLMUserMessage', { id, data, type: 'setPlayerState' });
    }; }
    static { this.getPlayerState = (id, data) => {
        VLMEventManager.events.emit('VLMUserMessage', { id, data, type: 'getPlayerState' });
    }; }
    static { this.recordAction = (id, data) => {
        VLMEventManager.events.emit('VLMSessionAction', id, data);
    }; }
    static { this.getPlayersInScene = async () => {
        const players = [];
        for (const [entity, data, transform] of ecs.engine.getEntitiesWith(ecs.PlayerIdentityData, ecs.Transform)) {
            players.push({ entity, data, transform });
        }
        return players;
    }; }
    static { this.getUserIdsInScene = async () => {
        const userIds = [];
        for (const [entity, data, transform] of ecs.engine.getEntitiesWith(ecs.PlayerIdentityData, ecs.Transform)) {
            userIds.push(data.userId);
        }
        return userIds;
    }; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkxNU3lzdGVtTGlzdGVuZXJzLmxvZ2ljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2ljL1ZMTVN5c3RlbUxpc3RlbmVycy5sb2dpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFhQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFFekQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBRWxELE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDakUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ2hELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUNyRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sa0NBQWtDLENBQUE7QUFDM0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtDQUFrQyxDQUFBO0FBQzNELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzVELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxlQUFlLENBQUE7QUFDN0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQzNDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNwQyxPQUFPLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixFQUFVLE1BQU0saUJBQWlCLENBQUE7QUFFMUUsTUFBTSxPQUFnQixpQkFBaUI7YUFDOUIsNEJBQXVCLEdBQXlDLEVBQUUsQ0FBQTthQUkzRCxvQkFBZSxHQUFZLEtBQUssQ0FBQTthQUNoQyxpQkFBWSxHQUFrQixJQUFJLENBQUE7YUFHekMsU0FBSSxHQUFxQixHQUFHLEVBQUU7UUFDbkMsSUFBSSxDQUFDO1lBQ0gsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFB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QUFFLENBQUMsQ0FBQTtJQUNyRixDQUFDLENBQUE7YUFFTSxpQkFBWSxHQUFxQixDQUFDLEVBQVUsRUFBRSxJQUF5RCxFQUFFLEVBQUU7UUFDaEgsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzNELENBQUMsQ0FBQTthQUVNLHNCQUFpQixHQUFxQixLQUFLLElBQUksRUFBRTtRQUN0RCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUE7UUFDbEIsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDMUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtRQUMzQyxDQUFDO1FBQ0QsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQyxDQUFBO2FBRU0sc0JBQWlCLEdBQXFCLEtBQUssSUFBSSxFQUFFO1FBQ3RELE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQTtRQUNsQixLQUFLLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUMxRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUMzQixDQUFDO1FBQ0QsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBWTE1DbGFpbUV2ZW50LFxyXG4gIFZMTVBhdGhDbGllbnRFdmVudCxcclxuICBWTE1QYXRoU2VydmVyRXZlbnQsXHJcbiAgVkxNUGxheWVyUG9zaXRpb24sXHJcbiAgVkxNU2NlbmVNZXNzYWdlLFxyXG4gIFZMTVNlc3Npb25FdmVudCxcclxuICBWTE1TZXR0aW5nc0V2ZW50LFxyXG4gIFZMTVNvdW5kU3RhdGVFdmVudCxcclxuICBWTE1Vc2VyTWVzc2FnZSxcclxuICBWTE1WaWRlb1N0YXR1c0V2ZW50LFxyXG4gIFZMTVdpZGdldEluaXRFdmVudCxcclxufSBmcm9tICcuLi9jb21wb25lbnRzL1ZMTVN5c3RlbUV2ZW50cy5jb21wb25lbnQnXHJcbmltcG9ydCB7IFZMTUV2ZW50TWFuYWdlciB9IGZyb20gJy4vVkxNU3lzdGVtRXZlbnRzLmxvZ2ljJ1xyXG5pbXBvcnQgeyBSb29tIH0gZnJvbSAnY29seXNldXMuanMnXHJcbmltcG9ydCB7IFZMTVNjZW5lTWFuYWdlciB9IGZyb20gJy4vVkxNU2NlbmUubG9naWMnXHJcbmltcG9ydCB7IFZMTVNlc3Npb24gfSBmcm9tICcuLi9jb21wb25lbnRzL1ZMTVNlc3Npb24uY29tcG9uZW50J1xyXG5pbXBvcnQgeyBvbkVudGVyU2NlbmUsIG9uTGVhdmVTY2VuZSB9IGZyb20gJ0BkY2wvc2RrL3NyYy9wbGF5ZXJzJ1xyXG5pbXBvcnQgeyBWTE1QYXRoTWFuYWdlciB9IGZyb20gJy4vVkxNUGF0aC5sb2dpYydcclxuaW1wb3J0IHsgVkxNTm90aWZpY2F0aW9uTWFuYWdlciwgVkxNU2Vzc2lvbk1hbmFnZXIsIFZMTVdpZGdldE1hbmFnZXIgfSBmcm9tICcuL2luZGV4J1xyXG5pbXBvcnQgeyBWTE1WaWRlbyB9IGZyb20gJy4uL2NvbXBvbmVudHMvVkxNVmlkZW8uY29tcG9uZW50J1xyXG5pbXBvcnQgeyBWTE1Tb3VuZCB9IGZyb20gJy4uL2NvbXBvbmVudHMvVkxNU291bmQuY29tcG9uZW50J1xyXG5pbXBvcnQgeyBWTE1DbGFpbVBvaW50TWFuYWdlciB9IGZyb20gJy4vVkxNQ2xhaW1Qb2ludC5sb2dpYydcclxuaW1wb3J0IHsgVkxNQ2xhaW1Qb2ludCB9IGZyb20gJy4uL2NvbXBvbmVudHMnXHJcbmltcG9ydCB7IFZMTURlYnVnIH0gZnJvbSAnLi9WTE1EZWJ1Zy5sb2dpYydcclxuaW1wb3J0IHsgZWNzIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQnXHJcbmltcG9ydCB7IGdldFBsYXllckRhdGEsIGdldFBsYXllcnNJblNjZW5lLCBQbGF5ZXIgfSBmcm9tICd+c3lzdGVtL1BsYXllcnMnXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVkxNRXZlbnRMaXN0ZW5lcnMge1xyXG4gIHN0YXRpYyBpbmJvdW5kTWVzc2FnZUZ1bmN0aW9uczogeyBbdXVpZDogc3RyaW5nXTogQ2FsbGFibGVGdW5jdGlvbiB9ID0ge31cclxuICBzdGF0aWMgc2NlbmVSb29tOiBSb29tXHJcbiAgc3RhdGljIHNlc3Npb25EYXRhOiBWTE1TZXNzaW9uLkNvbmZpZ1xyXG4gIHN0YXRpYyBzZXNzaW9uVXNlcjogVkxNU2Vzc2lvbi5Vc2VyXHJcbiAgcHVibGljIHN0YXRpYyBpZ25vcmVOZXh0RW1vdGU6IGJvb2xlYW4gPSBmYWxzZVxyXG4gIHB1YmxpYyBzdGF0aWMgaWdub3JlZEVtb3RlOiBzdHJpbmcgfCBudWxsID0gbnVsbFxyXG4gIC8vIGlnbm9yZWRFbW90ZToga2VlcHMgdHJhY2sgb2YgdGhlIGxhc3QgZW1vdGUgdGhhdCB3YXMgdXNlZCwgb3IgdGhlIG9uZSB0aGF0J3MgY3VycmVudGx5IGxvb3BpbmcuIEdldHMgY2xlYXJlZCBvdXQgdXBvbiBtb3ZlbWVudC5cclxuXHJcbiAgc3RhdGljIGluaXQ6IENhbGxhYmxlRnVuY3Rpb24gPSAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBWTE1EZWJ1Zy5sb2coJ0lOSVRJQUxJWklORyBFVkVOVCBMSVNURU5FUlMnKVxyXG4gICAgICB0aGlzLnNjZW5lUm9vbSA9IFZMTVNlc3Npb25NYW5hZ2VyLnNjZW5lUm9vbVxyXG4gICAgICB0aGlzLnNlc3Npb25EYXRhID0gVkxNU2Vzc2lvbk1hbmFnZXIuc2Vzc2lvbkRhdGFcclxuICAgICAgdGhpcy5zZXNzaW9uVXNlciA9IFZMTVNlc3Npb25NYW5hZ2VyLnNlc3Npb25Vc2VyXHJcblxyXG4gICAgICBvbkVudGVyU2NlbmUoYXN5bmMgKHBsYXllcjogUGxheWVyKSA9PiB7XHJcbiAgICAgICAgaWYgKCFwbGF5ZXIpIHJldHVyblxyXG4gICAgICAgIGlmICghdGhpcy5zZXNzaW9uVXNlcj8uY29ubmVjdGVkV2FsbGV0KSB7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdXNlcklkID0gcGxheWVyLnVzZXJJZFxyXG4gICAgICAgIGxldCBvdGhlclBsYXllcnMgPSBhd2FpdCBnZXRQbGF5ZXJzSW5TY2VuZSh7fSlcclxuICAgICAgICBpZiAodXNlcklkID09IHRoaXMuc2Vzc2lvblVzZXI/LmNvbm5lY3RlZFdhbGxldCkge1xyXG4gICAgICAgICAgVkxNRGVidWcubG9nKCdTRVNTSU9OIEFDVElPTjogUGxheWVyIEVudGVyZWQgU2NlbmUgQm91bmRhcmllcycsIHVzZXJJZClcclxuICAgICAgICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMuZW1pdCgnVkxNU2Vzc2lvbkFjdGlvbicsICdQbGF5ZXIgRW50ZXJlZCBTY2VuZSBCb3VuZGFyaWVzJywgeyB1c2VySWQsIG90aGVyUGxheWVycyB9KVxyXG4gICAgICAgIH0gZWxzZSBpZiAoVkxNUGF0aE1hbmFnZXIubW92aW5nIHx8IFZMTVBhdGhNYW5hZ2VyLmVuZ2FnZWQpIHtcclxuICAgICAgICAgIFZMTURlYnVnLmxvZygnU0VTU0lPTiBBQ1RJT046IFdpdG5lc3NlZCBQbGF5ZXIgRW50ZXIgU2NlbmUgQm91bmRhcmllcycsIHVzZXJJZClcclxuICAgICAgICAgIGxldCB1c2VyID0gYXdhaXQgZ2V0UGxheWVyRGF0YSh7IHVzZXJJZCB9KVxyXG4gICAgICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1TZXNzaW9uQWN0aW9uJywgYFdpdG5lc3NlZCBTY2VuZSBFbnRyeWAsIHtcclxuICAgICAgICAgICAgdXNlcklkLFxyXG4gICAgICAgICAgICBvdGhlclBsYXllcnMsXHJcbiAgICAgICAgICAgIHdpdG5lc3M6IHRoaXMuc2Vzc2lvblVzZXIuY29ubmVjdGVkV2FsbGV0LFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBvbkxlYXZlU2NlbmUoYXN5bmMgKHVzZXJJZDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgaWYgKCF1c2VySWQpIHJldHVyblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdMRUZUIFNDRU5FJywgdXNlcklkKVxyXG4gICAgICAgIGlmICghdGhpcy5zZXNzaW9uVXNlcj8uY29ubmVjdGVkV2FsbGV0KSB7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IG90aGVyUGxheWVycyA9IGF3YWl0IGdldFBsYXllcnNJblNjZW5lKHt9KVxyXG4gICAgICAgIGlmICh1c2VySWQgPT0gdGhpcy5zZXNzaW9uVXNlcj8uY29ubmVjdGVkV2FsbGV0KSB7XHJcbiAgICAgICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTVNlc3Npb25BY3Rpb24nLCAnTGVmdCBTY2VuZSBCb3VuZGFyaWVzJywgeyB1c2VySWQsIG90aGVyUGxheWVycyB9KVxyXG4gICAgICAgIH0gZWxzZSBpZiAoVkxNUGF0aE1hbmFnZXIubW92aW5nIHx8IFZMTVBhdGhNYW5hZ2VyLmVuZ2FnZWQpIHtcclxuICAgICAgICAgIGxldCB1c2VyID0gYXdhaXQgZ2V0UGxheWVyRGF0YSh7IHVzZXJJZCB9KVxyXG4gICAgICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1TZXNzaW9uQWN0aW9uJywgYFdpdG5lc3NlZCBTY2VuZSBEZXBhcnR1cmVgLCB7XHJcbiAgICAgICAgICAgIHVzZXJJZCxcclxuICAgICAgICAgICAgb3RoZXJQbGF5ZXJzLFxyXG4gICAgICAgICAgICB3aXRuZXNzOiB0aGlzLnNlc3Npb25Vc2VyLmNvbm5lY3RlZFdhbGxldCxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgLy8gb25JZGxlU3RhdGVDaGFuZ2VkT2JzZXJ2YWJsZS5hZGQoKHsgaXNJZGxlIH0pID0+IHtcclxuICAgICAgLy8gICBpZiAoaXNJZGxlKSB7XHJcbiAgICAgIC8vICAgICAvL0lETEVcclxuICAgICAgLy8gICAgIFZMTVBhdGhNYW5hZ2VyLmlkbGUgPSB0cnVlO1xyXG4gICAgICAvLyAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1TZXNzaW9uQWN0aW9uJywgXCJXZW50IElkbGVcIik7XHJcbiAgICAgIC8vICAgICBWTE1QYXRoTWFuYWdlci5zdGFydElkbGVTZWdtZW50KCk7XHJcbiAgICAgIC8vICAgfSBlbHNlIHtcclxuICAgICAgLy8gICAgIC8vQUNUSVZFXHJcbiAgICAgIC8vICAgICBjb25zdCBlbnQgPSBuZXcgRW50aXR5KCk7XHJcbiAgICAgIC8vICAgICBjb25zdCBkZWxheSA9IG5ldyBWTE1UaW1lci5EZWxheSgxMDAwLCAoKSA9PiB7XHJcbiAgICAgIC8vICAgICAgIGlmIChWTE1QYXRoTWFuYWdlci5pZGxlKSB7XHJcbiAgICAgIC8vICAgICAgICAgVkxNUGF0aE1hbmFnZXIuaWRsZSA9IGZhbHNlO1xyXG4gICAgICAvLyAgICAgICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMuZW1pdCgnVkxNU2Vzc2lvbkFjdGlvbicsIFwiQmVjYW1lIEFjdGl2ZVwiKTtcclxuICAgICAgLy8gICAgICAgICBWTE1QYXRoTWFuYWdlci5zdGFydE5ld1NlZ21lbnQoKTtcclxuICAgICAgLy8gICAgICAgfVxyXG4gICAgICAvLyAgICAgICBlbmdpbmUucmVtb3ZlRW50aXR5KGVudCk7XHJcbiAgICAgIC8vICAgICB9KTtcclxuICAgICAgLy8gICAgIGVudC5hZGRDb21wb25lbnRPclJlcGxhY2UoZGVsYXkpO1xyXG4gICAgICAvLyAgICAgZW5naW5lLmFkZEVudGl0eShlbnQpO1xyXG4gICAgICAvLyAgIH1cclxuICAgICAgLy8gfSk7XHJcblxyXG4gICAgICAvLyBvblBvaW50ZXJMb2NrZWRTdGF0ZUNoYW5nZS5hZGQoKHsgbG9ja2VkIH0pID0+IHtcclxuICAgICAgLy8gICBpZiAobG9ja2VkKSB7XHJcbiAgICAgIC8vICAgICBWTE1QYXRoTWFuYWdlci5lbmdhZ2VkID0gdHJ1ZTtcclxuICAgICAgLy8gICAgIFZMTVBhdGhNYW5hZ2VyLnN0YXJ0U3RhdGlvbmFyeUVuZ2FnZWQoKTtcclxuICAgICAgLy8gICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMuZW1pdCgnVkxNU2Vzc2lvbkFjdGlvbicsIFwiRW5nYWdlZCBDdXJzb3JcIik7XHJcbiAgICAgIC8vICAgfSBlbHNlIHtcclxuICAgICAgLy8gICAgIFZMTVBhdGhNYW5hZ2VyLmVuZ2FnZWQgPSBmYWxzZTtcclxuICAgICAgLy8gICAgIFZMTVBhdGhNYW5hZ2VyLnN0YXJ0U3RhdGlvbmFyeURpc2VuZ2FnZWQoKTtcclxuICAgICAgLy8gICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMuZW1pdCgnVkxNU2Vzc2lvbkFjdGlvbicsIFwiRGlzZW5nYWdlZCBDdXJzb3JcIik7XHJcbiAgICAgIC8vICAgfVxyXG4gICAgICAvLyB9KTtcclxuXHJcbiAgICAgIC8vIG9uUGxheWVyRXhwcmVzc2lvbk9ic2VydmFibGUuYWRkKCh7IGV4cHJlc3Npb25JZCB9KSA9PiB7XHJcbiAgICAgIC8vICAgaWYgKHRoaXMuaWdub3JlTmV4dEVtb3RlKSB7XHJcbiAgICAgIC8vICAgICB0aGlzLmlnbm9yZWRFbW90ZSA9IGV4cHJlc3Npb25JZFxyXG4gICAgICAvLyAgICAgdGhpcy5pZ25vcmVOZXh0RW1vdGUgPSBmYWxzZVxyXG4gICAgICAvLyAgICAgVkxNRGVidWcubG9nKGBUUkFDS0VEIEFDVElPTiAtIEVtb3RlIElnbm9yZWQgLSAke2V4cHJlc3Npb25JZH1gKVxyXG4gICAgICAvLyAgICAgcmV0dXJuXHJcbiAgICAgIC8vICAgfSBlbHNlIGlmICh0aGlzLmlnbm9yZWRFbW90ZSA9PSBleHByZXNzaW9uSWQpIHtcclxuICAgICAgLy8gICAgIFZMTURlYnVnLmxvZyhgVFJBQ0tFRCBBQ1RJT04gLSBJZ25vcmVkIHN0YXRpb25hcnkgcmUtdHJpZ2dlciAtICR7ZXhwcmVzc2lvbklkfWApXHJcbiAgICAgIC8vICAgICByZXR1cm5cclxuICAgICAgLy8gICB9IGVsc2Uge1xyXG4gICAgICAvLyAgICAgVkxNRGVidWcubG9nKGBUUkFDS0VEIEFDVElPTiAtIEVtb3RlIHRyaWdnZXJlZCAtICR7ZXhwcmVzc2lvbklkfWApXHJcbiAgICAgIC8vICAgICB0aGlzLmlnbm9yZWRFbW90ZSA9IGV4cHJlc3Npb25JZFxyXG4gICAgICAvLyAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1TZXNzaW9uQWN0aW9uJywgJ0Vtb3RlIFVzZWQnLCB7IGVtb3RlOiBleHByZXNzaW9uSWQgfSlcclxuICAgICAgLy8gICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMuZW1pdCgnVkxNRW1vdGVBY3Rpb24nLCBleHByZXNzaW9uSWQpXHJcbiAgICAgIC8vICAgfVxyXG4gICAgICAvLyB9KVxyXG5cclxuICAgICAgZWNzLkF2YXRhckVtb3RlQ29tbWFuZC5vbkNoYW5nZShlY3MuZW5naW5lLlBsYXllckVudGl0eSwgKGVtb3RlPzogeyBlbW90ZVVybjogc3RyaW5nOyBsb29wOiBib29sZWFuOyB0aW1lc3RhbXA6IG51bWJlciB9KSA9PiB7XHJcbiAgICAgICAgaWYgKCFlbW90ZSkgcmV0dXJuXHJcbiAgICAgICAgaWYgKHRoaXMuaWdub3JlTmV4dEVtb3RlKSB7XHJcbiAgICAgICAgICB0aGlzLmlnbm9yZWRFbW90ZSA9IGVtb3RlLmVtb3RlVXJuXHJcbiAgICAgICAgICB0aGlzLmlnbm9yZU5leHRFbW90ZSA9IGZhbHNlXHJcbiAgICAgICAgICBWTE1EZWJ1Zy5sb2coYFRSQUNLRUQgQUNUSU9OIC0gRW1vdGUgSWdub3JlZCAtICR7ZW1vdGUuZW1vdGVVcm59YClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pZ25vcmVkRW1vdGUgPT0gZW1vdGUuZW1vdGVVcm4pIHtcclxuICAgICAgICAgIFZMTURlYnVnLmxvZyhgVFJBQ0tFRCBBQ1RJT04gLSBJZ25vcmVkIHN0YXRpb25hcnkgcmUtdHJpZ2dlciAtICR7ZW1vdGUuZW1vdGVVcm59YClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBWTE1EZWJ1Zy5sb2coYFRSQUNLRUQgQUNUSU9OIC0gRW1vdGUgdHJpZ2dlcmVkIC0gJHtlbW90ZS5lbW90ZVVybn1gKVxyXG4gICAgICAgICAgdGhpcy5pZ25vcmVkRW1vdGUgPSBlbW90ZS5lbW90ZVVyblxyXG4gICAgICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1TZXNzaW9uQWN0aW9uJywgJ0Vtb3RlIFVzZWQnLCB7IGVtb3RlIH0pXHJcbiAgICAgICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTUVtb3RlQWN0aW9uJywgZW1vdGUuZW1vdGVVcm4pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgLy8gb25QbGF5ZXJDbGlja2VkT2JzZXJ2YWJsZS5hZGQoKGNsaWNrRXZlbnQpID0+IHtcclxuICAgICAgLy8gICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTVNlc3Npb25BY3Rpb24nLCAnVmlld2VkIEEgVXNlciBQcm9maWxlJywgY2xpY2tFdmVudClcclxuXHJcbiAgICAgIC8vICAgVkxNRGVidWcubG9nKCdzZXNzaW9uJywgJ1RSQUNLRUQgQUNUSU9OIC0gVmlld2VkIEEgVXNlciBQcm9maWxlJywgY2xpY2tFdmVudC51c2VySWQpXHJcbiAgICAgIC8vIH0pXHJcblxyXG4gICAgICAvLyBvblBsYXllckNvbm5lY3RlZE9ic2VydmFibGUuYWRkKGFzeW5jICh7IHVzZXJJZCB9KSA9PiB7XHJcbiAgICAgIC8vICAgaWYgKFZMTVBhdGhNYW5hZ2VyLmVuZ2FnZWQgfHwgVkxNUGF0aE1hbmFnZXIubW92aW5nKSB7XHJcbiAgICAgIC8vICAgICBsZXQgdXNlciA9IGF3YWl0IGdldFBsYXllckRhdGEoeyB1c2VySWQgfSk7XHJcbiAgICAgIC8vICAgICBsZXQgb3RoZXJQbGF5ZXJzID0gYXdhaXQgZ2V0UGxheWVyc0luU2NlbmUoKTtcclxuICAgICAgLy8gICAgIFZMTURlYnVnLmxvZyhcIlNFU1NJT04gQUNUSU9OOiBXaXRuZXNzZWQgQ29ubmVjdGlvblwiLCB1c2VySWQpO1xyXG4gICAgICAvLyAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KG5ldyBWTE1XaXRuZXNzZWRBY3Rpb24oYFdpdG5lc3NlZCAke3VzZXI/LmRpc3BsYXlOYW1lIHx8IFwiU29tZW9uZVwifSBDb25uZWN0YCwgeyB1c2VySWQsIG90aGVyUGxheWVycyB9KSk7XHJcbiAgICAgIC8vICAgfVxyXG4gICAgICAvLyB9KTtcclxuXHJcbiAgICAgIC8vIG9uUGxheWVyRGlzY29ubmVjdGVkT2JzZXJ2YWJsZS5hZGQoYXN5bmMgKHsgdXNlcklkIH0pID0+IHtcclxuICAgICAgLy8gICBpZiAoVkxNUGF0aE1hbmFnZXIuZW5nYWdlZCB8fCBWTE1QYXRoTWFuYWdlci5tb3ZpbmcpIHtcclxuICAgICAgLy8gICAgIGxldCBvdGhlclBsYXllcnMgPSBhd2FpdCBnZXRQbGF5ZXJzSW5TY2VuZSgpO1xyXG4gICAgICAvLyAgICAgbGV0IHVzZXIgPSBhd2FpdCBnZXRQbGF5ZXJEYXRhKHsgdXNlcklkIH0pO1xyXG4gICAgICAvLyAgICAgVkxNRGVidWcubG9nKFwiU0VTU0lPTiBBQ1RJT046IFdpdG5lc3NlZCBEaXNjb25uZWN0aW9uXCIsIHVzZXJJZCk7XHJcbiAgICAgIC8vICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQobmV3IFZMTVdpdG5lc3NlZEFjdGlvbihgV2l0bmVzc2VkICR7dXNlcj8uZGlzcGxheU5hbWUgfHwgXCJTb21lb25lXCJ9IERpc2Nvbm5lY3RgLCB7IHVzZXJJZCwgb3RoZXJQbGF5ZXJzIH0pKTtcclxuICAgICAgLy8gICB9XHJcbiAgICAgIC8vIH0pO1xyXG5cclxuICAgICAgLy8gb25FbnRlclNjZW5lT2JzZXJ2YWJsZS5hZGQoYXN5bmMgKHsgdXNlcklkIH0pID0+IHtcclxuICAgICAgLy8gICBpZiAoIXRoaXMuc2Vzc2lvblVzZXI/LmNvbm5lY3RlZFdhbGxldCkge1xyXG4gICAgICAvLyAgICAgcmV0dXJuXHJcbiAgICAgIC8vICAgfVxyXG4gICAgICAvLyAgIGxldCBvdGhlclBsYXllcnMgPSBhd2FpdCBnZXRQbGF5ZXJzSW5TY2VuZSh7fSlcclxuICAgICAgLy8gICBpZiAodXNlcklkID09IHRoaXMuc2Vzc2lvblVzZXI/LmNvbm5lY3RlZFdhbGxldCkge1xyXG4gICAgICAvLyAgICAgVkxNRGVidWcubG9nKCdTRVNTSU9OIEFDVElPTjogUGxheWVyIEVudGVyZWQgU2NlbmUgQm91bmRhcmllcycsIHVzZXJJZClcclxuICAgICAgLy8gICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMuZW1pdCgnVkxNU2Vzc2lvbkFjdGlvbicsICdQbGF5ZXIgRW50ZXJlZCBTY2VuZSBCb3VuZGFyaWVzJywgeyB1c2VySWQsIG90aGVyUGxheWVycyB9KVxyXG4gICAgICAvLyAgIH0gZWxzZSBpZiAoVkxNUGF0aE1hbmFnZXIubW92aW5nIHx8IFZMTVBhdGhNYW5hZ2VyLmVuZ2FnZWQpIHtcclxuICAgICAgLy8gICAgIFZMTURlYnVnLmxvZygnU0VTU0lPTiBBQ1RJT046IFdpdG5lc3NlZCBQbGF5ZXIgRW50ZXIgU2NlbmUgQm91bmRhcmllcycsIHVzZXJJZClcclxuICAgICAgLy8gICAgIGxldCB1c2VyID0gYXdhaXQgZ2V0UGxheWVyRGF0YSh7IHVzZXJJZCB9KVxyXG4gICAgICAvLyAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1TZXNzaW9uQWN0aW9uJywgYFdpdG5lc3NlZCBTY2VuZSBFbnRyeWAsIHtcclxuICAgICAgLy8gICAgICAgdXNlcklkLFxyXG4gICAgICAvLyAgICAgICBvdGhlclBsYXllcnMsXHJcbiAgICAgIC8vICAgICAgIHdpdG5lc3M6IHRoaXMuc2Vzc2lvblVzZXIuY29ubmVjdGVkV2FsbGV0LFxyXG4gICAgICAvLyAgICAgfSlcclxuICAgICAgLy8gICB9XHJcbiAgICAgIC8vIH0pXHJcblxyXG4gICAgICAvLyBvbkxlYXZlU2NlbmVPYnNlcnZhYmxlLmFkZChhc3luYyAoeyB1c2VySWQgfSkgPT4ge1xyXG4gICAgICAvLyAgIGlmICghdGhpcy5zZXNzaW9uVXNlcj8uY29ubmVjdGVkV2FsbGV0KSB7XHJcbiAgICAgIC8vICAgICByZXR1cm5cclxuICAgICAgLy8gICB9XHJcbiAgICAgIC8vICAgbGV0IG90aGVyUGxheWVycyA9IGF3YWl0IGdldFBsYXllcnNJblNjZW5lKHt9KVxyXG4gICAgICAvLyAgIGlmICh1c2VySWQgPT0gdGhpcy5zZXNzaW9uVXNlcj8uY29ubmVjdGVkV2FsbGV0KSB7XHJcbiAgICAgIC8vICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTVNlc3Npb25BY3Rpb24nLCAnTGVmdCBTY2VuZSBCb3VuZGFyaWVzJywgeyB1c2VySWQsIG90aGVyUGxheWVycyB9KVxyXG4gICAgICAvLyAgIH0gZWxzZSBpZiAoVkxNUGF0aE1hbmFnZXIubW92aW5nIHx8IFZMTVBhdGhNYW5hZ2VyLmVuZ2FnZWQpIHtcclxuICAgICAgLy8gICAgIGxldCB1c2VyID0gYXdhaXQgZ2V0UGxheWVyRGF0YSh7IHVzZXJJZCB9KVxyXG4gICAgICAvLyAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1TZXNzaW9uQWN0aW9uJywgYFdpdG5lc3NlZCBTY2VuZSBEZXBhcnR1cmVgLCB7XHJcbiAgICAgIC8vICAgICAgIHVzZXJJZCxcclxuICAgICAgLy8gICAgICAgb3RoZXJQbGF5ZXJzLFxyXG4gICAgICAvLyAgICAgICB3aXRuZXNzOiB0aGlzLnNlc3Npb25Vc2VyLmNvbm5lY3RlZFdhbGxldCxcclxuICAgICAgLy8gICAgIH0pXHJcbiAgICAgIC8vICAgfVxyXG4gICAgICAvLyB9KVxyXG5cclxuICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5vbignVkxNU2V0dGluZ3NFdmVudCcsIChtZXNzYWdlOiBWTE1TZXR0aW5nc0V2ZW50KSA9PiB7XHJcbiAgICAgICAgLy8gVkxNTW9kZXJhdGlvbk1hbmFnZXIudXBkYXRlU2V0dGluZ3MobWVzc2FnZS5zZXR0aW5nRGF0YS5zZXR0aW5nVmFsdWUpO1xyXG4gICAgICB9KVxyXG5cclxuICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5vbignVkxNQ2xhaW1FdmVudCcsIChtZXNzYWdlOiBWTE1DbGFpbUV2ZW50KSA9PiB7XHJcbiAgICAgICAgVkxNRGVidWcubG9nKCdHSVZFQVdBWSBDTEFJTSAtICcsIG1lc3NhZ2UpXHJcbiAgICAgICAgaWYgKG1lc3NhZ2UuYWN0aW9uID09ICdnaXZlYXdheV9jbGFpbScpIHtcclxuICAgICAgICAgIHRoaXMuc2NlbmVSb29tLnNlbmQoJ2dpdmVhd2F5X2NsYWltJywgeyAuLi5tZXNzYWdlLCBzZXNzaW9uVG9rZW46IHRoaXMuc2Vzc2lvbkRhdGE/LnNlc3Npb25Ub2tlbiwgc2NlbmVJZDogdGhpcy5zZXNzaW9uRGF0YT8uc2NlbmVJZCB9KVxyXG4gICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS5hY3Rpb24gPT0gJ2dpdmVhd2F5X2NsYWltX3Jlc3BvbnNlJykge1xyXG4gICAgICAgICAgY29uc3QgY2xhaW1Qb2ludCA9IFZMTUNsYWltUG9pbnQuY29uZmlnc1ttZXNzYWdlLnNrXVxyXG4gICAgICAgICAgaWYgKGNsYWltUG9pbnQpIHtcclxuICAgICAgICAgICAgY2xhaW1Qb2ludC5yZXF1ZXN0SW5Qcm9ncmVzcyA9IGZhbHNlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoY2xhaW1Qb2ludC5oYXNDdXN0b21GdW5jdGlvbnMpIHtcclxuICAgICAgICAgICAgY2xhaW1Qb2ludC5ydW5DbGFpbUZ1bmN0aW9uKG1lc3NhZ2UpXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBWTE1DbGFpbVBvaW50TWFuYWdlci5zaG93TWVzc2FnZShtZXNzYWdlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMub24oJ1ZMTVNlc3Npb25BY3Rpb24nLCAoYWN0aW9uOiBzdHJpbmcsIG1ldGFkYXRhOiB1bmtub3duKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1ZMTVNlc3Npb25BY3Rpb24nLCBhY3Rpb24sIG1ldGFkYXRhKVxyXG4gICAgICAgIGlmICh0aGlzLnNlc3Npb25EYXRhPy5zZXNzaW9uVG9rZW4pIHtcclxuICAgICAgICAgIGxldCBwYXRoUG9pbnQgPSBWTE1QYXRoTWFuYWdlci5nZXRQYXRoUG9pbnQoKVxyXG4gICAgICAgICAgdGhpcy5zY2VuZVJvb20uc2VuZCgnc2Vzc2lvbl9hY3Rpb24nLCB7IGFjdGlvbiwgbWV0YWRhdGEsIHBhdGhQb2ludCwgc2Vzc2lvblRva2VuOiB0aGlzLnNlc3Npb25EYXRhPy5zZXNzaW9uVG9rZW4gfSlcclxuICAgICAgICAgIFZMTURlYnVnLmxvZygnTE9HR0VEIEFOQUxZVElDUyBBQ1RJT04gLSAnLCBhY3Rpb24sIHBhdGhQb2ludCwgbWV0YWRhdGEpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIFZMTURlYnVnLmxvZygnZXJyb3InLCAnRVJST1IgTE9HR0lORyBBTkFMWVRJQ1MgQUNUSU9OIC0gTk8gU0VTU0lPTiBUT0tFTicsIGFjdGlvbiwgbWV0YWRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5vbignVkxNU291bmRTdGF0ZUV2ZW50JywgKHsgZWxlbWVudERhdGEsIHVzZXJJZCB9OiBWTE1Tb3VuZFN0YXRlRXZlbnQpID0+IHtcclxuICAgICAgICBjb25zdCBpZCA9IGVsZW1lbnREYXRhLnNrXHJcbiAgICAgICAgVkxNRGVidWcubG9nKGlkLCBWTE1Tb3VuZC5jb25maWdzW2lkXSlcclxuICAgICAgICBWTE1EZWJ1Zy5sb2coJ1NPVU5EIFNUQVRFIENIQU5HRUQnLCB1c2VySWQsIHRoaXMuc2Vzc2lvblVzZXIuc2spXHJcbiAgICAgICAgaWYgKHVzZXJJZCA9PSB0aGlzLnNlc3Npb25Vc2VyLnNrKSB7XHJcbiAgICAgICAgICBWTE1Tb3VuZC5jb25maWdzW2lkXS50b2dnbGVMb2NhdG9ycygpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5vbignVkxNUGF0aENsaWVudEV2ZW50JywgKG1lc3NhZ2U6IFZMTVBhdGhDbGllbnRFdmVudCkgPT4ge1xyXG4gICAgICAgIFZMTURlYnVnLmxvZygnVHJpZ2dlcmVkIGNsaWVudCBwYXRoIGV2ZW50JywgbWVzc2FnZSlcclxuXHJcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlLmFjdGlvbikge1xyXG4gICAgICAgICAgY2FzZSAncGF0aF9zdGFydCc6XHJcbiAgICAgICAgICAgIC8vIHRoaXMuc2NlbmVSb29tLnNlbmQoJ3BhdGhfc3RhcnQnLCB7IHNlc3Npb246IHRoaXMuc2Vzc2lvbkRhdGEgfSlcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgJ3BhdGhfc2VnbWVudHNfYWRkJzpcclxuICAgICAgICAgICAgdGhpcy5zY2VuZVJvb20uc2VuZCgncGF0aF9zZWdtZW50c19hZGQnLCBtZXNzYWdlKVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgY2FzZSAncGF0aF9tb3ZlbWVudF9zdGFydGVkJzpcclxuICAgICAgICAgICAgdGhpcy5pZ25vcmVkRW1vdGUgPSBudWxsXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5vbignVkxNUGF0aFNlcnZlckV2ZW50JywgKG1lc3NhZ2U6IFZMTVBhdGhTZXJ2ZXJFdmVudCkgPT4ge1xyXG4gICAgICAgIHN3aXRjaCAobWVzc2FnZS5hY3Rpb24pIHtcclxuICAgICAgICAgIGNhc2UgJ3BhdGhfc3RhcnRlZCc6XHJcbiAgICAgICAgICAgIGNvbnN0IHBhdGhJZHMgPSB0aGlzLnNlc3Npb25EYXRhLnBhdGhzXHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnBhdGhJZCAmJiBwYXRoSWRzICYmIHBhdGhJZHMuaW5kZXhPZihtZXNzYWdlLnBhdGhJZCkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgcGF0aElkcy5wdXNoKG1lc3NhZ2UucGF0aElkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFZMTVBhdGhNYW5hZ2VyLnN0YXJ0UGF0aChtZXNzYWdlKVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgY2FzZSAncGF0aF9zZWdtZW50c19hZGRlZCc6XHJcbiAgICAgICAgICAgIFZMTVBhdGhNYW5hZ2VyLnRyaW1TdG9yZWRTZWdtZW50cyhtZXNzYWdlKVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMub24oJ1ZMTVNjZW5lTWVzc2FnZScsIChtZXNzYWdlOiBWTE1TY2VuZU1lc3NhZ2UpID0+IHtcclxuICAgICAgICBWTE1EZWJ1Zy5sb2coJ2V2ZW50JywgJ1NDRU5FIE1FU1NBR0UgUkVDRUlWRUQnLCBtZXNzYWdlKVxyXG4gICAgICAgIHN3aXRjaCAobWVzc2FnZS5hY3Rpb24pIHtcclxuICAgICAgICAgIGNhc2UgJ2luaXQnOlxyXG4gICAgICAgICAgICBWTE1TY2VuZU1hbmFnZXIuaW5pdFNjZW5lUHJlc2V0KG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIFZMTURlYnVnLmxvZygnU0NFTkUgSU5JVCcsIG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxyXG4gICAgICAgICAgICBWTE1TY2VuZU1hbmFnZXIuY3JlYXRlU2NlbmVFbGVtZW50KG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOlxyXG4gICAgICAgICAgICBWTE1TY2VuZU1hbmFnZXIudXBkYXRlU2NlbmVFbGVtZW50KG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxyXG4gICAgICAgICAgICBWTE1TY2VuZU1hbmFnZXIuZGVsZXRlU2NlbmVFbGVtZW50KG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5vbignVkxNVmlkZW9TdGF0dXNFdmVudCcsIChtZXNzYWdlOiBWTE1WaWRlb1N0YXR1c0V2ZW50KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmlkZW9JZCA9IG1lc3NhZ2U/LnNrXHJcbiAgICAgICAgaWYgKCF2aWRlb0lkKSB7XHJcbiAgICAgICAgICBWTE1EZWJ1Zy5sb2coJ2Vycm9yJywgJ1ZJREVPIFNUQVRFIENIQU5HRUQgLSBOTyBWSURFTyBJRCcsIG1lc3NhZ2UpXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZGVvQ29uZmlnID0gVkxNVmlkZW8uY29uZmlnc1t2aWRlb0lkXVxyXG5cclxuICAgICAgICBpZiAodmlkZW9Db25maWc/LmxpdmVTcmMgPT0gbWVzc2FnZS51cmwpIHtcclxuICAgICAgICAgIFZMTURlYnVnLmxvZygnVklERU8gU1RBVEUgQ0hBTkdFRCcsIG1lc3NhZ2UpXHJcbiAgICAgICAgICB2aWRlb0NvbmZpZy5zZXRMaXZlU3RhdGUobWVzc2FnZS5zdGF0dXMpXHJcbiAgICAgICAgfSBlbHNlIGlmICh2aWRlb0NvbmZpZykge1xyXG4gICAgICAgICAgdGhpcy5zY2VuZVJvb20uc2VuZCgnc2NlbmVfdmlkZW9fdXBkYXRlJywgeyAuLi5tZXNzYWdlLCByZWFzb246ICd1cmxfY2hhbmdlZCcgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLm9uKCdWTE1XaWRnZXRJbml0RXZlbnQnLCBhc3luYyAoaW5pdEV2ZW50OiBWTE1XaWRnZXRJbml0RXZlbnQpID0+IHtcclxuICAgICAgICBhd2FpdCBWTE1XaWRnZXRNYW5hZ2VyLmNvbmZpZ3VyZVdpZGdldHMoaW5pdEV2ZW50LmNvbmZpZ3MpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICB0aGlzLnNjZW5lUm9vbS5vbkxlYXZlKCgpID0+IHtcclxuICAgICAgICBWTE1QYXRoTWFuYWdlci5lbmRQYXRoKClcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc2NlbmVSb29tLm9uTWVzc2FnZSgnc2Vzc2lvbl9zdGFydGVkJywgKG1lc3NhZ2U6IFZMTVNlc3Npb25FdmVudCkgPT4ge1xyXG4gICAgICAgIFZMTURlYnVnLmxvZyhtZXNzYWdlKVxyXG4gICAgICAgIHRoaXMuc2Vzc2lvbkRhdGEgPSBtZXNzYWdlLnNlc3Npb25cclxuICAgICAgICB0aGlzLnNlc3Npb25Vc2VyID0gbWVzc2FnZS51c2VyXHJcbiAgICAgICAgVkxNU2Vzc2lvbk1hbmFnZXIuc2Vzc2lvbkRhdGEgPSBtZXNzYWdlLnNlc3Npb25cclxuICAgICAgICBWTE1TZXNzaW9uTWFuYWdlci5zZXNzaW9uVXNlciA9IG1lc3NhZ2UudXNlclxyXG4gICAgICAgIGlmICghdGhpcy5zZXNzaW9uRGF0YT8uc2Vzc2lvblN0YXJ0KSB7XHJcbiAgICAgICAgICB0aGlzLnNlc3Npb25EYXRhLnNlc3Npb25TdGFydCA9IERhdGUubm93KClcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV3IFZMTVBhdGhNYW5hZ2VyKClcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc2NlbmVSb29tLm9uTWVzc2FnZSgndXNlcl9tZXNzYWdlJywgKG1lc3NhZ2U6IFZMTVVzZXJNZXNzYWdlKSA9PiB7XHJcbiAgICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1Vc2VyTWVzc2FnZScsIG1lc3NhZ2UpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLm9uKCdWTE1Vc2VyTWVzc2FnZScsIGFzeW5jIChtZXNzYWdlOiBWTE1Vc2VyTWVzc2FnZSkgPT4ge1xyXG4gICAgICAgIGlmIChtZXNzYWdlPy50eXBlID09ICdpbmJvdW5kJykge1xyXG4gICAgICAgICAgVkxNRGVidWcubG9nKCdldmVudCcsICdNRVNTQUdFIFJFQ0VJVkVEIEZST00gVVNFUicsIG1lc3NhZ2UpXHJcbiAgICAgICAgICB0aGlzLmluYm91bmRNZXNzYWdlRnVuY3Rpb25zW21lc3NhZ2UuaWRdPy4obWVzc2FnZS5kYXRhKVxyXG4gICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZT8udHlwZSA9PSAnb3V0Ym91bmQnKSB7XHJcbiAgICAgICAgICB0aGlzLnNjZW5lUm9vbS5zZW5kKCd1c2VyX21lc3NhZ2UnLCBtZXNzYWdlKVxyXG4gICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZT8udHlwZSA9PSAnZ2V0U3RhdGUnKSB7XHJcbiAgICAgICAgICB0aGlzLnNjZW5lUm9vbS5zZW5kKCdnZXRfdXNlcl9zdGF0ZScsIG1lc3NhZ2UpXHJcbiAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlPy50eXBlID09ICdzZXRTdGF0ZScpIHtcclxuICAgICAgICAgIHRoaXMuc2NlbmVSb29tLnNlbmQoJ3NldF91c2VyX3N0YXRlJywgbWVzc2FnZSlcclxuICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2U/LnR5cGUgPT0gJ2dldFBsYXllclN0YXRlJykge1xyXG4gICAgICAgICAgdGhpcy5zY2VuZVJvb20uc2VuZCgnZ2V0X3BsYXllcl9zdGF0ZScsIG1lc3NhZ2UpXHJcbiAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlPy50eXBlID09ICdzZXRQbGF5ZXJTdGF0ZScpIHtcclxuICAgICAgICAgIHRoaXMuc2NlbmVSb29tLnNlbmQoJ3NldF9wbGF5ZXJfc3RhdGUnLCBtZXNzYWdlKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc2NlbmVSb29tLm9uTWVzc2FnZSgncGF0aF9zZWdtZW50c19hZGRlZCcsIChtZXNzYWdlOiBWTE1QYXRoU2VydmVyRXZlbnQpID0+IHtcclxuICAgICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTVBhdGhTZXJ2ZXJFdmVudCcsIG1lc3NhZ2UpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICB0aGlzLnNjZW5lUm9vbS5vbk1lc3NhZ2UoJ3BhdGhfc3RhcnRlZCcsIChtZXNzYWdlOiBWTE1QYXRoU2VydmVyRXZlbnQpID0+IHtcclxuICAgICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTVBhdGhTZXJ2ZXJFdmVudCcsIG1lc3NhZ2UpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICB0aGlzLnNjZW5lUm9vbS5vbk1lc3NhZ2UoJ3NjZW5lX3NvdW5kX2xvY2F0b3InLCAobWVzc2FnZTogVkxNU291bmRTdGF0ZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1Tb3VuZFN0YXRlRXZlbnQnLCBtZXNzYWdlKVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5zY2VuZVJvb20ub25NZXNzYWdlKCdzaG93X3NvdW5kX2xvY2F0b3JzJywgKG1lc3NhZ2U6IFZMTVNvdW5kU3RhdGVFdmVudCkgPT4ge1xyXG4gICAgICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMuZW1pdCgnVkxNU291bmRTdGF0ZUV2ZW50JywgbWVzc2FnZSlcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc2NlbmVSb29tLm9uTWVzc2FnZSgnc2NlbmVfcHJlc2V0X3VwZGF0ZScsIChtZXNzYWdlOiBWTE1TY2VuZU1lc3NhZ2UpID0+IHtcclxuICAgICAgICBWTE1EZWJ1Zy5sb2coJ2V2ZW50JywgJ1NjZW5lIFByZXNldCBVcGRhdGVkIScsIG1lc3NhZ2UpXHJcbiAgICAgICAgaWYgKG1lc3NhZ2UuYWN0aW9uKSB7XHJcbiAgICAgICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTVNjZW5lTWVzc2FnZScsIG1lc3NhZ2UpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5zY2VuZVJvb20ub25NZXNzYWdlKCdzY2VuZV9jaGFuZ2VfcHJlc2V0JywgKG1lc3NhZ2U6IFZMTVNjZW5lTWVzc2FnZSkgPT4ge1xyXG4gICAgICAgIFZMTURlYnVnLmxvZygnZXZlbnQnLCAnU2NlbmUgUHJlc2V0IENoYW5nZWQhJywgbWVzc2FnZSlcclxuICAgICAgICBWTE1TY2VuZU1hbmFnZXIuY2hhbmdlU2NlbmVQcmVzZXQobWVzc2FnZSlcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc2NlbmVSb29tLm9uTWVzc2FnZSgnc2NlbmVfbW9kZXJhdG9yX21lc3NhZ2UnLCAoY29uZmlnOiB7IG1lc3NhZ2U6IHN0cmluZzsgY29sb3I6IHN0cmluZzsgZm9udFNpemU6IG51bWJlcjsgZGVsYXk6IG51bWJlciB9KSA9PiB7XHJcbiAgICAgICAgVkxNTm90aWZpY2F0aW9uTWFuYWdlci5hZGRNZXNzYWdlKGNvbmZpZy5tZXNzYWdlLCB7IC4uLmNvbmZpZyB9KVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5zY2VuZVJvb20ub25NZXNzYWdlKCdzY2VuZV9tb2RlcmF0b3JfY3Jhc2gnLCAodXNlcjogeyBjb25uZWN0ZWRXYWxsZXQ6IHN0cmluZzsgZGlzcGxheU5hbWU6IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgICAgVkxNRGVidWcubG9nKCdtb2RlcmF0aW9uJywgJ0NyYXNoaW5nIHVzZXInLCB1c2VyKVxyXG4gICAgICAgIC8vIFZMTU1vZGVyYXRpb25NYW5hZ2VyLnNldENyYXNoVXNlcih1c2VyKTtcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc2NlbmVSb29tLm9uTWVzc2FnZSgnc2NlbmVfdmlkZW9fc3RhdHVzJywgKG1lc3NhZ2U6IFZMTVZpZGVvU3RhdHVzRXZlbnQpID0+IHtcclxuICAgICAgICBWTE1EZWJ1Zy5sb2coJ2V2ZW50JywgJ1ZpZGVvIFN0YXRlIENoYW5nZWQhJywgbWVzc2FnZSlcclxuICAgICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTVZpZGVvU3RhdHVzRXZlbnQnLCBtZXNzYWdlKVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5zY2VuZVJvb20ub25NZXNzYWdlKCdzY2VuZV9zZXR0aW5nX3VwZGF0ZScsIChtZXNzYWdlOiBWTE1TZXR0aW5nc0V2ZW50KSA9PiB7XHJcbiAgICAgICAgVkxNRGVidWcubG9nKCdldmVudCcsICdTY2VuZSBTZXR0aW5nIFVwZGF0ZWQhJywgbWVzc2FnZSlcclxuICAgICAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTVNldHRpbmdzRXZlbnQnLCBtZXNzYWdlKVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5zY2VuZVJvb20ub25NZXNzYWdlKCdnaXZlYXdheV9jbGFpbV9yZXNwb25zZScsIChtZXNzYWdlOiBWTE1DbGFpbUV2ZW50KSA9PiB7XHJcbiAgICAgICAgVkxNRGVidWcubG9nKCdldmVudCcsICdDbGFpbSByZXNwb25zZSByZWNlaXZlZCcsIG1lc3NhZ2UpXHJcbiAgICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1DbGFpbUV2ZW50JywgeyAuLi5tZXNzYWdlLCBhY3Rpb246ICdnaXZlYXdheV9jbGFpbV9yZXNwb25zZScgfSlcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc2NlbmVSb29tLm9uTWVzc2FnZSgncmVxdWVzdF9wbGF5ZXJfcG9zaXRpb24nLCAobWVzc2FnZTogVkxNUGxheWVyUG9zaXRpb24pID0+IHtcclxuICAgICAgICBWTE1EZWJ1Zy5sb2coJ2V2ZW50JywgJ1BsYXllciBQb3NpdGlvbiBSZXF1ZXN0ZWQnLCBtZXNzYWdlKVxyXG4gICAgICAgIHRoaXMuc2NlbmVSb29tLnNlbmQoJ3NlbmRfcGxheWVyX3Bvc2l0aW9uJywge1xyXG4gICAgICAgICAgcG9zaXRpb25EYXRhOiBWTE1QYXRoTWFuYWdlci5nZXRQYXRoUG9pbnQoKSxcclxuICAgICAgICAgIHVzZXJJZDogdGhpcy5zZXNzaW9uVXNlcj8uc2ssXHJcbiAgICAgICAgICBjb25uZWN0ZWRXYWxsZXQ6IHRoaXMuc2Vzc2lvblVzZXI/LmNvbm5lY3RlZFdhbGxldCxcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5zY2VuZVJvb20uc2VuZCgnc2Vzc2lvbl9zdGFydCcsIHRoaXMuc2Vzc2lvbkRhdGEpXHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIFZMTURlYnVnLmxvZygnZXJyb3InLCAnRVJST1IgUkVHSVNURVJJTkcgRVZFTlQgTElTVEVORVJTJywgZSlcclxuICAgICAgdGhyb3cgZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHNlbmRNZXNzYWdlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKGlkOiBzdHJpbmcsIGRhdGE6IGJvb2xlYW4gfCBzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfCBBcnJheTx1bmtub3duPikgPT4ge1xyXG4gICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1Vc2VyTWVzc2FnZScsIHsgaWQsIGRhdGEsIHR5cGU6ICdvdXRib3VuZCcgfSlcclxuICB9XHJcblxyXG4gIHN0YXRpYyBvbk1lc3NhZ2U6IENhbGxhYmxlRnVuY3Rpb24gPSAoaWQ6IHN0cmluZywgY2FsbGJhY2s6IENhbGxhYmxlRnVuY3Rpb24pID0+IHtcclxuICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMuZW1pdCgnVkxNVXNlck1lc3NhZ2UnLCB7IGlkLCBkYXRhOiBjYWxsYmFjaywgdHlwZTogJ2luYm91bmQnIH0pXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc2V0U3RhdGU6IENhbGxhYmxlRnVuY3Rpb24gPSAoaWQ6IHN0cmluZywgZGF0YTogYm9vbGVhbiB8IHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IEFycmF5PHVua25vd24+KSA9PiB7XHJcbiAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTVVzZXJNZXNzYWdlJywgeyBpZCwgZGF0YSwgdHlwZTogJ3NldFN0YXRlJyB9KVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGdldFN0YXRlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKGlkOiBzdHJpbmcsIGRhdGE6IGJvb2xlYW4gfCBzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfCBBcnJheTx1bmtub3duPikgPT4ge1xyXG4gICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1Vc2VyTWVzc2FnZScsIHsgaWQsIGRhdGEsIHR5cGU6ICdnZXRTdGF0ZScgfSlcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzZXRQbGF5ZXJTdGF0ZTogQ2FsbGFibGVGdW5jdGlvbiA9IChpZDogc3RyaW5nLCBkYXRhOiBib29sZWFuIHwgc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHwgQXJyYXk8dW5rbm93bj4pID0+IHtcclxuICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMuZW1pdCgnVkxNVXNlck1lc3NhZ2UnLCB7IGlkLCBkYXRhLCB0eXBlOiAnc2V0UGxheWVyU3RhdGUnIH0pXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZ2V0UGxheWVyU3RhdGU6IENhbGxhYmxlRnVuY3Rpb24gPSAoaWQ6IHN0cmluZywgZGF0YTogYm9vbGVhbiB8IHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IEFycmF5PHVua25vd24+KSA9PiB7XHJcbiAgICBWTE1FdmVudE1hbmFnZXIuZXZlbnRzLmVtaXQoJ1ZMTVVzZXJNZXNzYWdlJywgeyBpZCwgZGF0YSwgdHlwZTogJ2dldFBsYXllclN0YXRlJyB9KVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJlY29yZEFjdGlvbjogQ2FsbGFibGVGdW5jdGlvbiA9IChpZDogc3RyaW5nLCBkYXRhOiBib29sZWFuIHwgc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHwgQXJyYXk8dW5rbm93bj4pID0+IHtcclxuICAgIFZMTUV2ZW50TWFuYWdlci5ldmVudHMuZW1pdCgnVkxNU2Vzc2lvbkFjdGlvbicsIGlkLCBkYXRhKVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGdldFBsYXllcnNJblNjZW5lOiBDYWxsYWJsZUZ1bmN0aW9uID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3QgcGxheWVycyA9IFtdXHJcbiAgICBmb3IgKGNvbnN0IFtlbnRpdHksIGRhdGEsIHRyYW5zZm9ybV0gb2YgZWNzLmVuZ2luZS5nZXRFbnRpdGllc1dpdGgoZWNzLlBsYXllcklkZW50aXR5RGF0YSwgZWNzLlRyYW5zZm9ybSkpIHtcclxuICAgICAgcGxheWVycy5wdXNoKHsgZW50aXR5LCBkYXRhLCB0cmFuc2Zvcm0gfSlcclxuICAgIH1cclxuICAgIHJldHVybiBwbGF5ZXJzXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZ2V0VXNlcklkc0luU2NlbmU6IENhbGxhYmxlRnVuY3Rpb24gPSBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCB1c2VySWRzID0gW11cclxuICAgIGZvciAoY29uc3QgW2VudGl0eSwgZGF0YSwgdHJhbnNmb3JtXSBvZiBlY3MuZW5naW5lLmdldEVudGl0aWVzV2l0aChlY3MuUGxheWVySWRlbnRpdHlEYXRhLCBlY3MuVHJhbnNmb3JtKSkge1xyXG4gICAgICB1c2VySWRzLnB1c2goZGF0YS51c2VySWQpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdXNlcklkc1xyXG4gIH1cclxufVxyXG4iXX0=