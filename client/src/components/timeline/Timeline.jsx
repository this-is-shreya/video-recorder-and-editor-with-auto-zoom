import React, { useContext, useEffect, useRef, useState } from "react";
import Track from "./Track";
import Seeker from "./Seeker";
import Controls from "./Controls";
import { getCurrentSources } from "../../utils/getCurrentSources";
import AppContext from "../../AppContext";
import { pixels } from "../../utils/PixelsPerSecondEnum";
import { mediaType } from "../../utils/MediaEnum";
import {
  convertBase64ToBlob,
  convertBlobToBase64,
} from "../../utils/blobToBase64";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { BsScissors } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { LuRefreshCw } from "react-icons/lu";
import { Tooltip } from "react-tooltip";
import { notify } from "../../utils/toast";

const useKeyPress = (key, callback, withCtrl = false) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isTyping =
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.isContentEditable;

      if (isTyping) {
        return; // Ignore keypress if typing
      }
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

const Timeline = ({ undo, redo, setUndo, setRedo, handleSave }) => {
  const {
    seekerPosition,
    setSeekerPosition,
    setSeekerPositionManuallyChanged,
    sourceAndTiming,
    setSourceAndTiming,
    currentSourceAndTiming,
    setCurrentSourceAndTiming,
    effectsAndTiming,
    setEffectsAndTiming,
    currentEffectsAndTiming,
    setCurrentEffectsAndTiming,
    isPlaying,
    selectedElement,
    setSelectedElement,
    maxTime,
    convertToFormattedTime,
    convertToPixels,
    zoomTimeline,
    setZoomTimeline,
    isSplit,
    setIsSplit,
    aspectRatio,
    setAspectRatio,
    isExportPreview,
    setIsPlaying,
    dataArray,
    setDataArray,
    subtitleArray,
  } = useContext(AppContext);

  const intervalRef = useRef(null);
  const [isDeleteMedia, setIsDeleteMedia] = useState(false);
  const [positions, setPositions] = useState({}); // Store positions and sizes
  const [elements, setElements] = useState([]); // Store element IDs
  const [top, setTop] = useState("22.5vh");
  const [fetchFromTimeline, setFetchFromTimeline] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isFeedbackButtonDisabled, setIsFeedbackButtonDisabled] =
    useState(false);
  const [feedback, setFeedback] = useState("");
  const [resolution, setResolution] = useState(720);
  const [fps, setFps] = useState(30);
  const [bitrate, setBitrate] = useState(5000000);
  const [index, setIndex] = useState(0);

  // const handleButtonClick = () => {
  //   setIsPlaying((prevIsPlaying) => {
  if (!isPlaying) {
    // Pause the playback
    clearInterval(intervalRef.current); // Stop interval
    intervalRef.current = null;
    // console.log("stopped", intervalRef.current)
  } else {
    if (intervalRef.current !== null) {
      // Clear any existing interval to avoid duplication
      clearInterval(intervalRef.current);
    }
    // Play the playback
    intervalRef.current = setInterval(() => {
      const time = convertToFormattedTime(
        Math.floor(seekerPosition / pixels[zoomTimeline])
      );

      if (time >= maxTime) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }
      setSeekerPosition((prevPosition) => {
        const newPosition = prevPosition + pixels[zoomTimeline];
        // console.log("New seeker position:", newPosition);
        return newPosition;
      });
      // console.log("sk is ", seekerPosition);
    }, 1000);
  }
  // return !prevIsPlaying; // Toggle isPlaying state
  // });
  // };
  const handleSplit = () => {
    if (
      selectedElement.id === null ||
      (selectedElement.mediaType !== mediaType.audio &&
        selectedElement.mediaType !== mediaType.video)
    )
      return;

    let newSources = [];

    sourceAndTiming.forEach((source) => {
      if (
        source.id === selectedElement.id &&
        seekerPosition / pixels[zoomTimeline] >= source.newStart &&
        seekerPosition / pixels[zoomTimeline] <= source.newEnd
      ) {
        const roundedTime = Math.floor(seekerPosition / pixels[zoomTimeline]);
        // Second half (new split segment)
        const newSource = {
          ...source,
          id: Date.now(),
          start: roundedTime,
          newStart: roundedTime,
          speedStart: roundedTime,
          trackX:
            source.trackX +
            Math.floor(roundedTime - source.newStart) * pixels[zoomTimeline] +
            1,
          zoomCenter: { x: 0, y: 0 },
          zoomStart: null,
          zoomDuration: null,
          zoomLevel: 1,
          startsFrom: roundedTime - source.newStart + source.startsFrom,
          trackNum: source.trackNum,
        };

        // First half
        const updatedSource = {
          ...source,
          speedEnd: roundedTime, //it's a special case, instead of newEnd I'm using seekerPosition
          newEnd: roundedTime,
          end: roundedTime,
          zoomCenter: { x: 0, y: 0 },
          zoomStart: null,
          zoomDuration: null,
          zoomLevel: 1,
        };
        console.log(">>new sources are ", newSource, updatedSource);

        newSources.push(newSource, updatedSource);
        setSelectedElement({
          id: newSource.id,
          mediaType: newSource.mediaType,
        });
      } else {
        newSources.push(source);
      }
    });

    setSourceAndTiming(newSources);

    setIsSplit(true);
  };
  const handleDeleteTrackMedia = () => {
    if (!selectedElement) return;
    const isSource = sourceAndTiming.find(
      (item) => item.id == selectedElement.id
    );
    if (isSource) {
      const updatedSourceAndTiming = sourceAndTiming.filter((item) => {
        console.log("item", item, selectedElement);

        return item.id !== selectedElement.id;
      });
      console.log("updated sandt", updatedSourceAndTiming);
      setSourceAndTiming(() => [...updatedSourceAndTiming]);
    } else {
      const updatedEffectsAndTiming = effectsAndTiming.filter((item) => {
        console.log("item", item, selectedElement);

        return item.id !== selectedElement.id;
      });
      console.log("updated sandt", updatedEffectsAndTiming);
      setEffectsAndTiming(() => [...updatedEffectsAndTiming]);
    }
    setIsDeleteMedia(true);
  };
  const getHeightByAspectRatio = (aspectRatio, width) => {
    switch (aspectRatio) {
      case "9/16":
        return `35.5vh`; // Height = Width * (16 / 9)
      case "3/4":
        return `26.6vh`;
      case "4/3":
        return `46.6vh`;
      case "16/9":
        return `22.5vh`; // Height = Width * (9 / 16)
      default:
        return `22.5vh`; // Default to 16:9
    }
  };
  const handleExport = async () => {
    await handleSave(sourceAndTiming, effectsAndTiming, elements, positions);
    // const startVideo = sourceAndTiming.find((item)=>item.newStart === 0 && item.mediaType === mediaType.video)
    // if(!startVideo || startVideo.length === 0){
    //   notify("no video at start");
    //   return;
    // }
    const id = window.location.pathname.split("/")[1];
    const exportUrl = `/${id}/export?aspectRatio=${aspectRatio}&rate=${bitrate}&fps=${fps}&res=${resolution}`;
    const newWindow = window.open(exportUrl, "_blank");
    newWindow.addEventListener("load", () => {
      newWindow.postMessage(
        {
          type: "export",
          subtitleArray, //not needed ig
          maxTime,
        },
        "*"
      );
    });
  };
  const handleFeedback = () => {
    if (feedback.length === 0 || feedback.replaceAll(" ").length === 0) {
      return;
    }
    setIsFeedbackButtonDisabled(true);
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ feedback: feedback }),
    }).then((res) => {
      if (res.ok) {
        setTimeout(() => {
          setIsFeedbackButtonDisabled(false);
        }, 2000);
      }
    });
  };

  const handleUndo = () => {
    if (index <= 0) return;
    const newIndex = index - 1;
    const previousState = dataArray[newIndex];
    if (previousState) {
      setSourceAndTiming(previousState.sourceAndTiming);
      setEffectsAndTiming(previousState.effectsAndTiming);
      setElements(previousState.elements);
      setPositions(previousState.positions);
      setIndex(newIndex);
      setUndo(true);
    }
  };

  const handleRedo = () => {
    if (index >= dataArray.length - 1) return;
    const newIndex = index + 1;
    const nextState = dataArray[newIndex];
    console.log("newindex is ", newIndex, "data array is ", dataArray);
    console.log("next state is ", nextState);

    if (nextState) {
      setSourceAndTiming(nextState.sourceAndTiming);
      setEffectsAndTiming(nextState.effectsAndTiming);
      setElements(nextState.elements);
      setPositions(nextState.positions);
      setIndex(newIndex);
      setRedo(true);
    }
  };
  useEffect(() => {
    setCurrentSourceAndTiming(
      getCurrentSources(sourceAndTiming, seekerPosition, zoomTimeline)
    );
  }, [seekerPosition, sourceAndTiming]);
  useEffect(() => {
    setCurrentEffectsAndTiming(
      getCurrentSources(effectsAndTiming, seekerPosition, zoomTimeline)
    );
  }, [seekerPosition, effectsAndTiming]);

  useEffect(() => {
    setTop(getHeightByAspectRatio(aspectRatio));
    console.log("top is ", top);
  }, [aspectRatio]);
  useEffect(() => {
    const id = window.location.pathname.split("/")[1];
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/project/${id}`)
      .then(async (res) => {
        const data = await res.json();
        const updatedSourceAndTiming = await convertBase64ToBlob(
          data.source_and_timing
        );
        setSourceAndTiming(
          updatedSourceAndTiming ? updatedSourceAndTiming : []
        );
        setEffectsAndTiming(
          data.effects_and_timing ? data.effects_and_timing : []
        );
        setPositions(data.positions ? data.positions : {});
        setElements(data.elements ? data.elements : []);
        console.log(
          "inside timeline",
          sourceAndTiming,
          effectsAndTiming,
          elements,
          positions
        );
        setFetchFromTimeline(true);
      })
      .catch((err) => {
        notify("Error fetching project data", "error");
      });
  }, []);
  // Save state to history when source/effects change
  useEffect(() => {
    const newEntry = JSON.stringify({ sourceAndTiming, effectsAndTiming });
    const lastEntry = dataArray[index]
      ? JSON.stringify(dataArray[index])
      : null;

    if (newEntry === lastEntry) return;

    const updatedDataArray = dataArray.slice(0, index + 1); // discard future redos
    updatedDataArray.push({
      sourceAndTiming,
      effectsAndTiming,
      elements,
      positions,
    });

    if (updatedDataArray.length > 10) {
      updatedDataArray.shift();
    }

    setDataArray(updatedDataArray);
    setIndex(updatedDataArray.length - 1);
  }, [sourceAndTiming, effectsAndTiming]);

  useKeyPress("z", handleUndo, true);
  useKeyPress("y", handleRedo, true);

  useKeyPress("s", handleSplit);
  useKeyPress("Delete", handleDeleteTrackMedia);

  if (!isExportPreview) {
    useKeyPress(" ", () => setIsPlaying((prev) => !prev));
    useKeyPress("ArrowRight", () => {
      const maxPosition = convertToPixels(maxTime);
      if (seekerPosition + 5 * pixels[zoomTimeline] < maxPosition) {
        setSeekerPosition((prev) => prev + 5 * pixels[zoomTimeline]);
      } else {
        setSeekerPosition(maxPosition);
      }
      setSeekerPositionManuallyChanged(true);
    });
    useKeyPress("ArrowLeft", () => {
      if (seekerPosition - 5 * pixels[zoomTimeline] > 0) {
        setSeekerPosition((prev) => prev - 5 * pixels[zoomTimeline]);
      } else {
        setSeekerPosition(0);
      }
      setSeekerPositionManuallyChanged(true);
    });
  }
  return (
    <>
      <div className="project-actions">
        <button
          className="button-purple"
          style={{ minWidth: "100px", maxWidth: "fit-content", height: "30px" }}
          onClick={() => setShowFeedbackDialog(true)}
        >
          Share feedback
        </button>
        <button
          className="button-purple"
          style={{ minWidth: "60px", maxWidth: "fit-content", height: "30px" }}
          onClick={() =>
            handleSave(sourceAndTiming, effectsAndTiming, elements, positions)
          }
        >
          Save
        </button>
        <button
          className="button-purple"
          style={{ minWidth: "60px", maxWidth: "fit-content", height: "30px" }}
          onClick={() => setShowExportDialog(true)}
        >
          Export
        </button>
      </div>
      <div
        className="timeline"
        style={{
          top: `calc(${top} + 50vh)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            height: "25px",
            backgroundColor: "#13131b",
          }}
        >
          <button
            className="button-purple tooltip-timeline"
            data-tooltip-id="tooltip-timeline"
            data-tooltip-content="Press 'S' to split"
            style={{
              width: "40px",
            }}
            onClick={handleSplit}
          >
            <BsScissors size={15} />
          </button>
          <button
            className="button-purple tooltip-timeline"
            data-tooltip-id="tooltip-timeline"
            data-tooltip-content="Press 'Delete' key to delete"
            style={{
              width: "40px",
            }}
            onClick={handleDeleteTrackMedia}
          >
            <MdDelete size={15} />
          </button>
          <button
            className="button-purple tooltip-timeline"
            data-tooltip-id="tooltip-timeline"
            data-tooltip-content="Refresh timeline"
            style={{ width: "40px" }}
            onClick={() => setIsSplit(true)}
          >
            <LuRefreshCw size={15} />
          </button>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.5}
            defaultValue={1}
            onChange={(e) => {
              setZoomTimeline(Number(e.target.value));
            }}
          />
          <label style={{ color: "#fff" }}>{zoomTimeline}</label>
          <select
            onChange={(e) => {
              setAspectRatio(e.target.value);
            }}
          >
            <option value="16/9">16:9</option>
            <option value="9/16">9:16</option>
            <option value="4/3">4:3</option>
            <option value="3/4">3:4</option>
          </select>
        </div>
        <Controls />
        <Seeker />
        <div
          className="all-tracks-wrapper"
          style={{ overflowX: "auto", width: "100%" }}
        >
          <div className="all-tracks">
            <Track
              isDeleteMedia={isDeleteMedia}
              setIsDeleteMedia={setIsDeleteMedia}
              trackNum={2}
              elements={elements}
              setElements={setElements}
              positions={positions}
              setPositions={setPositions}
              undo={undo}
              redo={redo}
              setUndo={setUndo}
              setRedo={setRedo}
              fetchFromTimeline={fetchFromTimeline}
              setFetchFromTimeline={setFetchFromTimeline}
            />
            <Track
              isDeleteMedia={isDeleteMedia}
              setIsDeleteMedia={setIsDeleteMedia}
              trackNum={1}
              elements={elements}
              setElements={setElements}
              positions={positions}
              setPositions={setPositions}
              undo={undo}
              redo={redo}
              setUndo={setUndo}
              setRedo={setRedo}
              fetchFromTimeline={fetchFromTimeline}
              setFetchFromTimeline={setFetchFromTimeline}
            />
          </div>
        </div>
      </div>
      {showFeedbackDialog && (
        <div className="cookies-overlay">
          <div className="cookies-card">
            <p className="cookie-heading">Share your feedback</p>
            <p className="cookie-para">
              How has your experience been so far using our product? Feel free
              to share, as we are continuously working on improving our product
              :)
            </p>
            <textarea
              style={{
                width: "100%",
                height: "150px",
                padding: "10px",
                resize: "none",
                borderRadius: "5px",
                fontFamily: "inherit",
                fontSize: "12px",
              }}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="button-wrapper">
              <button
                className="accept cookie-button"
                onClick={() => handleFeedback()}
                disabled={isFeedbackButtonDisabled}
              >
                Share{" "}
                {isFeedbackButtonDisabled && (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    style={{ color: "#f7f9fd" }}
                  />
                )}
              </button>
            </div>
            <button
              className="exit-button"
              onClick={() => setShowFeedbackDialog(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 162 162"
                className="svgIconCross"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth="17"
                  stroke="black"
                  d="M9.01074 8.98926L153.021 153"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeWidth="17"
                  stroke="black"
                  d="M9.01074 153L153.021 8.98926"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* export dialog box */}
      {showExportDialog && (
        <div className="cookies-overlay">
          <div className="cookies-card">
            <p className="cookie-heading">Export options</p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "300px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ width: "100px" }}>FPS</label>
                  <div style={{ flex: 1 }}>
                    <select
                      style={{ width: "100%" }}
                      onChange={(e) => setFps(e.target.value)}
                    >
                      <option value="30">30 (Recommended)</option>
                      <option value="40">40</option>
                      <option value="50">50</option>
                      <option value="60">60</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ width: "100px" }}>Bitrate</label>
                  <div style={{ flex: 1 }}>
                    <select
                      style={{ width: "100%" }}
                      onChange={(e) => setBitrate(e.target.value)}
                    >
                      <option value="5000000">5Mbps (Recommended)</option>
                      <option value="10000000">10Mbps</option>
                      <option value="15000000">15Mbps</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ width: "100px" }}>Resolution</label>
                  <div style={{ flex: 1 }}>
                    <select
                      style={{ width: "100%" }}
                      onChange={(e) => setResolution(e.target.value)}
                    >
                      <option value="720">720p</option>
                      <option value="1080">1080p</option>
                      <option value="2160">4K</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="button-wrapper">
              <button
                className="accept cookie-button"
                onClick={() => handleExport()}
                disabled={isFeedbackButtonDisabled}
              >
                Export
              </button>
            </div>
            <button
              className="exit-button"
              onClick={() => setShowExportDialog(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 162 162"
                className="svgIconCross"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth="17"
                  stroke="black"
                  d="M9.01074 8.98926L153.021 153"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeWidth="17"
                  stroke="black"
                  d="M9.01074 153L153.021 8.98926"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      <Tooltip
        anchorSelect=".tooltip-timeline"
        place="top"
        style={{
          backgroundColor: "#892fff",
          color: "white",
          fontSize: "12px",
          padding: "5px",
          borderRadius: "4px",
        }}
      />
    </>
  );
};

export default Timeline;
