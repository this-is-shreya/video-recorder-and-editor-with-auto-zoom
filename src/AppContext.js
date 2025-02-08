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
});

export default AppContext;
