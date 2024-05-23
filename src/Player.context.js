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
  let arr = []
  const newShifter = buffer => {
    let bufferSize = 16384;
    const myShifter = new PitchShifter(audioCtx, buffer, bufferSize);
    myShifter.tempo = tempo;
    myShifter.pitch = pitch;
    myShifter.on("play", onPlay);
    myShifter._node.onaudioprocess = function (event) {
      let left = event.outputBuffer.getChannelData(0);
      let right = event.outputBuffer.getChannelData(1);
      let remainingFrames = buffer.length - myShifter._filter.sourcePosition;
      let framesToProcess = Math.min(bufferSize, remainingFrames);
      arr.push(myShifter._filter.sourcePosition)
      console.log("🚀 ~ newShifter ~ arr:", arr)

      let samples = new Float32Array(bufferSize * 2);
      let framesExtracted = myShifter._filter.extract(samples, framesToProcess);
      onUpdateShifter(myShifter, myShifter._filter.sourcePosition);
      if (framesExtracted < bufferSize) {
        //If we have less samples than buffer size, than collect the remaining from the begining of the audio
        let framesRemaining = bufferSize - framesExtracted;
        myShifter._filter.sourcePosition = 0;
        arr = []
        let extraSamples = new Float32Array(framesRemaining * 2);
        myShifter._filter.extract(extraSamples, framesRemaining);

        // Copy the smaples of the end of audio
        for (let i = 0; i < framesExtracted; i++) {
          left[i] = samples[i * 2];
          right[i] = samples[i * 2 + 1];
        }
        //Copy the samples from the begining of audio
        for (let i = 0; i < framesRemaining; i++) {
          left[framesExtracted + i] = extraSamples[i * 2];
          right[framesExtracted + i] = extraSamples[i * 2 + 1];
        }
      } else {
        // Normal processing
        for (let i = 0; i < bufferSize; i++) {
          left[i] = samples[i * 2];
          right[i] = samples[i * 2 + 1];
        }
      }
    };

    setDuration(myShifter.formattedDuration);
    setShifter(myShifter);
  };
  useEffect(() => {
    playAudio();
  }, [shifter])
  const onPause = () => {

    console.log("🚀 ~ onPause ~ onPause:", onPause)
    if (!audioComplete)
      setAudioComplete(true); // Use the state setter to update audioComplete
  };

  const onLoadFromFile = ({ target: { result: buffer } }) => {
    if (shifter) {
      shifter.off();
    }
    if (buffer) {
      console.log("🚀 ~ onLoadFromFile ~ buffer:", buffer)
      audioCtx.decodeAudioData(buffer).then(audioBuffer => {
        newShifter(audioBuffer);
      });
    }
    setLoading(false);
  };

  const loadFile = file => {
    setLoading(true);
    const fileReader = new FileReader();
    fileReader.onload = onLoadFromFile;
    try {
      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      alert(err);
    }
  };



  const onLoad = (arrayBuffer) => {
    console.log("🚀 ~ onLoad ~ arrayBuffer:", arrayBuffer)
    if (shifter) {
      shifter.off();
    }
    if (arrayBuffer) {
      audioCtx.decodeAudioData(arrayBuffer)
        .then(audioBuffer => {
          newShifter(audioBuffer);
          setLoading(false);


        })
        .catch(err => {
          console.error('Error decoding audio data:', err);
          alert('Error decoding audio data');
          setLoading(false);
        });
    } else {
      alert('Error: ArrayBuffer is null or undefined');
      setLoading(false);
    }
  };

  const loadFileFromAssets = async (filePath) => {
    setLoading(true);
    try {
      fetch(filePath)
        .then(response => {
          return response.arrayBuffer()
        })
        .then(data => {
          onLoad(data);
        })
        .catch(error => {
          console.error('Error loading audio:', error);
        });

    } catch (err) {
      console.error('Error fetching file:', err);
      alert('Error fetching file');
      setLoading(false);
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
    loadFileFromAssets,
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