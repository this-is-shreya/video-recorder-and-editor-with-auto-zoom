import React, { useContext, useEffect, useState } from "react";
import { getMediaSrcAndType } from "../../utils/getMediaSrcAndType";
import { Rnd } from "react-rnd";
import AppContext from "../../AppContext";

const Track = ({  isSplit, setIsSplit, isDeleteMedia, setIsDeleteMedia }) => {
  const [elements, setElements] = useState([]); // Store element IDs
  const [trackMedia, setTrackMedia] = useState([]); // Store media data
  const [positions, setPositions] = useState({}); // Store positions and sizes
  const [isDraggable, setIsDraggable] = useState(true);
  const {
    isSpeedChange,
    setIsSpeedChange,
    sourceAndTiming,
    setSourceAndTiming,
    selectedElement,
    setSelectedElement,
  } = useContext(AppContext);

  const handleDrop = (e) => {
    e.preventDefault();
    const { src, mediaType, duration } = getMediaSrcAndType(e);
    const id = Date.now();
    const trackRect = e.target.getBoundingClientRect();
    const x = e.clientX - trackRect.left; // Position relative to the track
    const y = 0; // Fixed y-coordinate
    const width = duration * 10; // Default width based on duration
    console.log("x", x);
    
    // Check for overlap
    const isOverlapping = checkOverlap(
      { left: x, right: (x + width) },
      elements,
      positions
    );

    if (!isOverlapping) {
      setElements([...elements, id]);
      setTrackMedia([...trackMedia, { id, src, mediaType, duration }]);
      setPositions((prev) => ({
        ...prev,
        [id]: { x, y, width },
      }));

      setSourceAndTiming((prev) => [
        ...prev,
        {
          id,
          source: src,
          start: (x * 0.1),
          newStart: (x * 0.1),
          speedStart: (x * 0.1),
          end: x*0.1 + Number(duration),
          newEnd: (x * 0.1) + Number(duration),
          speedEnd:(x * 0.1) + Number(duration),
          position: { x: 0, y: 0 },
          size: { width: 400, height: 225 },
          trackX: x,
          mediaType:mediaType,
          borderRadius:"0",
          speed:1
        },
      ]);
    }
  };

  const handleDragStop = (id, e, data) => {
    const newX = data.x;
    const width = positions[id]?.width || 100;
    const isOverlapping = checkOverlap(
      { left: newX, right: newX + width },
      elements,
      positions,
      id
    );

    if (isOverlapping) {
      // Snap back to the original position
      setPositions((prev) => ({
        ...prev,
        [id]: { ...prev[id] },
      }));
    } else {
      // Update position
      setPositions((prev) => ({
        ...prev,
        [id]: { ...prev[id], x: newX },
      }));
      const duration = Number(
        trackMedia.find((m) => m.id === id)?.duration || 0
      );
      setSourceAndTiming((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                speedStart: (newX * 0.1) + (item.speedStart - item.start),
                newStart: (newX * 0.1) + (item.newStart - item.start),
                start: (newX * 0.1),
                speedEnd: (newX * 0.1) + duration + (item.speedEnd - item.end),
                newEnd:
                  (newX * 0.1) +
                  duration +
                  (item.end - item.newEnd),
                end:
                  (newX * 0.1) +
                  duration,
                  trackX: positions[id].x
              }
            : item
        )
      );
    }
  };

  const handleResizeStop = (id, e, direction, ref, delta, position) => {
    const newWidth = ref.offsetWidth; //-10px for width of right handler
    const newX = position.x;
    //rewrite this function, delta gives width and height, 
    // delta.width is negative or positive depending on shrink or expand
    //direction always remains left for left, right for right
    const source = sourceAndTiming.find((item) => item.id === id);

    if(direction === "left"){
      const diff = source.newStart - (delta.width *0.1);
        console.log("start", diff, source.speedStart, source.speedEnd, diff, delta, source.newStart);

      if(diff < source.speedStart || diff > source.speedEnd){
        
        setPositions((prev) => ({
          ...prev,
          [id]: { ...prev[id] },
        }));
        return;
      }
      else{

      
      setPositions((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          x: newX,
          width: prev[id].width + (delta.width),
        },
      }));
      const updatedSourceAndTiming = sourceAndTiming.map((item) => {
        if (item.id === id) {
          return { ...item, newStart: diff, trackX: newX };
        }
        return item;
      });

      setSourceAndTiming(updatedSourceAndTiming);

      setTrackMedia((prev) =>
        prev.map((track) =>
          track.id === id
            ? {
                ...track,
                duration: Math.ceil(positions[id].width * 0.1),
              }
            : track
        )
      );
    }
    }
    else{
      const diff = (source.newEnd / source.speed) + (delta.width *0.1);
        console.log(
          "end",
          diff,
          source.speedStart,
          source.speedEnd,
          delta,
          "new end ",
          source.newEnd
        );

      if(diff < source.speedStart || diff > source.speedEnd){

        setPositions((prev) => ({
          ...prev,
          [id]: { ...prev[id] },
        }));
        return;
      }
      else{

      
      setPositions((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
        
          width: prev[id].width + (delta.width),
        },
      }));
      const updatedSourceAndTiming = sourceAndTiming.map((item) => {
        if (item.id === id) {
          return { ...item, newEnd: diff };
        }
        return item;
      });

      setSourceAndTiming(updatedSourceAndTiming);

      setTrackMedia((prev) =>
        prev.map((track) =>
          track.id === id
            ? {
                ...track,
                duration: Math.ceil(positions[id].width * 0.1),
              }
            : track
        )
      );
      }
    }
    console.log("width ", newWidth, "delta ", delta, "direction", direction, "x", newX);
    
    
  };

  const checkOverlap = (newRect, elements, positions, currentId = null) => {
    for (const id of elements) {
      if (id === currentId) continue; // Skip self
      const rect = positions[id];
      if (
        newRect.left < rect.x + rect.width && // Left edge overlaps
        newRect.right > rect.x // Right edge overlaps
      ) {
        return true; // Overlap detected
      }
    }
    return false; // No overlap
  };

 useEffect(() => {
   if (isSplit) {

    let tracks = []
     sourceAndTiming.forEach((source) => {
      tracks.push({
             id: source.id,
             src: source.source,
             mediaType: source.mediaType,
             duration: Number(source.newEnd - source.newStart),
           })

       if (!elements.includes(source.id)) {
         setElements((prev) => [...prev, source.id]);
       }

       setPositions((prev) => ({
         ...prev,
         [source.id]: {
           x: source.trackX,
           y: 0,
           width: (source.newEnd - source.newStart) * 10,
         },
       }));
     });
     setTrackMedia(tracks);
console.log("split", isSplit,"sourceandtiming is ",sourceAndTiming);

     setIsSplit(false);
   }
   if(isSpeedChange){
    const source = sourceAndTiming.find((item) => item.id === selectedElement);
    setPositions((prev)=>({
      ...prev,
      [selectedElement]: {
           ...prev[selectedElement],
           width: Math.ceil((source.newEnd - source.newStart)*10 / source.speed),
         },
    }))
    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement) {
        const speedEnd = (Math.ceil(item.end - item.start) / item.speed);
        return { ...item, speedEnd: item.speedStart + speedEnd };
      }
      return item;
    });

    setSourceAndTiming(updatedSourceAndTiming);
    setIsSpeedChange(false);
    console.log("s&t", sourceAndTiming, positions);
    
   }

   if(isDeleteMedia){
    let tracks=[]
    sourceAndTiming.forEach((source) => {
      tracks.push({
             id: source.id,
             src: source.source,
             mediaType: source.mediaType,
             duration: Math.ceil(Number(source.newEnd - source.newStart)),
           })
    })
      setPositions((prev) => {
        const { [selectedElement]: removed, ...rest } = prev; // Remove the key matching selectedElement
        return rest;
      });
    // setPositions((prev)=>{return prev.every((item)=>item.id !== selectedElement)});
    setElements((prev)=>{return prev.filter((item)=>item !== selectedElement)});
    setTrackMedia(tracks);
    setIsDeleteMedia(false);
   }
 }, [sourceAndTiming, isSplit, isDeleteMedia]);

  return (
    <div
      className="track"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {trackMedia.map((m) => (
        <Rnd
          key={m.id}
          size={{
            width: positions[m.id]?.width || 100,
            height: 50,
          }}
          position={{
            x: positions[m.id]?.x || 0,
            y: positions[m.id]?.y || 0,
          }}
          bounds=".track"
          enableResizing={{
            left: true,
            right: true,
            top: false,
            bottom: false,
          }}
          disableDragging={!isDraggable}
          onResizeStart={()=>setIsDraggable(false)}
          onDragStop={(e, data) => handleDragStop(m.id, e, data)}
          onResizeStop={(e, direction, ref, delta, position) => {
            handleResizeStop(m.id, e, direction, ref, delta, position);
            setIsDraggable(true)
          }}
        >
          <div
            className="track-video"
            style={{
              width: `${positions[m.id]?.width}px`,
              height: "100%",
              backgroundColor: "rgb(63, 166, 245)",
              borderRadius: "4px",
              position: "absolute",
              border: selectedElement === m.id ? "2px solid red" : "2px solid black",
            }}
            onClick={()=>setSelectedElement(m.id)}
          >
            Video {m.duration}
          </div>
        </Rnd>
      ))}
    </div>
  );
};

export default Track;
