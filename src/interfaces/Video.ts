export interface IPlaylist {
  playlist: string[];
  updatePlaylist: CallableFunction;
}

export interface IPlayer {
  startLive: CallableFunction;
  startPlaylist: CallableFunction;
  stop: CallableFunction;
}