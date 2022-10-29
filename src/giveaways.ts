// import * as ui from "@dcl/ui-scene-utils";
import { signedFetch } from "@decentraland/SignedFetch";
import { runLocalServer, runStagingServer } from "./environment";

let API_BASE_URL = "https://api.dcl-vlm.io/nft";

if (runLocalServer) {
  API_BASE_URL = "http://localhost:3000/nft";
} else if (runStagingServer) {
  API_BASE_URL = "https://staging-api.dcl-vlm.io/nft";
}

export const giveawayClaim = async (claimAction: string) => {
  try {
    let res = await signedFetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ claimAction })
    });

    let json;
    if (res.text) {
      json = JSON.parse(res.text);
      // ui.displayAnnouncement(json.text, 5, Color4.Teal(), 50);
    }
  } catch (error) {
    log("Not valid", error);
    // ui.displayAnnouncement("Something went wrong, please try again.", 5, Color4.Red(), 50);
  }
};
