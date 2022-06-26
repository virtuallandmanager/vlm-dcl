import { isPreviewMode } from "@decentraland/EnvironmentAPI";
import { getUserData } from "@decentraland/Identity";
import { getParcel } from "@decentraland/ParcelIdentity";
import { signedFetch } from "@decentraland/SignedFetch";

export function startAnalytics() {
  onPlayerConnectedObservable.add((player) => {
    recordEvent("player_connected", player);
  });

  onPlayerDisconnectedObservable.add((player) => {
    recordEvent("player_disconnected", player);
  });

  onEnterSceneObservable.add((player) => {
    recordEvent("player_entered_scene", player);
  });

  // shows player left scene
  onLeaveSceneObservable.add((player) => {
    recordEvent("player_left_scene", player);
  });

  // // idle
  // onIdleStateChangedObservable.add(({ isIdle }) => {
  //   // log("Idle State change: ", isIdle)
  //    if(isIdle) recordEvent("idle_state_true", isIdle)
  //    else recordEvent("idle_state_false", isIdle)
  // })

  // player animation
  onPlayerExpressionObservable.add(({ expressionId }) => {
    recordEvent("player_expression", expressionId);
  });
}

export async function recordEvent(eventType: any, metadata: any) {
  log("recording event", eventType);
  // getting parcel info
  executeTask(async () => {
    const parcel = await getParcel();
    // log('parcels: ', parcel.land.sceneJsonData.scene.parcels)
    const parcels = parcel.land.sceneJsonData.scene.parcels;

    // log('spawnpoints: ', parcel.land.sceneJsonData.spawnPoints)
    const spawnpoints = parcel.land.sceneJsonData.spawnPoints;

    // log('base parcel: ', parcel.land.sceneJsonData.scene.base)
    const baseParcel = parcel.land.sceneJsonData.scene.base;
    const sceneJsonData = parcel.land.sceneJsonData;

    let ispreview = await isPreviewMode();
    let BASE_URL = "https://analytics.dcl-vlm.io/record-event";
    //let BASE_URL = ispreview ? "http://localhost:7999/api/tracking/record-event" : "https://lkdcl.co/api/tracking/record-event"

    if (ispreview) {
      return;
    }
    getUserData().then(async (data) => {
      const player = data;
      //let body = JSON.stringify({"tag": tag, "player": player, "data":metadata, scene: {spawnpoints, parcels, baseParcel, sceneJsonData}})
      //log('body is', body)
      let res = await signedFetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ eventType: eventType, player: player, data: metadata, scene: { spawnpoints, parcels, baseParcel, sceneJsonData } })
      });
      let json;
      if (res.text) {
        json = JSON.parse(res.text);
      }
      log("json is", json);
    });
  });
}
