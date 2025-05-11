import React, { useContext, useEffect, useState } from "react";
import { getMediaSrcAndType } from "../../utils/getMediaSrcAndType";
import { Rnd } from "react-rnd";
import AppContext from "../../AppContext";
import { pixels } from "../../utils/PixelsPerSecondEnum";
import { mediaType, transitionType } from "../../utils/MediaEnum";
import { FaBolt } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faClapperboard, faFont, faIcons, faImage, faMicrophone, faMusic, faPanorama } from "@fortawesome/free-solid-svg-icons";
import { FaMusic } from "react-icons/fa";
import { notify } from "../../utils/toast";

const Track = ({
  isDeleteMedia,
  setIsDeleteMedia,
  trackNum,
  elements,
  setElements,
  positions,
  setPositions,
  undo,
  redo,
  setUndo,
  setRedo,
  fetchFromTimeline,
  setFetchFromTimeline,
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
    isTrim,
    setIsTrim,
    isTimerChanged,
    setIsTimerChanged,
    projectId,
  } = useContext(AppContext);
  const [trackMedia, setTrackMedia] = useState([]); // Store media data
  const [prevZoom, setPrevZoom] = useState(zoomTimeline);
  const freeResizeList = ["text-basic", "background"];

  const handleDrop = (e) => {
    e.preventDefault();

    if (zoomTimeline !== 1) {
      notify(
        "Timeline zoom level is not 1. Please set the zoom level to 1 to add media.",
        "warning"
      );
      return;
    }
    const obj = getMediaSrcAndType(e);
    console.log("obj is ", obj);

    const src = obj.src;
    const _mediaType = obj.mediaType;
    const duration = obj.duration === 0 ? 4 : obj.duration;
    const id = obj.id ? obj.id : Date.now();
    const trackRect = e.target.getBoundingClientRect();
    const x = e.clientX - trackRect.left; // Position relative to the track
    const y = 0; // Fixed y-coordinate
    const width = duration * pixels[zoomTimeline]; // Default width based on duration

    // Check for overlap
    const isOverlapping = checkOverlap(
      { left: x, right: x + width },
      elements,
      positions,
      null,
      trackNum
    );
    console.log(">>isoverlapping", isOverlapping);

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
            size: { width: "30vw", height: "30vh" },
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
            effectType: "none",
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
            text: src.includes("timer") ? 600 : "Sample text",
            fontStyle: null,
            fontSize: "14",
            textColor: "#000000",
            backgroundColor: "#ffffff",
            animation: "",
            isBackgroundTransparent: false,
          },
        ]);
      }
      expandTracksIfNeeded(x + width, trackNum);
    }
  };

  const handleDragStop = (id, e, data, numTrack) => {
    const newX = data.x;
    const newY = data.y;
    const width = positions[id]?.width || 100;
    if(newX - positions[id].x <= 0 && newY - positions[id].y <= 0) {
      return;
    }
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
      const media = trackMedia.find((m) => m.id === id);
      const duration = Number(media?.duration || 0);
      if (media.mediaType === mediaType.effects) {
        console.log("effects media");
        
        setEffectsAndTiming((prev) =>
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
      } else {
        
        
        setSourceAndTiming((prev) =>
          prev.map((item) => {
            
            if (item.id === id) {
              console.log(
                "delta is ",
                Math.floor(newX / pixels[zoomTimeline]),
                item.zoomStart, item.start
              );
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
                // zoomStart:
                //   Math.floor(newX / pixels[zoomTimeline]) +
                //   (item.zoomStart),
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
                  (item.end - item.speedEnd),
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
    }
  };

  const handleResizeStop = (
    id,
    e,
    direction,
    ref,
    delta,
    position,
    isFreeResizable
  ) => {
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
      if (!isFreeResizable) {
        diff = diff > source.speedEnd ? source.speedEnd : diff;
        diff = diff < source.speedStart ? source.speedStart : diff;

        newX =
          diff === source.speedStart
            ? Math.floor(diff * pixels[zoomTimeline])
            : newX;
      }
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
      if (!isFreeResizable) {
        diff = diff > source.speedEnd ? source.speedEnd : diff;
        diff = diff < source.speedStart ? source.speedStart : diff;
        console.log(">>", diff, source.newEnd);
      }
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
      console.log(">>>", item.id, currentId, item.trackNum, numTrack);

      if (item.id !== currentId && item.trackNum === numTrack) {
        const rect = positions[item.id];

        console.log(">>currposition", newRect, "itemposition", rect);

        if (rect && 
          newRect.left < rect.x + rect.width && // Left edge overlaps
          newRect.right > rect.x // Right edge overlaps
        ) {
          console.log(">>FOR 1", newRect, rect);

          return true; // Overlap detected
        }
        if (rect && rect.x + rect.width > newRect.left && rect.x < newRect.left) {
          console.log(">>FOR 2");

          return true;
        }
        if (rect && newRect.right > rect.x && newRect.right < rect.x + rect.width) {
          console.log(">>FOR 3");

          return true;
        }
        if (rect && newRect.left < rect.x && newRect.right > rect.x) {
          console.log(">>FOR 4");

          return true;
        }
      }
    }
    return false; // No overlap
  };

  const hasTransitions = (id) => {
    const item = sourceAndTiming.find((el) => el?.id === id);
    return item?.transitionFromId;
  };

  const resetTransitions = (id) => {
    const currentSource = sourceAndTiming.find((item) => item.id === id);
    const prevSource = sourceAndTiming.find(
      (item) => item.transitionToId === currentSource?.id
    );
    const nextSource = sourceAndTiming.find(
      (item) => item.transitionFromId === currentSource?.id
    );

    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === currentSource?.id) {
        return {
          ...item,
          transitionFromId: null,
          transitionFromSource: "",
          transitionToId: null,
          transitionToSource: "",
          transitionType: null,
        };
      } else if (item.id === prevSource?.id) {
        return {
          ...item,
          transitionToId: null,
          transitionToSource: "",
          transitionType: null,
        };
      } else if (item.id === nextSource?.id) {
        return {
          ...item,
          transitionFromId: null,
          transitionFromSource: "",
          transitionType: null,
        };
      }
      return item;
    });

    setSourceAndTiming(updatedSourceAndTiming);
  };
  const expandTracksIfNeeded = (rightEdge, trackNum) => {
    const currentTrack = document.getElementById(`track-${trackNum}`);
    if (!currentTrack) return;

    const trackWidth = currentTrack.getBoundingClientRect().width;
    console.log("track width", trackWidth, rightEdge);
    if (rightEdge > trackWidth) {
      const extra = 60 * pixels[zoomTimeline];
      const allTracks = document.querySelectorAll(".track");
      allTracks.forEach((track) => {
        track.style.width = trackWidth + extra + "px";
      });

      const allTracksContainer = document.querySelector(".all-tracks");
      if (allTracksContainer) {
        const containerWidth = allTracksContainer.getBoundingClientRect().width;
        allTracksContainer.style.minWidth = `${containerWidth + extra}px`;
      }
    }
  };

  useEffect(() => {
    console.log("Updated positions in state:", positions);
  }, [positions]);

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
    // this is needed as we are resetting tracks
    effectsAndTiming.forEach((source) => {
      if (source.trackNum === trackNum) {
        tracks.push({
          id: source.id,
          src: source.source,
          mediaType: source.mediaType,
          duration: Math.floor(Number(source.newEnd - source.newStart)),
        });
      }
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
    const source = effectsAndTiming.find(
      (item) => item.id === selectedElement.id
    );
    if (!source) return;

    setPositions((prev) => ({
      ...prev,
      [selectedElement.id]: {
        ...prev[selectedElement.id],
        width: Math.floor(Number(source.text) / 10) * pixels[zoomTimeline],
      },
    }));
    setIsTimerChanged(false);
  }, [isTimerChanged]);
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
    console.log("new S&T", sourceAndTiming, effectsAndTiming);

    let maxNewEnd = sourceAndTiming.reduce(
      (max, obj) => Math.max(max, obj?.newEnd),
      0
    );

    maxNewEnd = effectsAndTiming.reduce(
      (max, obj) => Math.max(max, obj?.newEnd),
      maxNewEnd
    );

    setMaxTime(convertToFormattedTime(maxNewEnd));
  }, [
    isDeleteMedia,
    isSplit,
    isSpeedChange,
    sourceAndTiming,
    effectsAndTiming,
    isTrim,
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

  useEffect(() => {
    if (fetchFromTimeline) {
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
      });
      effectsAndTiming.forEach((effect) => {
        if (effect.trackNum === trackNum) {
          tracks.push({
            id: effect.id,
            src: effect.source,
            mediaType: effect.mediaType,
            duration: Math.floor(Number(effect.newEnd - effect.newStart)),
          });
        }
      });
      let maxNewEnd = sourceAndTiming.reduce(
        (max, obj) => Math.max(max, obj?.newEnd),
        0
      );

      maxNewEnd = effectsAndTiming.reduce(
        (max, obj) => Math.max(max, obj?.newEnd),
        maxNewEnd
      );
      expandTracksIfNeeded(maxNewEnd * pixels[zoomTimeline], trackNum);
      setTrackMedia(tracks);
      

      setFetchFromTimeline(false);
    }
  }, [fetchFromTimeline]);

  useEffect(() => {
    console.log(
      "changes made, now ",
      sourceAndTiming,
      effectsAndTiming,
      trackMedia,
      positions,
      elements
    );
  }, [sourceAndTiming, effectsAndTiming]);
  // undo-redo
  useEffect(() => {
    if (undo || redo) {
      let tracks = [];
      const newSourceAndTiming = 
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
            x: source.trackX, // Preserve x position
            y: 0, // Preserve y if it exists, else default to 0
            width: (source.newEnd - source.newStart) * pixels[zoomTimeline],
          },
        }));
      });

      effectsAndTiming.forEach((source) => {
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
            x: prev[source.id]?.x || source.trackX, // Preserve x position
            y: prev[source.id]?.y ?? 0, // Preserve y if it exists
            width: (source.newEnd - source.newStart) * pixels[zoomTimeline],
          },
        }));
      });

      setTrackMedia(tracks);
      setUndo(false);
      setRedo(false);
    }
  }, [undo, redo]);

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
            left:
              m.mediaType !== mediaType.effects ||
              m.src.includes("background") ||
              m.mediaType === mediaType.icons,
            right:
              m.mediaType !== mediaType.effects ||
              m.src.includes("background") ||
              m.mediaType === mediaType.icons,
            top: false,
            bottom: false,
          }}
          onResize={(e, direction, ref, delta, position) => {
            // ref.style.position = "fixed";
            resetTransitions(m.id);
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            handleResizeStop(
              m.id,
              e,
              direction,
              ref,
              delta,
              position,
              m.src.includes("background") || m.mediaType === mediaType.icons
            );
          }}
          onDragStart={(e, data) => {
            const width = positions[m.id]?.width || 100;
            expandTracksIfNeeded(data.x + width, trackNum);
          }}
          onDragStop={(e, data) => {
            e.preventDefault();
            if (
              m.mediaType === mediaType.video &&
              !(Math.abs(data.x - positions[m.id].x) < 1) &&
              Math.abs(data.y - positions[m.id].y) === 0
            ) {
              resetTransitions(m.id);
            }
            const t = e.target.getBoundingClientRect();

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
              backgroundColor:
                m.mediaType === mediaType.video
                  ? "#15A9CF"
                  : m.mediaType === mediaType.audio
                  ? "#C91AA6"
                  : "#33d15b",
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
            {hasTransitions(m.id) && <FontAwesomeIcon icon={faBolt} />}

            {m.mediaType === mediaType.video && (
              <FontAwesomeIcon icon={faClapperboard} />
            )}
            {m.mediaType === mediaType.audio && (
              <FontAwesomeIcon icon={faMusic} />
            )}
            {m.mediaType === mediaType.image && (
              <FontAwesomeIcon icon={faImage} />
            )}
            {m.mediaType === mediaType.effects && (
              <FontAwesomeIcon icon={faFont} />
            )}
            {m.mediaType === mediaType.icons && (
              <FontAwesomeIcon icon={faIcons} />
            )}
            {m.mediaType === mediaType.background && (
              <FontAwesomeIcon icon={faPanorama} />
            )}
          </div>
        </Rnd>
      ))}
    </div>
  );
};

export default Track;
