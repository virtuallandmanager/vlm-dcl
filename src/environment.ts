import { isPreviewMode } from "@decentraland/EnvironmentAPI";

export let runLocalServer = false;
export let runStagingServer = false;
export let isPreview = false;

export const useLocal = () => {
  runLocalServer = true;
};

export const useStaging = () => {
  runStagingServer = true;
};

export const checkPreviewMode = async () => {
  isPreview = await isPreviewMode();
};
