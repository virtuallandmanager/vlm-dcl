import { VLMPathClientEvent, VLMPathServerEvent, VLMSceneMessage, VLMSessionAction, VLMSessionEvent, VLMSoundStateEvent, VLMUserMessage, VLMVideoStatusEvent, VLMWidgetInitEvent, VLMWitnessedAction } from "../components/VLMSystemEvents.component";
import { VLMEventManager } from "./VLMSystemEvents.logic";
import { Room } from "colyseus.js";
import { VLMSceneManager } from "./VLMScene.logic";
import { VLMSession } from "../components/VLMSession.component";
import { getPlayerData, getPlayersInScene } from "@decentraland/Players";
import { VLMTimer } from "../components/VLMTimer.component";
import { VLMPathManager } from "./VLMPath.logic";
import { VLMModerationManager, VLMNotificationManager, VLMSessionManager, VLMWidgetManager } from "./index";
import { VLMVideo } from "../components/VLMVideo.component";
import { VLMSound } from "../components/VLMSound.component";

export abstract class VLMEventListeners {
  static inboundMessageFunctions: { [uuid: string]: CallableFunction } = {};
  static sceneRoom: Room;
  static sessionData: VLMSession.Config;
  static sessionUser: VLMSession.User;
  static init: CallableFunction = () => {
    try {
      this.sceneRoom = VLMSessionManager.sceneRoom;
      this.sessionData = VLMSessionManager.sessionData;
      this.sessionUser = VLMSessionManager.sessionUser;

      onIdleStateChangedObservable.add(({ isIdle }) => {
        if (isIdle) {
          //IDLE
          VLMPathManager.idle = true;
          VLMEventManager.events.fireEvent(new VLMSessionAction("Went Idle"));
          VLMPathManager.startIdleSegment();
        } else {
          //ACTIVE
          const ent = new Entity();
          const delay = new VLMTimer.Delay(1000, () => {
            if (VLMPathManager.idle) {
              VLMPathManager.idle = false;
              VLMEventManager.events.fireEvent(new VLMSessionAction("Became Active"));
              VLMPathManager.startNewSegment();
            }
            engine.removeEntity(ent);
          });
          ent.addComponent(delay);
          engine.addEntity(ent);
        }
      });

      onPointerLockedStateChange.add(({ locked }) => {
        if (locked) {
          VLMPathManager.engaged = true;
          VLMPathManager.startStationaryEngaged();
          VLMEventManager.events.fireEvent(new VLMSessionAction("Engaged Cursor"));
        } else {
          VLMPathManager.engaged = false;
          VLMPathManager.startStationaryDisengaged();
          VLMEventManager.events.fireEvent(new VLMSessionAction("Disengaged Cursor"));
        }
      });

      const input = Input.instance;

      // Start Movement events
      input.subscribe("BUTTON_DOWN", ActionButton.FORWARD, false, (e) => {
        VLMPathManager.updateMovingState("w", true);
      });
      input.subscribe("BUTTON_DOWN", ActionButton.BACKWARD, false, (e) => {
        VLMPathManager.updateMovingState("s", true);
      });
      input.subscribe("BUTTON_DOWN", ActionButton.LEFT, false, (e) => {
        VLMPathManager.updateMovingState("a", true);
      });
      input.subscribe("BUTTON_DOWN", ActionButton.RIGHT, false, (e) => {
        VLMPathManager.updateMovingState("d", true);
      });
      input.subscribe("BUTTON_DOWN", ActionButton.WALK, false, (e) => {
        VLMPathManager.updateMovingState("shift", true);
      });
      input.subscribe("BUTTON_DOWN", ActionButton.JUMP, false, (e) => {
        VLMEventManager.events.fireEvent(new VLMSessionAction("Player Jumped"));
      });
      // End Movement events
      input.subscribe("BUTTON_UP", ActionButton.FORWARD, false, (e) => {
        VLMPathManager.updateMovingState("w", false);
      });
      input.subscribe("BUTTON_UP", ActionButton.BACKWARD, false, (e) => {
        VLMPathManager.updateMovingState("s", false);
      });
      input.subscribe("BUTTON_UP", ActionButton.LEFT, false, (e) => {
        VLMPathManager.updateMovingState("a", false);
      });
      input.subscribe("BUTTON_UP", ActionButton.RIGHT, false, (e) => {
        VLMPathManager.updateMovingState("d", false);
      });
      input.subscribe("BUTTON_UP", ActionButton.WALK, false, (e) => {
        VLMPathManager.updateMovingState("shift", false);
      });

      onPlayerExpressionObservable.add(({ expressionId }) => {
        log(`VLM | SESSION ACTION: Emote triggered - ${expressionId}`);
        const custom = expressionId.indexOf("0x") > -1;
        VLMEventManager.events.fireEvent(new VLMSessionAction("Emote Used", { emote: expressionId, custom }));
      });

      onPlayerClickedObservable.add((clickEvent) => {
        VLMEventManager.events.fireEvent(new VLMSessionAction("Viewed A User Profile", clickEvent));

        log("VLM | SESSION ACTION: Viewed A User Profile", clickEvent.userId);
      });

      onPlayerConnectedObservable.add(async ({ userId }) => {
        if (VLMPathManager.engaged || VLMPathManager.moving) {
          let user = await getPlayerData({ userId });
          let otherPlayers = await getPlayersInScene();
          log("VLM | SESSION ACTION: Witnessed Connection", userId);

          VLMEventManager.events.fireEvent(new VLMWitnessedAction(`Witnessed ${user?.displayName || "Someone"} Connect`, { userId, otherPlayers }));
        }
      });

      onPlayerDisconnectedObservable.add(async ({ userId }) => {
        if (VLMPathManager.engaged || VLMPathManager.moving) {
          let otherPlayers = await getPlayersInScene();
          let user = await getPlayerData({ userId });

          log("VLM | SESSION ACTION: Witnessed Disconnection", userId);
          VLMEventManager.events.fireEvent(new VLMWitnessedAction(`Witnessed ${user?.displayName || "Someone"} Disconnect`, { userId, otherPlayers }));
        }
      });

      onEnterSceneObservable.add(async ({ userId }) => {
        if (!this.sessionUser?.connectedWallet) {
          return;
        }
        let otherPlayers = await getPlayersInScene();
        if (userId == this.sessionUser?.connectedWallet) {
          log("VLM | SESSION ACTION: Player Entered Scene Boundaries", userId);
          VLMEventManager.events.fireEvent(new VLMSessionAction("Player Entered Scene Boundaries", { userId, otherPlayers }));
        } else if (VLMPathManager.moving || VLMPathManager.engaged) {
          log("VLM | SESSION ACTION: Witnessed Player Enter Scene Boundaries", userId);
          let user = await getPlayerData({ userId });
          VLMEventManager.events.fireEvent(new VLMSessionAction(`Witnessed ${user?.displayName || "Someone"} Enter Scene`, { userId, otherPlayers, witness: this.sessionUser.connectedWallet }));
        }
      });

      onLeaveSceneObservable.add(async ({ userId }) => {
        if (!this.sessionUser?.connectedWallet) {
          return;
        }
        let otherPlayers = await getPlayersInScene();
        if (userId == this.sessionUser?.connectedWallet) {
          VLMEventManager.events.fireEvent(new VLMSessionAction("Left Scene Boundaries", { userId, otherPlayers }));
        } else if (VLMPathManager.moving || VLMPathManager.engaged) {
          let user = await getPlayerData({ userId });
          VLMEventManager.events.fireEvent(new VLMSessionAction(`Witnessed ${user?.displayName || "Someone"} Leave Scene`, { userId, otherPlayers, witness: this.sessionUser.connectedWallet }));
        }
      });



      VLMEventManager.events.addListener(VLMSessionAction, null, ({ action, metadata }) => {
        if (this.sessionData?.sessionToken) {
          let pathPoint = VLMPathManager.getPathPoint();
          this.sceneRoom.send("session_action", { action, metadata, pathPoint, sessionToken: this.sessionData.sessionToken });
          log("VLM - LOGGED ANALYTICS ACTION - ", action, pathPoint, metadata);
        }
      });

      VLMEventManager.events.addListener(VLMSoundStateEvent, null, ({ elementData, userId }) => {
        const id = elementData.sk;
        log(userId, this.sessionUser, id, VLMSound.configs[id]);
        if (userId == this.sessionUser.sk) {
          VLMSound.configs[id].toggleLocators();
        }
      });

      VLMEventManager.events.addListener(VLMPathClientEvent, null, (message: VLMPathClientEvent) => {
        log("VLM: Triggered client path event", message);

        switch (message.action) {
          case "path_start":
            this.sceneRoom.send("path_start", { session: this.sessionData });
            break;
          case "path_segments_add":
            this.sceneRoom.send("path_segments_add", message);
            break;
        }
      });

      VLMEventManager.events.addListener(VLMPathServerEvent, null, (message: VLMPathServerEvent) => {
        switch (message.action) {
          case "path_started":
            log("VLM - PATH STARTED MESSAGE", message)
            const pathIds = this.sessionData.paths;
            if (message.pathId && pathIds && pathIds.indexOf(message.pathId) < 0) {
              pathIds.push(message.pathId);
            }
            VLMPathManager.startPath(message);
            break;
          case "path_segments_added":
            VLMPathManager.trimStoredSegments(message);
            break;
        }
      });

      VLMEventManager.events.addListener(VLMSceneMessage, null, (message: VLMSceneMessage) => {
        log("VLM - MESSAGE RECEIVED FROM SERVER", message);
        switch (message.action) {
          case "init":
            VLMSceneManager.initScenePreset(message);
            break;
          case "create":
            log("VLM - CREATE");
            message.instance === true ? VLMSceneManager.createSceneElementInstance(message) : VLMSceneManager.createSceneElement(message);
            break;
          case "update":
            log("VLM - UPDATE");
            message.instance === true ? VLMSceneManager.updateSceneElementInstance(message) : VLMSceneManager.updateSceneElement(message);
            break;
          case "delete":
            log("VLM - DELETE");
            message.instance === true ? VLMSceneManager.deleteSceneElementInstance(message) : VLMSceneManager.deleteSceneElement(message);
            break;
        }
      });

      VLMEventManager.events.addListener(VLMVideoStatusEvent, null, (message: VLMVideoStatusEvent) => {
        const videoId = message.sk;
        if (!videoId) {
          return;
        }

        const videoConfig = VLMVideo.configs[videoId];

        if (videoConfig?.liveSrc == message.url) {
          log("VLM - VIDEO STATE CHANGED", message);
          videoConfig.setLiveState(message.status);
        } else if (videoConfig) {
          this.sceneRoom.send("scene_video_update", { ...message, reason: "url_changed" });
        }
      });

      VLMEventManager.events.addListener(VLMWidgetInitEvent, null, async (initEvent: VLMWidgetInitEvent) => {
        await VLMWidgetManager.configureWidgets(initEvent.configs);
      });

      this.sceneRoom.onLeave(() => {
        VLMPathManager.endPath();
      });

      this.sceneRoom.onMessage("session_started", (message: VLMSessionEvent) => {
        this.sessionData = message.session;
        if (!this.sessionData?.sessionStart) {
          this.sessionData.sessionStart = Date.now();
        }
        new VLMPathManager();
      });

      this.sceneRoom.onMessage("user_message", (message: VLMUserMessage) => {
        VLMEventManager.events.fireEvent(new VLMUserMessage(message));
      });

      VLMEventManager.events.addListener(VLMUserMessage, null, async (message: VLMUserMessage) => {
        if (message?.type == "inbound") {
          log("VLM - MESSAGE RECEIVED FROM USER", message)
          this.inboundMessageFunctions[message.id]?.(message.data);
        } else if (message?.type == "outbound") {
          this.sceneRoom.send("user_message", message);
        } else if (message?.type == "getState") {
          this.sceneRoom.send("get_user_state", message);
        } else if (message?.type == "setState") {
          this.sceneRoom.send("set_user_state", message);
        }
      })

      this.sceneRoom.onMessage("path_segments_added", (message: VLMPathServerEvent) => {
        VLMEventManager.events.fireEvent(new VLMPathServerEvent(message));
      });

      this.sceneRoom.onMessage("path_segments_added", (message: VLMPathServerEvent) => {
        VLMEventManager.events.fireEvent(new VLMPathServerEvent(message));
      });

      this.sceneRoom.onMessage("path_started", (message: VLMPathServerEvent) => {
        log("VLM - PATH STARTED MESSAGE RECEIVED! Line 282", message)
        VLMEventManager.events.fireEvent(new VLMPathServerEvent(message));
      });

      this.sceneRoom.onMessage("scene_sound_locator", (message: VLMSoundStateEvent) => {
        VLMEventManager.events.fireEvent(new VLMSoundStateEvent(message));
      });

      this.sceneRoom.onMessage("show_sound_locators", (message: VLMPathServerEvent) => {
        VLMEventManager.events.fireEvent(new VLMPathServerEvent(message));
      });

      this.sceneRoom.onMessage("scene_preset_update", (message: VLMSceneMessage) => {
        if (message.action) {
          VLMEventManager.events.fireEvent(new VLMSceneMessage(message));
        }
      });

      this.sceneRoom.onMessage("scene_moderator_message", (config: { message: string; color: string; fontSize: number; delay: number; }) => {
        VLMNotificationManager.addMessage(config.message, { ...config })
      });

      this.sceneRoom.onMessage("scene_moderator_crash", (user: { walletAddress: string, displayName: string }) => {
        VLMModerationManager.setCrashUser(user);
      });

      this.sceneRoom.onMessage("scene_video_status", (message: VLMVideoStatusEvent) => {
        log("Video State Changed!", message);
        VLMEventManager.events.fireEvent(new VLMVideoStatusEvent(message));
      });

      this.sceneRoom.send("session_start", this.sessionData);
    } catch (e) {
      log("VLM - ERROR - ERROR REGISTERING EVENT LISTENERS", e);
      throw e;
    }
  };

  static sendMessage: CallableFunction = (id: string, data: boolean | string | number | Object | Array<unknown>) => {
    VLMEventManager.events.fireEvent(new VLMUserMessage({ id, data, type: "outbound" }));
  }

  static onMessage: CallableFunction = (id: string, callback: CallableFunction) => {
    VLMEventManager.events.fireEvent(new VLMUserMessage({ id, data: callback, type: "inbound" }))
  }

  static setState: CallableFunction = (id: string, data: boolean | string | number | Object | Array<unknown>) => {
    VLMEventManager.events.fireEvent(new VLMUserMessage({ id, data, type: "setState" }));
  }

  static getState: CallableFunction = (id: string, data: boolean | string | number | Object | Array<unknown>) => {
    VLMEventManager.events.fireEvent(new VLMUserMessage({ id, data, type: "getState" }));
  }

  
  static recordAction: CallableFunction = (id: string, data: boolean | string | number | Object | Array<unknown>) => {
    VLMEventManager.events.fireEvent(new VLMSessionAction(id, data));
  }
}
