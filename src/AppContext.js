import { createContext, useState } from "react";

const seekerPosition = null;
const setSeekerPosition = () => {};
const sourceAndTiming = null;
const setSourceAndTiming = () => {};
const currentSourceAndTiming = null;
const setCurrentSourceAndTiming = () => {};
const isPlaying = null;
const setIsPlaying = () => {};
const selectedElement = null;
const setSelectedElement = () => {};
const isSpeedChange = null;
const setIsSpeedChange = () => {};

const AppContext = createContext({
  seekerPosition: seekerPosition,
  setSeekerPosition: setSeekerPosition,
  sourceAndTiming: sourceAndTiming,
  setSourceAndTiming: setSourceAndTiming,
  currentSourceAndTiming: currentSourceAndTiming,
  setCurrentSourceAndTiming: setCurrentSourceAndTiming,
  isPlaying: isPlaying,
  setIsPlaying: setIsPlaying,
  selectedElement: selectedElement,
  setSelectedElement: setSelectedElement,
  isSpeedChange: isSpeedChange,
  setIsSpeedChange: setIsSpeedChange,
});

export default AppContext;
