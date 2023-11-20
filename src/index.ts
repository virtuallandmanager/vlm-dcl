import { VLM } from "./app";
import { VLMVideo, VLMImage, VLMSound, VLMWidget } from "./components/index";
import "xmlhttprequest-polyfill";

// @ts-ignore
import { URL } from "whatwg-url-without-unicode";

// @ts-ignore
globalThis['URL'] = URL;

class VideoConfig extends VLMVideo.Config { }
class VideoInstanceConfig extends VLMVideo.Instance { };
class ImageConfig extends VLMImage.Config { };
class ImageInstanceConfig extends VLMImage.Instance { };
class SoundConfig extends VLMSound.Config { };
class SoundInstanceConfig extends VLMSound.Instance { };
class WidgetConfig extends VLMWidget.Config { };

export default VLM;
export { VLM, VideoConfig, VideoInstanceConfig, ImageConfig, ImageInstanceConfig, SoundConfig, SoundInstanceConfig, WidgetConfig }
