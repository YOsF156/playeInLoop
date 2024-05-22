import React, { useState, useEffect } from "react";
import { PitchShifter } from "soundtouchjs";
import PlayButton from "./PlayButton.component";
import PauseButton from "./PauseButton.component";
import Progress from "./Progress.component";
import Tempo from "./Tempo.component";
import Pitch from "./Pitch.component";
import Key from "./Key.component";
import Volume from "./Volume.component";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioCtx.createGain();
let shifter;

const Player = ({ fileName, loading, setLoading }) => {
  const [playing, setPlaying] = useState(false);
  const [tempo, setTempo] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [semitone, setSemitone] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [playHead, setPlayHead] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [progress, setProgress] = useState(0);

  const onPlay = ({ formattedTimePlayed, percentagePlayed }) => {
    setPlayHead(formattedTimePlayed);
    setProgress(percentagePlayed);
  };

  const newShifter = buffer => {
    const myShifter = new PitchShifter(audioCtx, buffer, 16384);
    myShifter.tempo = tempo;
    myShifter.pitch = pitch;
    //myShifter.on("play", onPlay);
    setDuration(myShifter.formattedDuration);
    return myShifter;
  };

  // intentionally not watching changes on
  // values use in newShifter, as those are
  // handled on the fly
  useEffect(() => {
    if (shifter) {
      shifter.off();
    }
    // 'fileName' is actually the audioBuffer
    if (fileName) {
      audioCtx.decodeAudioData(fileName).then(audioBuffer => {
        shifter = newShifter(audioBuffer);
      });
    }
    setLoading(false);
    return () => {
      shifter = null;
    };
  }, [fileName, setLoading]);

  const play = () => {
    if (shifter) {
      shifter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      audioCtx.resume();
      setPlaying(true);
    }
  };

  const pause = (isPlaying = false) => {
    if (shifter) {
      shifter.disconnect();
      !isPlaying && setPlaying(false);
    }
  };

  useEffect(() => {
    if (playing) {
      play();
    } else {
      pause();
    }
  }, [playing]);

  useEffect(() => {
    gainNode.gain.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (shifter) {
      shifter.pitchSemitones = semitone;
    }
  }, [semitone]);

  useEffect(() => {
    if (shifter) {
      shifter.pitch = pitch;
    }
  }, [pitch]);

  useEffect(() => {
    if (shifter) {
      shifter.tempo = tempo;
    }
  }, [tempo]);

  const resetPlayHead = perc => {
    alert("ff")

    pause(playing);
    if (shifter) {
      shifter.percentagePlayed(perc);
    }
    setProgress(100 * perc);
    if (playing) {
      play();
    }
  };
  return (
    <div>
      <PlayButton {...{ fileName, loading, playing, setPlaying }} />
      <PauseButton {...{ fileName, loading, playing, setPlaying }} />
      <Progress
        {...{ playHead, duration, progress }}
        setProgress={resetPlayHead}
      />
      <Tempo {...{ tempo, setTempo }} />
      <Pitch {...{ pitch, setPitch }} />
      <Key {...{ semitone, setSemitone }} />
      <Volume {...{ volume, setVolume }} />
    </div>
  );
};

export default Player;
