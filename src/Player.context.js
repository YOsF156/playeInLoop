import React, { createContext, useMemo, useState, useContext, useEffect } from "react";
import { PitchShifter } from "soundtouchjs";

export const PlayerContext = createContext();

export const PlayerProvider = ({ audioCtx, gainNode, ...props }) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [tempo, setTempo] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [semitone, setSemitone] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [playHead, setPlayHead] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const [shifter, setShifter] = useState();
  const [finishToPlay, setFinishToPlay] = useState(false);
  const [audioComplete, setAudioComplete] = useState(false); // New state for audioComplete

  const value = useMemo(
    () => ({
      loading,
      setLoading,
      playing,
      setPlaying,
      tempo,
      setTempo,
      pitch,
      setPitch,
      semitone,
      setSemitone,
      volume,
      setVolume,
      playHead,
      setPlayHead,
      duration,
      setDuration,
      progress,
      setProgress,
      audioCtx,
      gainNode,
      shifter,
      setShifter,
      finishToPlay,
      setFinishToPlay,
      audioComplete, // Include audioComplete in the context value
      setAudioComplete // Include the setter for audioComplete
    }),
    [
      loading,
      setLoading,
      playing,
      setPlaying,
      tempo,
      setTempo,
      pitch,
      setPitch,
      semitone,
      setSemitone,
      volume,
      setVolume,
      playHead,
      setPlayHead,
      duration,
      setDuration,
      progress,
      setProgress,
      audioCtx,
      gainNode,
      shifter,
      setShifter,
      finishToPlay,
      setFinishToPlay,
      audioComplete,
      setAudioComplete
    ]
  );

  return <PlayerContext.Provider value={value} {...props} />;
};

export const usePlayer = () => {
  const {
    loading,
    setLoading,
    playing,
    setPlaying,
    tempo,
    setTempo,
    pitch,
    setPitch,
    semitone,
    setSemitone,
    volume,
    setVolume,
    playHead,
    setPlayHead,
    duration,
    setDuration,
    progress,
    setProgress,
    audioCtx,
    gainNode,
    shifter,
    setShifter,
    finishToPlay,
    setFinishToPlay,
    audioComplete,
    setAudioComplete // Retrieve the audioComplete state and setter
  } = useContext(PlayerContext);

  const onPlay = ({ formattedTimePlayed, percentagePlayed }) => {
    setPlayHead(formattedTimePlayed);
    setProgress(percentagePlayed);

    if (percentagePlayed >= 100) {
      setFinishToPlay(true);
    } else {
      setFinishToPlay(false);
    }
  };
  const onUpdateShifter = function (thisShifter, sourcePosition) {
    const currentTimePlayed = thisShifter.timePlayed;
    const sampleRate = thisShifter.sampleRate;
    thisShifter.sourcePosition = sourcePosition;
    thisShifter.timePlayed = sourcePosition / sampleRate;
    if (currentTimePlayed !== thisShifter.timePlayed) {
      const timePlayed = new CustomEvent('play', {
        detail: {
          timePlayed: thisShifter.timePlayed,
          formattedTimePlayed: thisShifter.formattedTimePlayed,
          percentagePlayed: thisShifter.percentagePlayed
        }
      });
      thisShifter._node.dispatchEvent(timePlayed);
    }
  };
  const newShifter = buffer => {
    let bufferSize = 1024;
    const myShifter = new PitchShifter(audioCtx, buffer, bufferSize, onEnd);
    myShifter.tempo = tempo;
    myShifter.pitch = pitch;
    myShifter.on("play", onPlay);
    function onEnd() {
      // Reset position to the start without adding silence
      myShifter._filter.sourcePosition = 0;
      // myShifter._node.dispatchEvent(new Event('play')); // Trigger play event to restart playback
    }
    //const samples = new Float32Array(bufferSize * 2);
    let donePlaying = false;
    // myShifter._node.onaudioprocess = event => {
    //   if (donePlaying) {
    //     onEnd();
    //     donePlaying = false;
    //     return;
    //   }
    //   let left = event.outputBuffer.getChannelData(0);
    //   let right = event.outputBuffer.getChannelData(1);
    //   let remainingFrames = buffer.length - myShifter._filter.sourcePosition;
    //   let framesToProcess = Math.min(bufferSize, remainingFrames);
    //   let framesExtracted = myShifter._filter.extract(samples, framesToProcess);
    //   onUpdateShifter(myShifter, myShifter._filter.sourcePosition);
    //   if (framesExtracted < bufferSize) {
    //     donePlaying = true;
    //   }
    //   let i = 0;
    //   for (; i < framesExtracted; i++) {
    //     left[i] = samples[i * 2];
    //     right[i] = samples[i * 2 + 1];
    //   }
    // };


    // myShifter._node.onaudioprocess = function (event) {
    //   console.log("🚀 ~ newShifter ~ event:", event)
    //   let left = event.outputBuffer.getChannelData(0);
    //   let right = event.outputBuffer.getChannelData(1);
    //   let remainingFrames = buffer.length - myShifter._filter.sourcePosition;
    //   let framesToProcess = Math.min(bufferSize, remainingFrames);

    //   // Extract frames to process
    //   let framesExtracted = myShifter._filter.extract(new Float32Array(bufferSize * 2), framesToProcess);

    //   // If we've reached the end of the buffer
    //   if (framesExtracted < bufferSize) {
    //     for (let i = 0; i < framesExtracted; i++) {
    //       left[i] = myShifter._filter.outputBuffer.vector[i * 2];
    //       right[i] = myShifter._filter.outputBuffer.vector[i * 2 + 1];
    //     }
    //     onEnd(); // Trigger the end of playback
    //   } else {
    //     for (let i = 0; i < bufferSize; i++) {
    //       left[i] = myShifter._filter.outputBuffer.vector[i * 2];
    //       right[i] = myShifter._filter.outputBuffer.vector[i * 2 + 1];
    //     }
    //   }
    // };
    setDuration(myShifter.formattedDuration);
    setShifter(myShifter);
  };

  const onPause = () => {

    console.log("🚀 ~ onPause ~ onPause:", onPause)
    if (!audioComplete)
      setAudioComplete(true); // Use the state setter to update audioComplete
  };

  const onLoad = ({ target: { result: buffer } }) => {
    if (shifter) {
      shifter.off();
    }
    if (buffer) {
      audioCtx.decodeAudioData(buffer).then(audioBuffer => {
        newShifter(audioBuffer);
      });
    }
    setLoading(false);
  };

  const loadFile = file => {
    setLoading(true);
    const fileReader = new FileReader();
    fileReader.onload = onLoad;
    try {
      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      alert(err);
    }
  };

  const playAudio = () => {
    if (shifter) {
      // fireInterval();
      setPlaying(true);
      shifter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      audioCtx.resume();
    }
  };

  let interval1 = null;
  const fireInterval = () => {
    // if (!interval1) {
    //   interval1 = setInterval(() => {
    //     console.log("🚀  interval1=setInterval  shifter:", shifter);
    //     console.log("🚀  interval1=setInterval  shifter:", shifter.percentagePlayed);
    //     console.log("🚀 ~ interval1=setInterval ~ audioComplete:", audioComplete)
    //     if (audioComplete) {
    //       setAudioComplete(false); // Reset the state instead of the local variable
    //       shifter.percentagePlayed = 0;
    //       //clearInterval(interval1)
    //     }
    //   }, 20);
    // }
  };
  // useEffect(() => {
  //   if (shifter && shifter.percentagePlayed == 100) {
  //     shifter.percentagePlayed = 0.00;
  //     setAudioComplete(false)
  //   }
  // }, [audioComplete])
  // useEffect(() => {
  //   console.log("🚀 ~ useEffect ~ shifter.percentagePlayed:", shifter?.percentagePlayed)
  //   if (shifter && shifter.percentagePlay >= 96) {
  //     console.log(shifter)
  //     shifter.percentagePlayed = 0.50;
  //   }
  // }, [progress])
  const pauseAudio = (isPlaying = false) => {
    if (shifter) {
      setProgress(0);
      shifter.disconnect();
      !isPlaying && setPlaying(false);
    }
  };

  const resetPlayHead = perc => {
    //pauseAudio(playing);
    if (shifter) {
      shifter.percentagePlayed = perc;
      //setPlayHead(shifter.timePlayed);
    }
    setProgress(100 * perc);
    if (playing) {
      playAudio();
    }
  };

  return {
    loading,
    playing,
    duration,
    tempo,
    pitch,
    semitone,
    volume,
    playHead,
    progress,
    loadFile,
    play: playAudio,
    pause: pauseAudio,
    changeVolume: ({ target: { value } }) => {
      setVolume(value);
      gainNode.gain.volume = value;
    },
    changeSemitone: ({ target: { value } }) => {
      setSemitone(value);
      if (shifter) {
        shifter.pitchSemitones = value;
      }
    },
    changePitch: ({ target: { value } }) => {
      setPitch(value);
      if (shifter) {
        shifter.pitch = value;
      }
    },
    changeTempo: ({ target: { value } }) => {
      setTempo(value);
      if (shifter) {
        shifter.tempo = value;
      }
    },
    resetPlayHead,
    shifter
  };
};