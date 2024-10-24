import { VLM } from './app';
import { VLMVideo, VLMImage, VLMSound, VLMWidget, QuickVideoScreen, QuickImage, QuickSound, QuickMesh, VLMMesh, QuickNull, QuickNullConfig, QuickVideoConfig, QuickImageConfig, QuickMeshConfig, QuickSoundConfig } from './components/index';
import 'xmlhttprequest-polyfill';
import { QuickDanceFloor, QuickDanceFloorConfig } from './components/VLMDanceFloor.component';
import { ReactEcsRenderer } from './services/UI.service';
interface VideoConfig extends VLMVideo.Config {
}
interface VideoInstanceConfig extends VLMVideo.Instance {
}
interface ImageConfig extends VLMImage.Config {
}
interface ImageInstanceConfig extends VLMImage.Instance {
}
interface MeshConfig extends VLMMesh.Config {
}
interface MeshInstanceConfig extends VLMMesh.Instance {
}
interface SoundConfig extends VLMSound.Config {
}
interface SoundInstanceConfig extends VLMSound.Instance {
}
interface WidgetConfig extends VLMWidget.Config {
}
declare namespace QuickCreator {
    class SceneParent extends QuickNull {
        constructor(config: QuickNullConfig);
    }
    class VideoScreen extends QuickVideoScreen {
        constructor(config: QuickVideoConfig);
    }
    class Image extends QuickImage {
        constructor(config: QuickImageConfig);
    }
    class Mesh extends QuickMesh {
        constructor(config: QuickMeshConfig);
    }
    class Sound extends QuickSound {
        constructor(config: QuickSoundConfig);
        play: CallableFunction;
    }
    class DanceFloor extends QuickDanceFloor {
        constructor(config: QuickDanceFloorConfig);
    }
}
export default VLM;
export { VLM, ReactEcsRenderer, QuickCreator, VideoConfig, VideoInstanceConfig, ImageConfig, ImageInstanceConfig, MeshConfig, MeshInstanceConfig, SoundConfig, SoundInstanceConfig, WidgetConfig, };
//# sourceMappingURL=index.d.ts.map