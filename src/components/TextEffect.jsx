import React, { useContext } from 'react'
import AppContext from '../AppContext'
import TitleCard1 from './titleCard/titleCard1';
import TitleCard2 from './titleCard/TitleCard2';
import TitleCard3 from './titleCard/TitleCard3';
import TitleCard4 from './titleCard/TitleCard4';
import TitleCard5 from './titleCard/TitleCard5';
import TitleCard6 from './titleCard/TitleCard6';
import TitleCard7 from './titleCard/TitleCard7';
import LowerThird1 from './lowerThird/LowerThird1';
import LowerThird2 from './lowerThird/LowerThird2';
import LowerThird3 from './lowerThird/LowerThird3';
import LowerThird4 from './lowerThird/LowerThird4';
import LowerThird5 from './lowerThird/LowerThird5';
import LowerThird6 from './lowerThird/LowerThird6';
import LowerThird7 from './lowerThird/LowerThird7';
import LowerThird8 from './lowerThird/LowerThird8';

const TextEffect = () => {
    const {currentEffectsAndTiming} = useContext(AppContext)
    console.log("EFFECTS", currentEffectsAndTiming);
    
    if(currentEffectsAndTiming.length == 0 || !currentEffectsAndTiming[0].source.includes("text")){
        return;
    }
    const {source} = currentEffectsAndTiming[0];

  return (
    <>
      {source === "text-title-1" && <TitleCard1 />}
      {source === "text-title-2" && <TitleCard2 />}
      {source === "text-title-3" && <TitleCard3 />}
      {source === "text-title-4" && <TitleCard4 />}
      {source === "text-title-5" && <TitleCard5 />}
      {source === "text-title-6" && <TitleCard6 />}
      {source === "text-title-7" && <TitleCard7 />}
      {source === "text-lower-third-1" && <LowerThird1 />}
      {source === "text-lower-third-2" && <LowerThird2 />}
      {source === "text-lower-third-3" && <LowerThird3 />}
      {source === "text-lower-third-4" && <LowerThird4 />}
      {source === "text-lower-third-5" && <LowerThird5 />}
      {source === "text-lower-third-6" && <LowerThird6 />}
      {source === "text-lower-third-7" && <LowerThird7 />}
      {source === "text-lower-third-8" && <LowerThird8 />}
    </>
  );
}

export default TextEffect