import React, { useEffect } from "react";
import { usePlayer } from "../Player.context";
import styles from "./Progress.module.css";

const Progress = () => {
  const { playHead, duration, progress, resetPlayHead, shifter } = usePlayer();

  const onClick = (event) => {
    const { target, pageX } = event;

    if (!shifter) {

      return;
    }

    if (duration !== "0:00" && target !== "skipp") {
      const pos = target.getBoundingClientRect();
      const relX = pageX - pos.x;
      const perc = relX / target.offsetWidth;
      console.log("🚀 ~ onClick ~ perc:", perc);
      resetPlayHead(perc);
    } else if (target === "skipp") {
      console.log("🚀 ~ onClick ~ target:", target);
      resetPlayHead(0.4169921875);
    }
  };

  // useEffect(() => {
  //   let inter;
  //   let count = 0;

  //   const handleInterval = () => {
  //     count++;
  //     console.log("🚀 ~ inter ~ count:", count);
  //     if (count > 20) {
  //       onClick({ target: "skipp", pageX: 0 });
  //     }
  //   };

  //   setTimeout(() => {
  //     inter = setInterval(handleInterval, 1000);
  //   }, 10000);

  //   return () => {
  //     clearInterval(inter);
  //   };
  // }, []);

  return (
    <div className={"progress"}>
      <span>{playHead}</span>
      <progress
        onClick={onClick}
        className={"progress"}
        id="progressMeter"
        value={progress}
        max="100"
      />
      <span className={"duration"}>{duration}</span>
    </div>
  );
};

export default Progress;