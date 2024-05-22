import React from "react";
import { usePlayer } from "../Player.context";

const PauseButton = () => {
  const { loading, playing, pause } = usePlayer();
  return (
    <button disabled={loading || !playing} onClick={pause}>
      Pause
    </button>
  );
};

export default PauseButton;
