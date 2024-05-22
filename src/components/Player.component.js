import React from "react";
import PlayButton from "./PlayButton.component";
import PauseButton from "./PauseButton.component";
import Progress from "./Progress.component";
import Tempo from "./Tempo.component";
import Pitch from "./Pitch.component";
import Key from "./Key.component";
import Volume from "./Volume.component";

const Player = () => {
  return (
    <div>
      <PlayButton />
      <PauseButton />
      <Progress />
      <Tempo />
      <Pitch />
      <Key />
      <Volume />
    </div>
  );
};

export default Player;
