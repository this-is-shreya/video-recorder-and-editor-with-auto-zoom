import { createContext } from "react";

const AppContext = createContext({
  seekerPosition: 0,
  setSeekerPosition: () => {},
  sourceAndTiming: [],
  setSourceAndTiming: () => {},
  currentSourceAndTiming: [],
  setCurrentSourceAndTiming: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  selectedElement: null,
  setSelectedElement: () => {},
  isSpeedChange: false,
  setIsSpeedChange: () => {},
  maxTime: "00:00:00",
  setMaxTime: () => {},
  convertToFormattedTime: () => {},
  videoPlayerRef: null,
  seekerPositionManuallyChanged: false,
  setSeekerPositionManuallyChanged: () => {},
  zoomTimeline: null,
  setZoomTimeline: () => {},
  isSplit: null,
  setIsSplit: () => {},
  isTrim: null,
  setIsTrim: () => {},
});

export default AppContext;
