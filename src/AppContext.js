import { createContext, useState } from "react";

const seekerPosition = null;
const setSeekerPosition = () =>{};
const sourceAndTiming=null
const setSourceAndTiming = ()=>{}
const currentSourceAndTiming=null;
const setCurrentSourceAndTiming=()=>{};
const isPlaying=null;
const setIsPlaying=()=>{};

const AppContext = createContext({
  seekerPosition: seekerPosition,
  setSeekerPosition: setSeekerPosition,
  sourceAndTiming: sourceAndTiming,
  setSourceAndTiming: setSourceAndTiming,
  currentSourceAndTiming: currentSourceAndTiming,
  setCurrentSourceAndTiming: setCurrentSourceAndTiming,
  isPlaying: isPlaying,
  setIsPlaying: setIsPlaying,
});

export default AppContext;
