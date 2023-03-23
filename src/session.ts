import { getParcel } from "@decentraland/ParcelIdentity";
import { signedFetch } from "@decentraland/SignedFetch";
import { getUser } from "./helpers/user";
import * as Colyseus from "colyseus.js";
import { VLMSceneJsonData } from "./app";
import { TDCLUser } from "./types/DCLUser";
import { AppEnvironment } from "./environment";
import { PathSystem } from "./systems/pathSystem";
import { VLMInterval } from "./components/interval";
import { getPlatform } from "@decentraland/EnvironmentAPI";
import { TDCLSession, TDCLSessionData } from "./types/DCLSession";

export class DCLSession implements TDCLSession {
  sessionUser: TDCLUser;
  sessionData: TDCLSessionData;
  client: Colyseus.Client;
  room: Colyseus.Room;
  sessionStart: number;
  sessionEnd: number;
  pathSystem: PathSystem;
  connecting: boolean;
  connected: boolean;
  playerPathId: string;
  socketConnector: Entity;

  start: CallableFunction = async () => {
    this.client = new Colyseus.Client(AppEnvironment.wssUrl);
    const { session, user } = await this.requestToken();
    log("VLM sesh ", session, user);
    this.sessionData = session;
    this.sessionUser = user;

    // try {
    if (session) {
      this.room = await this.openAuthenticatedSocket(this.sessionData);
    }
    this.bindEvents();
    this.sessionStart = Date.now();
    this.pathSystem = new PathSystem(this.sessionData, this.room);
    // } catch (e) {
    //   log("VLM ERROR! :", e, this.room);
    // }
  };

  end: CallableFunction = async () => {
    if (this.room) {
      this.room.send("end_session", {
        session: this.sessionData,
      });
      this.room.leave(true);
      this.pathSystem.clear();
    }
  };

  getGameData: CallableFunction = async () => {
    const [userData, parcel, platform] = await Promise.all([
      getUser(),
      getParcel(),
      getPlatform(),
    ]);

    const sceneJsonData: VLMSceneJsonData = parcel.land.sceneJsonData,
      baseParcel = sceneJsonData.scene.base,
      sceneId = sceneJsonData.vlmScene?.sceneId,
      player = userData ? (({ avatar, ...data }) => data)(userData) : {};
    return { baseParcel, player, sceneId, platform };
  };

  requestToken: CallableFunction = async () => {
    const gameData = await this.getGameData();
    let body = JSON.stringify({
      ...gameData,
    });

    try {
      let res = await signedFetch(`${AppEnvironment.apiUrl}/auth/dcl`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      let json;
      if (res.text) {
        json = JSON.parse(res.text);
      }
      return json;
    } catch (error) {
      throw error;
    }
  };

  openAuthenticatedSocket: CallableFunction = async (
    session?: TDCLSessionData
  ) => {
    try {
      const [userData, parcel] = await Promise.all([getUser(), getParcel()]);

      const sceneJsonData: VLMSceneJsonData = parcel.land.sceneJsonData,
        baseParcel = sceneJsonData.scene.base,
        sceneId = sceneJsonData.vlmScene?.sceneId,
        player = userData ? (({ avatar, ...data }) => data)(userData) : {};

      this.client = new Colyseus.Client(AppEnvironment.wssUrl);
      log(this.client);

      const room = await this.client.joinOrCreate("vlm_scene", {
        sceneId,
        ...player,
        baseParcel,
        ...session,
      });

      if (room) {
        this.room = room;
        this.connected = true;
        this.connecting = false;
      }

      return room;
    } catch (e) {
      log(e);
      throw e;
    }
  };

  reconnect: CallableFunction = () => {
    this.connecting = false;
    this.connected = false;
    this.socketConnector = new Entity();
    engine.addEntity(this.socketConnector);
    this.socketConnector.addComponent(
      new VLMInterval(10000, async () => {
        if (
          this.connecting &&
          this.socketConnector.getComponentOrNull(VLMInterval)
        ) {
          this.socketConnector.removeComponent(VLMInterval);
          return;
        }
        log("Attempting to reconnect to multiplayer server");
        await this.openAuthenticatedSocket(this);
      })
    );
  };

  logAnalyticsEvent: CallableFunction = (eventType: string, metadata: any) => {
    this.pathSystem.logAnalyticsEvent(eventType, metadata);
  };

  bindEvents: CallableFunction = () => {
    this.room.onMessage("session_started_message", (session) => {
      this.room.sessionId = session.sk;
    });

    onIdleStateChangedObservable.add(({ isIdle }) => {
      log("VLM EVENT: Idle state changed");
      if (isIdle) {
        log(`VLM EVENT: went idle`);
        this.logAnalyticsEvent("became_idle");
        this.end();
      } else {
        log(`VLM EVENT: went active`);
        this.logAnalyticsEvent("became_active");
        // end tracking of idle time? or start new session with original token?
        if (!this.connected && !this.connecting) {
          this.start();
        }
      }
    });

    onPlayerExpressionObservable.add(({ expressionId }) => {
      log(`VLM EVENT: emote triggered - ${expressionId}`);
      // recordEvent("emote", expressionId);
    });

    onPlayerDisconnectedObservable.add(({ userId }) => {
      log(`VLM EVENT: ${userId} disconnected.`);

      if ((userId = this.sessionUser.userId)) {
        this.end();
      }
    });

    onPlayerConnectedObservable.add(({ userId }) => {
      log(`VLM EVENT: ${userId} connected.`);
      if (!this.connected && !this.connecting) {
        this.start();
      }
    });

    onEnterSceneObservable.add(({ userId }) => {
      log(`VLM EVENT: ${userId} entered scene.`);
      if (!this.connected && !this.connecting) {
        this.start();
      }
    });

    onLeaveSceneObservable.add(({ userId }) => {
      log(`VLM EVENT: ${userId} left scene.`);
      this.end();
    });
  };
}

// socket.onopen = (ev) => {
//   log("connected to web socket");
//   connected = true;
//   connecting = false;
//   socket.send(JSON.stringify({ action: "init" }));

//   if (socketConnector) {
//     socketConnector.removeComponent(VLMInterval);
//     engine.removeEntity(socketConnector);
//   }

//   let socketdelay = new Entity();
//   engine.addEntity(socketdelay);
//   socketdelay.addComponent(
//     new VLMInterval(10000, () => {
//       if (
//         socketdelay.getComponentOrNull(VLMInterval) &&
//         (!connected || connecting)
//       ) {
//         socketdelay.removeComponent(VLMInterval);
//         engine.removeEntity(socketdelay);
//         return;
//       }
//       log("Pinging web socket...");
//       socket.send(JSON.stringify({ command: "ping" }));
//     })
//   );
// };
// if (!socket) {
//   reconnect();
//   return;
// }

// socket.onclose = (event) => {
//   log("socket closed");
//   reconnect();
// };
// const reconnect = () => {
//   connecting = false;
//   connected = false;
//   socketConnector = new Entity();
//   engine.addEntity(socketConnector);
//   socketConnector.addComponent(
//     new VLMInterval(10000, async () => {
//       if (connecting && socketConnector.getComponentOrNull(VLMInterval)) {
//         socketConnector.removeComponent(VLMInterval);
//         return;
//       }
//       log("Attempting to reconnect to websocket");
//       // await connectCMS();
//     })
//   );
// };
