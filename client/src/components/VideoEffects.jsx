import React from 'react'
import AppContext from '../AppContext'

const VideoEffects = () => {
    const { selectedElement, sourceAndTiming, setSourceAndTiming } =
      useContext(AppContext);
    const currentSourceAndTiming = sourceAndTiming.find(
      (item) => item.id === selectedElement.id
    );

    const nextSourceAndTiming = sourceAndTiming.find(
      (item) =>
        currentSourceAndTiming &&
        item.trackNum === currentSourceAndTiming.trackNum &&
        currentSourceAndTiming.newEnd - item.newStart <= 1 &&
        currentSourceAndTiming.newEnd - item.newStart >= 0 &&
        item.id !== selectedElement.id
    );

    const handleMorph = ()=>{
        const currentVideo = document.getElementsByClassName(`${selectedElement.id}-preview`)
        currentVideo[0].style.width = nextSourceAndTiming.size.width;
        currentVideo[0].style.height = nextSourceAndTiming.size.height;
        currentVideo[0].style.transform = `translate(${nextSourceAndTiming.position.x, nextSourceAndTiming.position.y})`;
        currentVideo[0].style.transition = "all 2s ease-in-out";
    }
  return (
    <div className='panel'>
        <div className="media-container">
            <div className="media-item">
                <span onClick={handleMorph()}>Morph</span>
            </div>
        </div>
    </div>
  )
}

export default VideoEffects