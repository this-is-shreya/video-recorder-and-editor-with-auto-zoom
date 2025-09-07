"use client";

import { useContext, useEffect, useRef, useState, useMemo } from "react";
import { Rnd } from "react-rnd";
import AppContext from "../../AppContext";
import { pixels } from "../../utils/PixelsPerSecondEnum";
import { mediaType } from "../../utils/MediaEnum";
import { useZoomFollowCursor } from "../../utils/useZoomFollowCursor";

const useKeyPress = (key, callback, withCtrl = false) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (withCtrl ? event.ctrlKey && event.key === key : event.key === key) {
        event.preventDefault();
        callbackRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, withCtrl]);
};

const MediaPlayer = ({ trackNum, setIsTransitioning, setTransitionType }) => {
  const {
    currentSourceAndTiming,
    isPlaying,
    seekerPosition,
    sourceAndTiming,
    setSourceAndTiming,
    selectedElement,
    seekerPositionManuallyChanged,
    setSeekerPositionManuallyChanged,
    isSplit,
    zoomTimeline,
    isTrim,
    setIsTrim,
    isExportPreview,
    cursorDataObj
  } = useContext(AppContext);

  // Memoize the filtered data to prevent infinite re-renders
  const currentSourceAndTimingFiltered = useMemo(
    () => currentSourceAndTiming.filter((item) => item.trackNum === trackNum),
    [currentSourceAndTiming, trackNum]
  );

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [currentZoomLevel, setCurrentZoomLevel] = useState(1);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const hasSetStartTime = useRef(false);

  if (!currentSourceAndTiming || !currentSourceAndTimingFiltered[0]) {
    return null;
  }

  const {
    source,
    start,
    end,
    newStart,
    newEnd,
    borderRadius,
    speed,
    zoomCenter,
    zoomStart,
    zoomDuration,
    zoomLevel,
    startsFrom,
    volume,
    transitionType,
    transitionFromId,
  } = currentSourceAndTimingFiltered[0];

  // Initialize state for position and size from currentSourceAndTiming
  const [position, setPosition] = useState(
    () => currentSourceAndTimingFiltered[0].position || { x: 0, y: 0 }
  );
  const [currentEffect, setCurrentEffect] = useState(
    () => currentSourceAndTimingFiltered[0].effectType
  );
  const [size, setSize] = useState(
    () => currentSourceAndTimingFiltered[0].size
  );
  const [videoSource, setVideoSource] = useState(source);
  const [audioSource, setAudioSource] = useState(source);
  const [startsFromForReference, setStartsFromReference] = useState(startsFrom);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const imgRef = useRef(null);
  const lastSeekerPosition = useRef(seekerPosition);
  const lastIsPlaying = useRef(isPlaying);

  // Update `currentSourceAndTiming` when size or position changes
  const updateContext = (newPosition, newSize) => {
    setSourceAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentSourceAndTimingFiltered[0].id
          ? { ...item, position: newPosition, size: newSize }
          : item
      )
    );
  };

  const dummyCursorData = [
    {
      startTime: 2,
      endTime: 5,
      cursorData: [
        { timestamp: 2, x: 0.1, y: 0.42 },
        { timestamp: 4, x: 0.6, y: 0.44 },
      ],
    },
    {
      startTime: 6,
      endTime: 10,
      cursorData: [
        { timestamp: 6, x: 0.8, y: 0.5 },
        { timestamp: 8, x: 0.37, y: 0.52 },
      ],
    },
  ];

  // Only call the hook when we have valid data and are playing
  const shouldUseZoom =
    isPlaying &&
    videoRef.current &&
    cursorDataObj &&
    Array.isArray(cursorDataObj);

  const zoomData = useZoomFollowCursor({
    videoRef,
    previewSize: size,
    cursorDataObj: shouldUseZoom ? cursorDataObj : null,
    zoomLevel: 1.5,
  });

  // Update scale and offset based on zoom data - removed zoomData from dependencies to prevent infinite loop
  useEffect(() => {
    if (shouldUseZoom) {
      setScale(zoomData.scale);
      setOffset(zoomData.offset);      
    } else {
      // Reset when not playing or no cursor data
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [shouldUseZoom, zoomData.scale, zoomData.offset]);

  // Update position and size when the filtered data changes
  useEffect(() => {
    if (currentSourceAndTimingFiltered[0]) {
      setPosition(currentSourceAndTimingFiltered[0].position || { x: 0, y: 0 });
      setSize(currentSourceAndTimingFiltered[0].size);
      setCurrentEffect(currentSourceAndTimingFiltered[0].effectType);
    }
  }, [currentSourceAndTimingFiltered]);

  useEffect(() => {
    setVideoSource(source);
    setVideoLoaded(false);
  }, [source]);

  //for video
  useEffect(() => {
    console.log("video 1");
    
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.volume = volume;
    if (
      !videoSource ||
      videoSource !== source ||
      startsFromForReference !== startsFrom
    ) {
      hasSetStartTime.current = false;
      setVideoSource(source);
      console.log("video 2");
      
    }
    if (!hasSetStartTime.current) {
      setTimeout(() => {
        video.currentTime = startsFrom;
        hasSetStartTime.current = true;
        setStartsFromReference(startsFrom);
      }, 50);
    }
    video.onloadedmetadata = () => {
      setVideoLoaded(true);
      console.log("video 3");
      
    };

    // Set playback speed
    video.playbackRate = speed;

    // Only seek if the user manually scrubs
    if (seekerPositionManuallyChanged || isSplit || isTrim) {
      const newTime =
        Math.floor(seekerPosition / pixels[zoomTimeline]) -
        newStart +
        startsFromForReference;
      video.currentTime = newTime;

      setSeekerPositionManuallyChanged(false);
      setIsTrim(false);
    }

    // Handle playing/pausing
    if (isPlaying) {
      video.play().catch((error) => console.warn("Playback error:", error));
    } else {
      console.log("video 4");
      
      video.pause();
    }

    lastSeekerPosition.current = seekerPosition;
  }, [
    seekerPosition,
    isPlaying,
    speed,
    isSplit,
    isTrim,
    startsFrom,
    source,
    startsFromForReference,
    volume,
    zoomTimeline,
    newStart,
    setSeekerPositionManuallyChanged,
    setIsTrim,
  ]);

  //for audio
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.volume = volume;

    if (isSplit) {
      hasSetStartTime.current = false;
    }
    if (!audioSource || audioSource !== source) {
      hasSetStartTime.current = false;
      setAudioSource(source);
    }
    if (!hasSetStartTime.current) {
      setTimeout(() => {
        audio.currentTime = startsFrom;
        hasSetStartTime.current = true;
      }, 50);
    }

    // Set playback speed
    audio.playbackRate = speed;

    // Only seek if the user manually scrubs
    if (seekerPositionManuallyChanged) {
      audio.currentTime =
        Math.floor(seekerPosition / pixels[zoomTimeline]) -
        newStart +
        startsFrom;
      setSeekerPositionManuallyChanged(false);
    }

    // Handle playing/pausing
    if (isPlaying) {
      audio.play().catch((error) => console.warn("Playback error:", error));
    } else {
      audio.pause();
    }
    lastSeekerPosition.current = seekerPosition;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= newEnd) {
        audio.pause();
        audio.currentTime = newEnd;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [
    seekerPosition,
    isPlaying,
    speed,
    source,
    volume,
    isSplit,
    zoomTimeline,
    newStart,
    startsFrom,
    newEnd,
    setSeekerPositionManuallyChanged,
  ]);

  //for applying zoom
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(seekerPosition / pixels[zoomTimeline]);

      if (video.currentTime >= startsFrom + (newEnd - newStart)) {
        video.pause();
      }
      if (zoomStart !== null && zoomDuration !== null) {
        if (
          currentTime >= Math.floor(newStart + zoomStart) &&
          currentTime <= Math.floor(newStart + zoomStart + zoomDuration)
        ) {
          // Zoom in
          setCurrentZoomLevel(Number(zoomLevel));
        } else {
          // Zoom out smoothly after zoomDuration
          setCurrentZoomLevel(1);
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [
    zoomStart,
    zoomDuration,
    zoomLevel,
    seekerPosition,
    zoomTimeline,
    newStart,
    startsFrom,
    newEnd,
  ]);

  //for transition
  useEffect(() => {
    if (
      newEnd - Math.floor(seekerPosition / pixels[zoomTimeline]) <= 1 &&
      transitionType != null
    ) {
      setIsTransitioning(true);
      setTransitionType(transitionType);
    }
    if (newStart - Math.floor(seekerPosition / pixels[zoomTimeline]) > 1) {
      setIsTransitioning(false);
      setTransitionType(null);
    }
  }, [
    seekerPosition,
    newEnd,
    transitionType,
    setIsTransitioning,
    setTransitionType,
    zoomTimeline,
    newStart
  ]);

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      bounds=".video-player"
      enableResizing={!isExportPreview}
      onDragStop={(e, data) => {
        const newPosition = { x: data.x, y: data.y };
        setPosition(newPosition);
        updateContext(newPosition, size);
      }}
      onResizeStop={(e, direction, ref, delta, _position) => {
        let newWidth = ref.offsetWidth;
        let newHeight = ref.offsetHeight;

        if (borderRadius >= 50) {
          newWidth = newHeight = Math.min(newWidth, newHeight);
        }

        const newSize = { width: newWidth, height: newHeight };
        const newPosition = { x: _position.x, y: _position.y };

        setSize(newSize);
        setPosition(newPosition);
        updateContext(newPosition, newSize);
      }}
      style={{
        overflow: "hidden",
        backgroundColor: "transparent",
        zIndex: trackNum,
        borderRadius: `${(borderRadius / 100) * size.height}px / ${
          (borderRadius / 100) * size.width
        }px`,
        cursor: isExportPreview ? "none" : "",
      }}
      className={`${selectedElement.id}-preview`}
    >
      {currentSourceAndTimingFiltered[0].mediaType === mediaType.video && (
        <video
          key={source}
          ref={videoRef}
          src={source}
          autoPlay={false}
          muted={false}
          crossOrigin="anonymous"
          className={`video-player ${
            currentEffect !== "none" ? `video-effect-${currentEffect}` : ""
          }`}
          onLoadedMetadata={() => setVideoLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: videoLoaded ? 1 : 0,
            visibility: videoLoaded ? "visible" : "hidden",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: `${(borderRadius / 100) * size.height}px / ${
              (borderRadius / 100) * size.width}px`,
            cursor: isExportPreview ? "none" : "",
            transform:
              shouldUseZoom && scale > 1
                ? trackNum === 4
                  ? `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
                  : trackNum === 5
                  ? `scale(${1.5 - scale / 2})`
                  : `scale(1)`
                : `scale(1)`,
            transformOrigin: "center center", // Back to center center for proper cursor following
            transition: "transform 0.2s ease-out",
          }}
        />
      )}
      {currentSourceAndTimingFiltered[0].mediaType === mediaType.image && (
        <img
          src={source || "/placeholder.svg"}
          ref={imgRef}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            cursor: isExportPreview ? "none" : "",
          }}
        />
      )}
      {currentSourceAndTimingFiltered[0].source === "blurred-element" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: `${(borderRadius / 100) * size.height}px / ${
              (borderRadius / 100) * size.width
            }px`,
            pointerEvents: "none",
            cursor: isExportPreview ? "none" : "",
          }}
        />
      )}

      {currentSourceAndTimingFiltered[0].source !== "blurred-element" &&
        currentSourceAndTimingFiltered[0].mediaType === mediaType.icons && (
          <img
            src={`https://api.iconify.design/${
              currentSourceAndTimingFiltered[0].source.split(":")[0]
            }/${
              currentSourceAndTimingFiltered[0].source.split(":")[1]
            }.svg?height=40`}
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              cursor: isExportPreview ? "none" : "",
            }}
          />
        )}
      {currentSourceAndTimingFiltered[0].mediaType === mediaType.audio && (
        <audio src={source} autoPlay={false} ref={audioRef} />
      )}
    </Rnd>
  );
};

export default MediaPlayer;
