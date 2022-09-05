export class Sound extends Entity {
  clip: AudioClip;
  source: AudioSource;
  loops: boolean;

  constructor(_url: string, _loops?: boolean) {
    super();
    this.clip = new AudioClip(_url);
    this.source = new AudioSource(this.clip);
    this.loops = !!_loops;
    this.addComponent(this.source);
  }

  play: CallableFunction = () => {
    if (this.loops) {
      this.source.loop = this.loops;
      this.source.playing = true;
    } else {
      this.source.playOnce();
    }
  };
  stop: CallableFunction = () => {
    this.source.playing = false;
  };
}

export class Stream extends Entity {
  source: AudioStream;

  constructor(_url: string) {
    super();
    this.source = new AudioStream(_url);
    this.addComponent(this.source);
  }

  play: CallableFunction = () => {
    if (this.getComponentOrNull(AudioStream)) {
      this.getComponent(AudioStream).playing = true;
    }
  };
  stop: CallableFunction = () => {
    if (this.getComponentOrNull(AudioStream)) {
      this.getComponent(AudioStream).playing = false;
    }
  };
}
