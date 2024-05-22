import React from "react";
import { PlayerProvider } from "./Player.context";
import LoadButton from "./components/LoadButton.component";
import Player from "./components/Player.component";
import "./styles.css";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioCtx.createGain();

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <PlayerProvider {...{ audioCtx, gainNode }}>
        <LoadButton />
        <Player />
      </PlayerProvider>
    </div>
  );
}
