import * as utils from "@dcl/ecs-scene-utils";
import { isPreviewMode } from "@decentraland/EnvironmentAPI";
import { getUserData } from "@decentraland/Identity";
import { getParcel } from "@decentraland/ParcelIdentity";
import { signedFetch } from "@decentraland/SignedFetch";
import { user } from "./helpers/user";
import { getPlayersInScene } from "@decentraland/Players";

export function initAnalytics() {
  getPlayersInScene().then((players) => {
    updateConnections(players);
  });

  onPlayerConnectedObservable.add((player) => {
    // log("player entered: ", player.userId)
    let delay = new Entity();
    delay.addComponent(
      new utils.Delay(5000, () => {
        recordEvent("player_connected", player);
        engine.removeEntity(delay);
      })
    );
    engine.addEntity(delay);
  });

  onPlayerDisconnectedObservable.add((player) => {
    // log("player left: ", player.userId)
    recordEvent("player_disconnected", player);
  });

  onEnterSceneObservable.add((player) => {
    log("player entered scene: ", player.userId);
    if (player.userId == user) {
      recordEvent("player_entered_scene", player);
    }
  });

  // shows player left scene
  onLeaveSceneObservable.add((player) => {
    // log("player left scene: ", player.userId)
    if (player.userId == user) {
      recordEvent("player_left_scene", player);
    }
  });

  // // idle
  // onIdleStateChangedObservable.add(({ isIdle }) => {
  //   // log("Idle State change: ", isIdle)
  //    if(isIdle) recordEvent("idle_state_true", isIdle)
  //    else recordEvent("idle_state_false", isIdle)
  // })

  // player animation
  onPlayerExpressionObservable.add(({ expressionId }) => {
    // log("Expression: ", expressionId)

    recordEvent("player_expression", expressionId);
  });

  // // fetch player data
  // getUserData().then((data) => {
  //   // log(data)
  //   recordEvent("user_data", data)
  // })
}

export async function recordEvent(eventType: any, metadata: any) {
  log("recording event", eventType);
  // getting parcel info
  // executeTask(async () => {
  const parcel = await getParcel();
  log("parcels: ", parcel.land.sceneJsonData.scene.parcels);
  const parcels = parcel.land.sceneJsonData.scene.parcels;

  log("spawnpoints: ", parcel.land.sceneJsonData.spawnPoints);
  const spawnpoints = parcel.land.sceneJsonData.spawnPoints;

  log("base parcel: ", parcel.land.sceneJsonData.scene.base);
  const baseParcel = parcel.land.sceneJsonData.scene.base;
  const sceneJsonData = parcel.land.sceneJsonData;

  let ispreview = await isPreviewMode();
  // let BASE_URL = "https://analytics.dcl-vlm.io/record-event";
  let BASE_URL = ispreview ? "http://localhost:3001/record-event" : "https://analytics.dcl-vlm.io/record-event";

  getUserData().then(async (data) => {
    const player = data;
    let body = JSON.stringify({ eventType: eventType, player: player, data: metadata, scene: { spawnpoints, parcels, baseParcel } });
    log("body is", body);
    try {
      let res = await signedFetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body
      });
      let json;
      if (res.text) {
        json = JSON.parse(res.text);
      }
      log("json is", json);
    } catch (error) {
      log(error);
    }
  });
  // });
}

export async function updateConnections(players: any) {
  // getting parcel info
  // executeTask(async () => {
  const parcel = await getParcel();
  log("parcels: ", parcel.land.sceneJsonData.scene.parcels);
  const parcels = parcel.land.sceneJsonData.scene.parcels;

  log("spawnpoints: ", parcel.land.sceneJsonData.spawnPoints);
  const spawnpoints = parcel.land.sceneJsonData.spawnPoints;

  log("base parcel: ", parcel.land.sceneJsonData.scene.base);
  const baseParcel = parcel.land.sceneJsonData.scene.base;
  const sceneJsonData = parcel.land.sceneJsonData;

  let ispreview = await isPreviewMode();
  // let BASE_URL = "https://analytics.dcl-vlm.io/record-event";
  let BASE_URL = ispreview ? "http://localhost:3001/update-connections" : "https://analytics.dcl-vlm.io/update-connections";

  getUserData().then(async (data) => {
    const player = data;
    let body = JSON.stringify({ players: players, scene: { spawnpoints, parcels, baseParcel } });
    log("body is", body);
    try {
      let res = await signedFetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body
      });
      let json;
      if (res.text) {
        json = JSON.parse(res.text);
      }
      log("json is", json);
    } catch (error) {
      log(error);
    }
  });
  // });
}
