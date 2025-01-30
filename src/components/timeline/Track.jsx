import React, { useEffect, useState } from "react";
import { getMediaSrcAndType } from "../../utils/getMediaSrcAndType";
import { Rnd } from "react-rnd";

const Track = ({ sourceAndTiming, setSourceAndTiming, selectedElement, setSelectedElement, isSplit, setIsSplit }) => {
  const [elements, setElements] = useState([]); // Store element IDs
  const [trackMedia, setTrackMedia] = useState([]); // Store media data
  const [positions, setPositions] = useState({}); // Store positions and sizes
  const [isDraggable, setIsDraggable] = useState(true);

  const handleDrop = (e) => {
    e.preventDefault();
    const { src, mediaType, duration } = getMediaSrcAndType(e);
    const id = Date.now();
    const trackRect = e.target.getBoundingClientRect();
    const x = e.clientX - trackRect.left; // Position relative to the track
    const y = 0; // Fixed y-coordinate
    const width = duration * 10; // Default width based on duration

    // Check for overlap
    const isOverlapping = checkOverlap(
      { left: x, right: x + width },
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
          start: x * 0.1,
          newStart: x * 0.1,
          end: x * 0.1 + Number(duration),
          newEnd: x * 0.1 + Number(duration),
          position: { x: 0, y: 0 },
          size: { width: 400, height: 225 },
          trackX: x,
          mediaType:mediaType
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

                newStart: newX * 0.1 + (item.newStart - item.start),
                start: newX * 0.1,
                newEnd:
                  newX * 0.1 +
                  duration +
                  (item.end - item.newEnd),
                end:
                  newX * 0.1 +
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

    // Calculate the new duration based on the width
    let newStart = Math.ceil(0.1 * newX);
    let newEnd = newStart + newWidth / 10;
    let isInvalid = false;
    sourceAndTiming.forEach((source) => {
      if (source.id === id) {
        console.log(
          "<<newend ",
          newEnd,
          "new start",
          newStart,
          "source start",
          source.start,
          "source end ",
          source.end
        );
        newStart = newStart < source.start ? source.start : newStart;
        newEnd = newEnd > source.end ? source.end : newEnd;
        // console.log("newend ", newEnd, "newstart", newStart);

        if(newStart - source.start < 0 || source.end - newEnd < 0){
          isInvalid = true;
          // return;
        }
      }
    });
    console.log("<<updated newend ", newEnd, "newstart", newStart);

    // if(isInvalid){
    //   return;
    // }
    // if(newEnd > sourceAndTiming[id].end){
    //   return;
    // }
    const newDuration = Math.ceil(newEnd - newStart); // Assuming 10px = 1 second
    if(newDuration <= 0){
      return;
    }
    const isOverlapping = checkOverlap(
      { left: newX, right: newX + newWidth },
      elements,
      positions,
      id
    );

    if (isOverlapping) {
      // Snap back to the original size and position
      setPositions((prev) => ({
        ...prev,
        [id]: { ...prev[id] },
      }));
    } else {
      if (isInvalid) {
      // Reset to previous state if resizing goes beyond limits
      setPositions((prev) => ({
        ...prev,
        [id]: { ...prev[id] },
      }));
    }
    else{
      // Update the size and position
      // newX = isInvalid ? positions[id].x : newX;
      setPositions((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          x: newX,
          width: Math.ceil(newEnd - newStart) * 10,
        },
      }));
    }
      // Update the trackMedia duration
      setTrackMedia((prev) =>
        prev.map((track) =>
          track.id === id
            ? {
                ...track,
                duration: newDuration,
              }
            : track
        )
      );

      // Update the sourceAndTiming start and end times
      setSourceAndTiming((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            // const key = String(id);
            return {
              ...item,
              newStart: newStart,
              newEnd: newEnd,
              trackX: positions[id].x
            };
          } else {
            return item;
          }
        })
      );
    }
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
      //  if (!trackMedia.some((m) => m.id === source.id)) {
      tracks.push({
             id: source.id,
             src: source.source,
             mediaType: source.mediaType,
             duration: Number(source.newEnd - source.newStart).toFixed(2),
           })
        //  setTrackMedia((prev) => [
        //    ...prev,
        //    {
        //      id: source.id,
        //      src: source.source,
        //      mediaType: source.mediaType,
        //      duration: Number(source.newEnd - source.newStart).toFixed(2),
        //    },
        //  ]);
      //  }

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
 }, [sourceAndTiming, isSplit]);

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
              width: `${m.duration * 10}px`,
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
