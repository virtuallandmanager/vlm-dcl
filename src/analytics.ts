import { isPreviewMode } from "@decentraland/EnvironmentAPI";
import { getUserData } from "@decentraland/Identity";
import { getParcel } from "@decentraland/ParcelIdentity";
import { signedFetch } from "@decentraland/SignedFetch";
import { getPlayersInScene } from "@decentraland/Players";
import { Delay } from "./components/delay";
import { userData, userWallet } from "./helpers/user";

export const initAnalytics = () => {
  getPlayersInScene().then((players) => {
    updateConnections(players);
  });

  onPlayerConnectedObservable.add((player) => {
    let delay = new Entity();
    delay.addComponent(
      new Delay(5000, () => {
        recordEvent("player_connected", player);
        engine.removeEntity(delay);
      })
    );
    engine.addEntity(delay);
  });

  onPlayerDisconnectedObservable.add((player) => {
    recordEvent("player_disconnected", player);
  });

  onEnterSceneObservable.add((player) => {
    log("player entered scene: ", player.userId);
    if (player.userId == userWallet) {
      recordEvent("player_entered_scene", player);
    }
  });

  onLeaveSceneObservable.add((player) => {
    if (player.userId == userWallet) {
      recordEvent("player_left_scene", player);
    }
  });

  // // idle
  // onIdleStateChangedObservable.add(({ isIdle }) => {
  //   // log("Idle State change: ", isIdle)
  //    if(isIdle) recordEvent("idle_state_true", isIdle)
  //    else recordEvent("idle_state_false", isIdle)
  // })

  onPlayerExpressionObservable.add(({ expressionId }) => {
    recordEvent("player_expression", expressionId);
  });
};

export const recordEvent = async (eventType: any, metadata: any) => {
  log("recording event", eventType);

  const parcel = await getParcel();
  log("parcels: ", parcel.land.sceneJsonData.scene.parcels);
  const parcels = parcel.land.sceneJsonData.scene.parcels;

  log("spawnpoints: ", parcel.land.sceneJsonData.spawnPoints);
  const spawnpoints = parcel.land.sceneJsonData.spawnPoints;

  log("base parcel: ", parcel.land.sceneJsonData.scene.base);
  const baseParcel = parcel.land.sceneJsonData.scene.base;

  let isPreview = await isPreviewMode();
  let BASE_URL = isPreview ? "http://localhost:3001/record-event" : "https://analytics.dcl-vlm.io/record-event";

  await getUserData();

  let body = JSON.stringify({ eventType: eventType, player: userData, data: metadata, scene: { spawnpoints, parcels, baseParcel } });

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
};

export const updateConnections = async (players: any) => {
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

  await getUserData();

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
};
