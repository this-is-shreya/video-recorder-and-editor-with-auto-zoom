import React, { useContext, useEffect, useState } from "react";
import { getMediaSrcAndType } from "../../utils/getMediaSrcAndType";
import { Rnd } from "react-rnd";
import AppContext from "../../AppContext";
import { pixels } from "../../utils/PixelsPerSecondEnum";
import { mediaType, transitionType } from "../../utils/MediaEnum";
import { FaBolt } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";

const Track = ({
  isDeleteMedia,
  setIsDeleteMedia,
  timelineWidth,
  setTimelineWidth,
  trackNum,
  elements,
  setElements,
  positions,
  setPositions,
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
    effectsAndTiming,
    setEffectsAndTiming,
    zoomTimeline,
    isSplit,
    setIsSplit,
    seekerPosition,
    setIsTrim,
  } = useContext(AppContext);
  const [trackMedia, setTrackMedia] = useState([]); // Store media data
  const [prevZoom, setPrevZoom] = useState(zoomTimeline);

  const handleDrop = (e) => {
    e.preventDefault();
    const obj = getMediaSrcAndType(e);
    const src = obj.src;
    const _mediaType = obj.mediaType;
    const duration = obj.duration;
    const id = Date.now();
    const trackRect = e.target.getBoundingClientRect();
    const x = e.clientX - trackRect.left; // Position relative to the track
    const y = 0; // Fixed y-coordinate
    const width = duration * pixels[zoomTimeline]; // Default width based on duration

    // Check for overlap
    const isOverlapping = checkOverlap(
      { left: x, right: x + width },
      elements,
      positions
    );
    console.log("OVERLAPPING ", isOverlapping);

    if (!isOverlapping) {
      setElements((prev) => [...prev, { id, trackNum }]);
      setTrackMedia([
        ...trackMedia,
        { id, src, mediaType: _mediaType, duration },
      ]);
      setPositions((prev) => ({
        ...prev,
        [id]: { x, y, width },
      }));

      if (_mediaType !== mediaType.effects) {
        console.log("entered here for ", _mediaType);

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
            mediaType: _mediaType,
            borderRadius: "0",
            speed: 1,
            zoomCenter: prev.zoomCenter ? prev.zoomCenter : { x: 0, y: 0 },
            zoomStart: prev.zoomStart ? prev.zoomStart : null,
            zoomDuration: prev.zoomDuration ? prev.zoomDuration : 0,
            zoomLevel: prev.zoomLevel ? prev.zoomLevel : 1,
            startsFrom: 0,
            volume: 1,
            trackNum: trackNum,
            transitionFromSource: null,
            transitionFromId: null,
            transitionToSource: null,
            transitionToId: null,
            transitionType: null,
          },
        ]);
      } else {
        console.log("added effects");

        setEffectsAndTiming((prev) => [
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
            mediaType: _mediaType,
            trackNum: trackNum,
            position: { x: 0, y: 0 },
            size: { width: "30vw", height: "35vh" },
            text: "Sample text",
            fontStyle: null,
            fontSize: "14",
            textColor: "#000000",
            backgroundColor: "#ffffff",
            animation: "",
            isBackgroundTransparent: false,
          },
        ]);
      }
    }
  };

  const handleDragStop = (id, e, data, numTrack) => {
    const newX = data.x;
    const newY = data.y;
    const width = positions[id]?.width || 100;

    const isOverlapping = checkOverlap(
      { left: newX, right: newX + width },
      elements,
      positions,
      id,
      numTrack
    );
    console.log(
      "handledragstop overlapping ",
      isOverlapping,
      "tracknum is ",
      numTrack
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
              trackNum: numTrack,
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
    let newX = position.x;
    const source = sourceAndTiming.find((item) => item.id === id);

    const isOverlapping = checkOverlap(
      { left: newX, right: newX + newWidth },
      elements,
      positions,
      id,
      trackNum
    );
    if (isOverlapping) {
      return;
    }
    setIsTrim(true);

    if (direction === "left") {
      let diff = source.newStart - delta.width / pixels[zoomTimeline];
      diff = diff > source.speedEnd ? source.speedEnd : diff;
      diff = diff < source.speedStart ? source.speedStart : diff;

      newX =
        diff === source.speedStart
          ? Math.floor(diff * pixels[zoomTimeline])
          : newX;

      console.log(">>inside resize ", source.newStart, diff, newX);
      setPositions((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          x: newX,
          width: Math.floor(source.newEnd - diff) * pixels[zoomTimeline],
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
    } else {
      let diff =
        source.newEnd / source.speed + delta.width / pixels[zoomTimeline];

      diff = diff > source.speedEnd ? source.speedEnd : diff;
      diff = diff < source.speedStart ? source.speedStart : diff;
      console.log(">>", diff, source.newEnd);

      setPositions((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],

          width: Math.floor(diff - source.newStart) * pixels[zoomTimeline],
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
  };

  const checkOverlap = (
    newRect,
    elements,
    positions,
    currentId = null,
    numTrack
  ) => {
    for (const item of elements) {
      console.log(">>elements ", item);

      if (item.id !== currentId && item.trackNum === numTrack) {
        const rect = positions[item.id];

        // console.log(">>currposition", newRect, "itemposition", rect);

        if (
          newRect.left < rect.x + rect.width && // Left edge overlaps
          newRect.right > rect.x // Right edge overlaps
        ) {
          return true; // Overlap detected
        }
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
    const source = sourceAndTiming.find(
      (item) => item.id === selectedElement.id
    );
    if (!source) return;

    setPositions((prev) => ({
      ...prev,
      [selectedElement.id]: {
        ...prev[selectedElement.id],
        width: Math.floor(
          ((source.newEnd - source.newStart) * pixels[zoomTimeline]) /
            source.speed
        ),
      },
    }));

    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement.id) {
        const speedEnd = Math.floor(item.newEnd - item.newStart) / item.speed;
        return {
          ...item,
          speedEnd: Math.floor(item.newStart + speedEnd),
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
      if (source.id !== selectedElement.id && source.trackNum === trackNum) {
        tracks.push({
          id: source.id,
          src: source.source,
          mediaType: source.mediaType,
          duration: Math.floor(Number(source.newEnd - source.newStart)),
        });
      }
    });
    effectsAndTiming.forEach((effect) => {
      if (effect.id !== selectedElement.id && effect.trackNum === trackNum) {
        tracks.push({
          id: effect.id,
          src: effect.source,
          mediaType: effect.mediaType,
          duration: Math.floor(Number(effect.newEnd - effect.newStart)),
        });
      }
    });
    setPositions((prev) => {
      if (!prev) return prev;

      const newState = prev;
      console.log("OLD POSITION", newState);

      delete newState[selectedElement.id];
      console.log("NEW POSITION", newState);

      return newState;
    });
    // setPositions((prev)=>{return prev.every((item)=>item.id !== selectedElement)});
    setElements((prev) => {
      console.log("every element", prev);

      return prev.filter((item) => item.id !== selectedElement.id);
    });
    setTrackMedia(() => {
      return [...tracks];
    });
    setSelectedElement({});
    setIsDeleteMedia(false);
    console.log("POSITIONS ", positions, "track media ", tracks);
  }, [isDeleteMedia]);

  useEffect(() => {
    console.log("new S&T", sourceAndTiming, trackMedia);

    let maxNewEnd = sourceAndTiming.reduce(
      (max, obj) => Math.max(max, obj.newEnd),
      0
    );
    maxNewEnd = effectsAndTiming.reduce(
      (max, obj) => Math.max(max, obj.newEnd),
      maxNewEnd
    );
    setMaxTime(convertToFormattedTime(maxNewEnd));
  }, [
    isDeleteMedia,
    isSplit,
    isSpeedChange,
    sourceAndTiming,
    effectsAndTiming,
  ]);

  useEffect(() => {
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
    setPrevZoom(zoomTimeline);
  }, [zoomTimeline]);

  return (
    <div
      className="track"
      id={`track-${trackNum}`}
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
      {trackMedia
        .filter((m) => positions[m.id] && !isNaN(positions[m.id]?.width))
        .map((m) => (
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
              left: m.mediaType !== mediaType.effects,
              right: m.mediaType !== mediaType.effects,
              top: false,
              bottom: false,
            }}
            onResize={(e, direction, ref, delta, position) => {
              // ref.style.position = "fixed";
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              handleResizeStop(m.id, e, direction, ref, delta, position);
            }}
            onDragStart={(e, data) => {
              // const width = positions[m.id]?.width || 100;
              // if (data.x + width > timelineWidth) {
              //   console.log("ans ", data.x + width);

              //   setTimelineWidth(data.x + width); // Expand dynamically
              // }
              if (m.mediaType === mediaType.video) {
                const currentSource = sourceAndTiming.find(
                  (item) => item.id === m.id
                );
                if (!currentSource.transitionFromId) {
                  return;
                }
                const prevSource = sourceAndTiming.find(
                  (item) => item.transitionToId === currentSource?.id
                );
                const updatedSourceAndTiming = sourceAndTiming.map((item) => {
                  if (item.id === currentSource?.id) {
                    return {
                      ...item,
                      transitionFromId: null,
                      transitionFromSource: "",
                    };
                  } else if (item.id === prevSource?.id) {
                    return {
                      ...item,
                      transitionToId: null,
                      transitionToSource: "",
                      transitionType: null,
                    };
                  }
                  return item;
                });

                setSourceAndTiming(updatedSourceAndTiming);
              }
            }}
            onDragStop={(e, data) => {
              e.preventDefault();
              const t = e.target.getBoundingClientRect();
              console.log("t->", t);

              let newTrackNum = null;

              for (let i = 1; i <= 2; i++) {
                const trackElement = document.getElementById(`track-${i}`);
                if (trackElement) {
                  const rect = trackElement.getBoundingClientRect();

                  if (t.top >= rect.top && t.top + 40 <= rect.bottom) {
                    newTrackNum = i; // Set new track number
                  }
                }
              }
              if (!newTrackNum) {
                return;
              }
              if (newTrackNum !== null) {
                setElements((prevElements) =>
                  prevElements.map((el) =>
                    el.id === m.id ? { ...el, trackNum: newTrackNum } : el
                  )
                );
                handleDragStop(m.id, e, data, newTrackNum);
              }
            }}
          >
            <div
              id={m.id}
              className="track-video"
              style={{
                width: `${positions[m.id]?.width}px`,
                height: "100%",
                backgroundColor: "rgb(63, 166, 245)",
                borderRadius: "4px",
                position: "absolute",
                border:
                  selectedElement.id === m.id
                    ? "2px solid red"
                    : "2px solid black",
              }}
              onClick={() =>
                setSelectedElement({
                  id: m.id,
                  src: m.src,
                  mediaType: m.mediaType,
                })
              }
            >
              {sourceAndTiming.find((item) => item.id === m.id)
                ?.transitionFromId && <FontAwesomeIcon icon={faBolt} />}

              {positions[m.id]?.width * zoomTimeline}
            </div>
          </Rnd>
        ))}
    </div>
  );
};

export default Track;
