import { VLMPathClientEvent, VLMPathServerEvent, VLMSceneMessage, VLMSessionAction, VLMSessionEvent, VLMSoundStateEvent, VLMVideoStatusEvent, VLMWitnessedAction } from "src/components/VLMSystemEvents.component";
import { VLMEventManager } from "./VLMSystemEvents.logic";
import { Room } from "colyseus.js";
import { VLMSceneManager } from "./VLMScene.logic";
import { VLMSession } from "src/components/VLMSession.component";
import { getPlayerData, getPlayersInScene } from "@decentraland/Players";
import { VLMTimer } from "src/components/VLMTimer.component";
import { VLMPathManager } from "./VLMPath.logic";
import { VLMSessionManager, VLMSoundManager } from "./index";
import { VLMVideo } from "src/components/VLMVideo.component";
import { VLMSound } from "src/components/VLMSound.component";

export abstract class VLMEventListeners {
  static sceneRoom: Room;
  static sessionData: VLMSession.Config;
  static sessionUser: VLMSession.User;
  static init: CallableFunction = () => {
    this.sceneRoom = VLMSessionManager.sceneRoom;
    this.sessionData = VLMSessionManager.sessionData;
    this.sessionUser = VLMSessionManager.sessionUser;

    VLMEventManager.events.addListener(VLMSessionAction, null, ({ action, metadata }) => {
      if (this.sessionData?.sessionToken) {
        let pathPoint = VLMPathManager.getPathPoint();
        this.sceneRoom.send("session_action", { action, metadata, pathPoint, sessionToken: this.sessionData.sessionToken });
      }
    });

    VLMEventManager.events.addListener(VLMSoundStateEvent, null, ({ elementData, userId }) => {
      const id = elementData.sk;
      log(userId, this.sessionUser, id, VLMSound.configs[id])
      // if (userId == this.sessionUser) {
        VLMSound.configs[id].toggleLocators()
      // }
    });

    onIdleStateChangedObservable.add(({ isIdle }) => {
      log("VLM EVENT: Idle state changed", isIdle);
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

        VLMEventManager.events.fireEvent(new VLMWitnessedAction(`Witnessed ${user.displayName || "Someone"} Connect`, { userId, otherPlayers }));
      }
    });

    onPlayerDisconnectedObservable.add(async ({ userId }) => {
      if (VLMPathManager.engaged || VLMPathManager.moving) {
        let otherPlayers = await getPlayersInScene();
        let user = await getPlayerData({ userId });

        log("VLM | SESSION ACTION: Witnessed Disconnection", userId);
        VLMEventManager.events.fireEvent(new VLMWitnessedAction(`Witnessed ${user.displayName || "Someone"} Disconnect`, { userId, otherPlayers }));
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
        VLMEventManager.events.fireEvent(new VLMSessionAction(`Witnessed ${user.displayName || "Someone"} Enter Scene`, { userId, otherPlayers, witness: this.sessionUser.connectedWallet }));
      }
    });

    onLeaveSceneObservable.add(async ({ userId }) => {
      if (!this.sessionUser?.connectedWallet) {
        return;
      }
      let otherPlayers = await getPlayersInScene();
      if (userId == this.sessionUser?.connectedWallet) {
        log("VLM | SESSION ACTION: Player Left Scene Boundaries", userId);
        VLMEventManager.events.fireEvent(new VLMSessionAction("Left Scene Boundaries", { userId, otherPlayers }));
      } else if (VLMPathManager.moving || VLMPathManager.engaged) {
        log("VLM | SESSION ACTION: Witnessed Player Leave Scene Boundaries", userId);
        let user = await getPlayerData({ userId });
        VLMEventManager.events.fireEvent(new VLMSessionAction(`Witnessed ${user.displayName || "Someone"} Leave Scene`, { userId, otherPlayers, witness: this.sessionUser.connectedWallet }));
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
        case "path_end":
          this.sceneRoom.send("path_end", message);
          break;
      }
    });

    VLMEventManager.events.addListener(VLMPathServerEvent, null, (message: VLMPathServerEvent) => {
      log("VLM: Triggered server path event", message);

      switch (message.action) {
        case "path_started":
          log("VLM: Started new path");
          const pathIds = this.sessionData.paths;
          if (message.pathId && pathIds.indexOf(message.pathId) < 0) {
            pathIds.push(message.pathId);
          }
          VLMPathManager.pathId = message.pathId;
          VLMPathManager.pathStarted = true;
          VLMPathManager.startNewSegment();
          break;
        case "path_segments_added":
          VLMPathManager.trimStoredSegments(message);
          break;
      }
    });

    VLMEventManager.events.addListener(VLMSceneMessage, null, (message: VLMSceneMessage) => {
      log("VLM Received Message from Server", message);
      switch (message.action) {
        case "init":
          VLMSceneManager.initScenePreset(message);
          break;
        case "create":
          VLMSceneManager.createSceneElement(message);
          break;
        case "update":
          log("updating");
          VLMSceneManager.updateSceneElement(message);
          break;
        case "delete":
          VLMSceneManager.deleteSceneElement(message);
          break;
      }
    });

    VLMEventManager.events.addListener(VLMVideoStatusEvent, null, (message: VLMVideoStatusEvent) => {
      const videoConfig = VLMVideo.configs[message.sk];

      if (videoConfig?.liveLink == message.url) {
        log("VLM: Received Video Status Update", message);
        videoConfig.setLiveState(message.status);
      } else if (videoConfig) {
        this.sceneRoom.send("scene_video_update", { ...message, reason: "url_changed" });
      }
    });

    this.sceneRoom.onLeave((message) => {
      VLMPathManager.endPath();
    });

    // this.sceneRoom.onMessage("*", (message: VLMSceneMessage) => {
    //   if (message.action) {
    //     VLMEventManager.events.fireEvent(new VLMSceneMessage(message));
    //   }
    // });

    this.sceneRoom.onMessage("session_started", (message: VLMSessionEvent) => {
      log("VLM Session Started!", message);
      this.sessionData = message.session;
      if (this.sessionData?.sessionStart) {
        VLMPathManager.startPath();
      }
    });

    this.sceneRoom.onMessage("path_segments_added", (message: VLMPathServerEvent) => {
      VLMEventManager.events.fireEvent(new VLMPathServerEvent(message));
    });

    this.sceneRoom.onMessage("path_started", (message: VLMPathServerEvent) => {
      VLMEventManager.events.fireEvent(new VLMPathServerEvent(message));
    });

    this.sceneRoom.onMessage("scene_sound_locator", (message: VLMSoundStateEvent) => {
      log('got message', message)
      VLMEventManager.events.fireEvent(new VLMSoundStateEvent(message));
    });

    this.sceneRoom.onMessage("show_sound_locators", (message: VLMPathServerEvent) => {
      VLMEventManager.events.fireEvent(new VLMPathServerEvent(message));
    });

    this.sceneRoom.onMessage("scene_preset_update", (message: VLMSceneMessage) => {
      log("Message received!", message);
      if (message.action) {
        VLMEventManager.events.fireEvent(new VLMSceneMessage(message));
      }
    });

    this.sceneRoom.onMessage("scene_video_status", (message: VLMVideoStatusEvent) => {
      log("Video State Changed!", message);
      VLMEventManager.events.fireEvent(new VLMVideoStatusEvent(message));
    });

    this.sceneRoom.send("session_start", this.sessionData);
  };
}
