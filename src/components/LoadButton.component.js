import React, { Fragment, useEffect } from "react";
import { usePlayer } from "../Player.context";
import styles from "./LoadButton.module.css";
const LoadButton = () => {
  const { loadFile, loadFileFromAssets } = usePlayer();
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

  // useEffect(() => {
  //   loadFileFromAssets("assets/wush_10.wav")
  // }, [])

  return (
    <Fragment>
      <label className={"fileBtn"}>
        <button onClick={() => {
          loadFileFromAssets("assets/wush_10.wav")
        }}>load auoto</button>
        <input type="file" className={"fileField"} onChange={onChange} />{" "}
        Load MP3
      </label>
    </Fragment>
  );
};

export default LoadButton;
