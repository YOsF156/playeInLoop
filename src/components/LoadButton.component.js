import React, { Fragment, useEffect } from "react";
import { usePlayer } from "../Player.context";
import styles from "./LoadButton.module.css";
import sample from "../assets/wush_10.mp3";
const LoadButton = () => {
  const { loadFile } = usePlayer();
  const onChange = ({
    target: {
      files: [file],
      value
    }
  }) => {
    const fileTest = /(.mp3)$/i.test(value);
    if (fileTest) {
      loadFile(file);
    } else {
      window.alert("you can only load an mp3 file");
    }
  };
  // const handleLoad = (fileBlob) => {
  //   console.log("🚀 ~ handleLoad ~ fileBlob:", fileBlob)
  //   loadFile(fileBlob)
  // }
  // useEffect(() => {
  //   // Function to fetch and read the audio file
  //   const loadAudioFile = async () => {
  //     try {
  //       // Fetch the audio file from the public URL
  //       const response = await fetch(process.env.PUBLIC_URL + '/assets/wush_10.mp3');
  //       handleLoad(process.env.PUBLIC_URL + '/assets/wush_10.mp3')
  //       // Check if the response is okay
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok ' + response.statusText);
  //       }

  //       // Convert the response to a Blob
  //       const audioBlob = await response.blob();

  //       // Create a FileReader to read the Blob
  //       const reader = new FileReader();

  //       // Define what happens when the FileReader finishes reading
  //       reader.onloadend = () => {
  //         const arrayBuffer = reader.result;

  //         console.log('ArrayBuffer:', arrayBuffer);
  //         // You can now use the ArrayBuffer (e.g., for audio processing)
  //       };

  //       // Read the Blob as an ArrayBuffer
  //       reader.readAsArrayBuffer(audioBlob);
  //     } catch (error) {
  //       console.error('Error loading audio file:', error);
  //     }
  //   };

  //   // Call the function to load the audio file
  //   loadAudioFile();
  // }, []);
  return (
    <Fragment>
      <label className={"fileBtn"}>
        s
        <input type="file" className={"fileField"} onChange={onChange} />{" "}
        Load MP3
      </label>
    </Fragment>
  );
};

export default LoadButton;
