import React, { useContext, useEffect, useState } from "react";
import { getMediaSrcAndType } from "../../utils/getMediaSrcAndType";
import { Rnd } from "react-rnd";
import AppContext from "../../AppContext";
import { pixels } from "../../utils/PixelsPerSecondEnum";

const Track = ({
  isDeleteMedia,
  setIsDeleteMedia,
  timelineWidth,
  setTimelineWidth,
  trackNum,
}) => {
  const {
    isSpeedChange,
    setIsSpeedChange,
    selectedElement,
    setSelectedElement,
    convertToFormattedTime,
    maxTime,
    setMaxTime,
    sourceAndTiming,
    setSourceAndTiming,
    zoomTimeline,
    isSplit,
    setIsSplit,
    seekerPosition,
  } = useContext(AppContext);
  const [elements, setElements] = useState([]); // Store element IDs
  const [trackMedia, setTrackMedia] = useState([]); // Store media data
  const [positions, setPositions] = useState({}); // Store positions and sizes
  const [isDraggable, setIsDraggable] = useState(true);
  const [prevZoom, setPrevZoom] = useState(zoomTimeline);

  const handleDrop = (e) => {
    e.preventDefault();
    const { src, mediaType, duration } = getMediaSrcAndType(e);
    const id = Date.now();
    const trackRect = e.target.getBoundingClientRect();
    const x = e.clientX - trackRect.left; // Position relative to the track
    const y = 0; // Fixed y-coordinate
    const width = duration * pixels[zoomTimeline]; // Default width based on duration
    console.log("x", x);

    // Check for overlap
    const isOverlapping = checkOverlap(
      { left: x, right: x + width },
      elements,
      positions
    );
    console.log("OVERLAPPING ", isOverlapping);

    if (!isOverlapping) {
      setElements([...elements, { id: id, trackNum: trackNum }]);
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
          start: Math.floor(x / pixels[zoomTimeline]),
          newStart: Math.floor(x / pixels[zoomTimeline]),
          speedStart: Math.floor(x / pixels[zoomTimeline]),
          end: Math.floor(x / pixels[zoomTimeline]) + Number(duration),
          newEnd: Math.floor(x / pixels[zoomTimeline]) + Number(duration),
          speedEnd: Math.floor(x / pixels[zoomTimeline]) + Number(duration),
          position: { x: 0, y: 0 },
          size: { width: "30vw", height: "35vh" },
          trackX: x,
          mediaType: mediaType,
          borderRadius: "0",
          speed: 1,
          zoomCenter: prev.zoomCenter ? prev.zoomCenter : { x: 0, y: 0 },
          zoomStart: prev.zoomStart ? prev.zoomStart : null,
          zoomDuration: prev.zoomDuration ? prev.zoomDuration : 0,
          zoomLevel: prev.zoomLevel ? prev.zoomLevel : 1,
          startsFrom: 0,
          volume: 1,
          trackNum: trackNum,
        },
      ]);
    }
  };

  const handleDragStop = (id, e, data) => {
    const newX = data.x;
    const newY = data.y;
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
        [id]: { ...prev[id], x: newX, y: newY },
      }));
      const duration = Number(
        trackMedia.find((m) => m.id === id)?.duration || 0
      );
      setSourceAndTiming((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const time = convertToFormattedTime(
              Math.floor(newX / pixels[zoomTimeline]) +
                duration +
                (item.end - item.newEnd)
            );
            if (time > maxTime) {
              setMaxTime(time);
            }
            return {
              ...item,
              speedStart:
                Math.floor(newX / pixels[zoomTimeline]) +
                (item.speedStart - item.start),
              newStart:
                Math.floor(newX / pixels[zoomTimeline]) +
                (item.newStart - item.start),
              start: Math.floor(newX / pixels[zoomTimeline]),
              speedEnd:
                Math.floor(newX / pixels[zoomTimeline]) +
                duration +
                (item.speedEnd - item.end),
              newEnd:
                Math.floor(newX / pixels[zoomTimeline]) +
                duration +
                (item.end - item.newEnd),
              end: Math.floor(newX / pixels[zoomTimeline]) + duration,
              trackX: newX,
            };
          } else {
            return item;
          }
        })
      );
    }
  };

  const handleResizeStop = (id, e, direction, ref, delta, position) => {
    const newWidth = ref.offsetWidth;
    const newX = position.x;
    const source = sourceAndTiming.find((item) => item.id === id);

    if (direction === "left") {
      const diff = source.newStart - delta.width / pixels[zoomTimeline];
      console.log("inside resize ", source.newStart, diff, seekerPosition);

      if (diff < source.speedStart || diff > source.speedEnd) {
        setPositions((prev) => ({
          ...prev,
          [id]: { ...prev[id] },
        }));
        return;
      } else {
        setPositions((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            x: newX,
            width: prev[id].width + delta.width,
          },
        }));
        const updatedSourceAndTiming = sourceAndTiming.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              newStart: Number(diff.toFixed(1)),
              trackX: newX,
              // zoomCenter: { x: 0, y: 0 },
              // zoomStart: null,
              // zoomDuration: null,
              // zoomLevel: 1,
              startsFrom: Math.floor(Number(diff.toFixed(1)) - item.start),
            };
          }
          return item;
        });
        // console.log("starts from ", Math.floor(diff - item.start));

        setSourceAndTiming(updatedSourceAndTiming);

        setTrackMedia((prev) =>
          prev.map((track) =>
            track.id === id
              ? {
                  ...track,
                  duration: Math.floor(
                    (positions[id].width * 1) / pixels[zoomTimeline]
                  ),
                }
              : track
          )
        );
      }
    } else {
      const diff =
        source.newEnd / source.speed + delta.width / pixels[zoomTimeline];
      console.log(
        "end",
        diff,
        source.speedStart,
        source.speedEnd,
        delta,
        "new end ",
        source.newEnd
      );

      if (diff < source.speedStart || diff > source.speedEnd) {
        setPositions((prev) => ({
          ...prev,
          [id]: { ...prev[id] },
        }));
        return;
      } else {
        setPositions((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],

            width: prev[id].width + delta.width,
          },
        }));
        const updatedSourceAndTiming = sourceAndTiming.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              newEnd: Number(diff.toFixed(1)),
              // zoomCenter: { x: 0, y: 0 },
              // zoomStart: null,
              // zoomDuration: null,
              // zoomLevel: 1,
            };
          }
          return item;
        });

        setSourceAndTiming(updatedSourceAndTiming);
        const time = convertToFormattedTime(diff);
        if (time > maxTime) {
          setMaxTime(time);
        }
        setTrackMedia((prev) =>
          prev.map((track) =>
            track.id === id
              ? {
                  ...track,
                  duration: Math.floor(
                    positions[id].width / pixels[zoomTimeline]
                  ),
                }
              : track
          )
        );
      }
    }
    console.log(
      "width ",
      newWidth,
      "delta ",
      delta,
      "direction",
      direction,
      "x",
      newX
    );
  };

  const checkOverlap = (newRect, elements, positions, currentId = null) => {
    for (const item of elements) {
      if (item.id === currentId || item.trackNum !== trackNum) continue; // Skip self or other tracks
      const rect = positions[item.id];
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
    if (!isSplit) {
      return;
    }
    let tracks = [];
    sourceAndTiming.forEach((source) => {
      if (source.trackNum === trackNum) {
        tracks.push({
          id: source.id,
          src: source.source,
          mediaType: source.mediaType,
          duration: Math.floor(Number(source.newEnd - source.newStart)),
        });
      }
      if (!elements.some((el) => el.id === source.id)) {
        setElements((prev) => [...prev, { id: source.id, trackNum }]);
      }

      setPositions((prev) => ({
        ...prev,
        [source.id]: {
          x: source.trackX,
          y: 0,
          width: (source.newEnd - source.newStart) * pixels[zoomTimeline],
        },
      }));
    });
    setTrackMedia(tracks);
    console.log("split", isSplit, "sourceandtiming is ", sourceAndTiming);

    setIsSplit(false);
  }, [isSplit]);

  useEffect(() => {
    const source = sourceAndTiming.find((item) => item.id === selectedElement);
    if (!source) return;

    setPositions((prev) => ({
      ...prev,
      [selectedElement]: {
        ...prev[selectedElement],
        width: Math.floor(
          ((source.newEnd - source.newStart) * pixels[zoomTimeline]) /
            source.speed
        ),
      },
    }));

    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement) {
        const speedEnd = Math.floor(item.newEnd - item.newStart) / item.speed;
        return {
          ...item,
          speedEnd: Math.floor(item.newStart + speedEnd),
          // newEnd: Math.floor(item.newStart + speedEnd)
          // zoomCenter: { x: 0, y: 0 },
          // zoomStart: null,
          // zoomDuration: null,
          // zoomLevel: 1,
        };
      }
      return item;
    });

    setSourceAndTiming(updatedSourceAndTiming);
    setIsSpeedChange(false);
    console.log("s&t", sourceAndTiming, positions);
  }, [isSpeedChange]);
  useEffect(() => {
    console.log("in track sandt", sourceAndTiming);
    if (!isDeleteMedia) {
      return;
    }
    let tracks = [];
    sourceAndTiming.forEach((source) => {
      if (source.id !== selectedElement && source.trackNum === trackNum) {
        tracks.push({
          id: source.id,
          src: source.source,
          mediaType: source.mediaType,
          duration: Math.floor(Number(source.newEnd - source.newStart)),
        });
      }
    });
    setPositions((prev) => {
      if (!prev) return prev;

      const newState = prev;
      console.log("OLD POSITION", newState);

      delete newState[selectedElement];
      console.log("NEW POSITION", newState);

      return newState;
    });
    // setPositions((prev)=>{return prev.every((item)=>item.id !== selectedElement)});
    setElements((prev) => {
      console.log("every element", prev);

      return prev.filter((item) => item.id !== selectedElement);
    });
    setTrackMedia(() => {
      return [...tracks];
    });
    setSelectedElement(null);
    setIsDeleteMedia(false);
    console.log("POSITIONS ", positions, "track media ", tracks);
  }, [isDeleteMedia]);

  useEffect(() => {
    console.log("new S&T", sourceAndTiming);

    const maxNewEnd = sourceAndTiming.reduce(
      (max, obj) => Math.max(max, obj.newEnd),
      0
    );
    setMaxTime(convertToFormattedTime(maxNewEnd));
  }, [isDeleteMedia, isSplit, isSpeedChange, sourceAndTiming]);

  useEffect(() => {
    // const updatedSourceAndTiming = sourceAndTiming.map((item) => {
    //   return {
    //     ...item,
    //     newStart: Number(((item.newStart / prevZoom) * zoomTimeline).toFixed(1)),
    //     newEnd: Number(((item.newEnd / prevZoom) * zoomTimeline).toFixed(1)),
    //     start: Number(((item.start / prevZoom) * zoomTimeline).toFixed(1)),
    //     end: Number(((item.end / prevZoom) * zoomTimeline).toFixed(1)),
    //     speedStart: Number(((item.speedStart / prevZoom) * zoomTimeline).toFixed(
    //       1
    //     )),
    //     speedEnd: Number(((item.speedEnd / prevZoom) * zoomTimeline).toFixed(1)),
    //   };
    // });
    const updatedPosition = Object.fromEntries(
      Object.entries(positions).map(([key, item]) => [
        key, // Keep the original key
        {
          ...item,
          x: Number(((item.x / prevZoom) * zoomTimeline).toFixed(1)),
          width: Number(((item.width / prevZoom) * zoomTimeline).toFixed(1)),
        },
      ])
    );

    setPositions(updatedPosition);
    // setSourceAndTiming([...updatedSourceAndTiming]);
    setPrevZoom(zoomTimeline);
  }, [zoomTimeline]);

  return (
    <div
      className="track"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        handleDrop(e);
      }}
      style={
        {
          // minWidth: `${timelineWidth}px`,
          // transform:`scaleX(${zoomTimeline})`
        }
      }
    >
      {trackMedia.map((m) => (
        <Rnd
          key={m.id}
          size={{
            width: positions[m.id]?.width || 100,
            height: 40,
          }}
          bounds={".all-tracks"}
          position={{
            x: positions[m.id]?.x || 0,
            y: positions[m.id]?.y || 0,
          }}
          enableResizing={{
            left: true,
            right: true,
            top: false,
            bottom: false,
          }}
          disableDragging={!isDraggable}
          onResizeStart={() => setIsDraggable(false)}
          onDragStop={(e, data) => {
            e.target.style.zIndex = ""; // Reset after drop

            handleDragStop(m.id, e, data);
            // console.log(e.target.parent, "e is ", e.target.closest(".track"));
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            handleResizeStop(m.id, e, direction, ref, delta, position);
            setIsDraggable(true);
          }}
          onDragStart={(e, data) => {
            const width = positions[m.id]?.width || 100;
            if (data.x + width > timelineWidth) {
              console.log("ans ", data.x + width);

              setTimelineWidth(data.x + width); // Expand dynamically
            }
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
              border:
                selectedElement === m.id ? "2px solid red" : "2px solid black",
            }}
            onClick={() => setSelectedElement(m.id)}
          >
            {positions[m.id]?.width * zoomTimeline}
          </div>
        </Rnd>
      ))}
    </div>
  );
};

export default Track;
