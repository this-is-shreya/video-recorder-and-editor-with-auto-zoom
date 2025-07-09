import { useContext, useEffect, useRef, useState } from "react";
import "./App.css";
import AppContext from "./AppContext";
import Navbar from "./components/Navbar";
import Timeline from "./components/timeline/Timeline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { pixels } from "./utils/PixelsPerSecondEnum";
import Header from "./components/header/Header";
import { useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "./VideoPlayer";
import ExportPreview from "./components/export/ExportPreview";
import { ReactMediaRecorder } from "react-media-recorder";
import { convertBlobToBase64 } from "./utils/blobToBase64";
import { notify } from "./utils/toast";
import { useAuth, useUser } from "@clerk/clerk-react";
import CryptoJS from "crypto-js";
import { sendEncryptedData, sendUnencryptedData } from "./utils/authorization";
import AuthContext from "./AuthContext";

function App() {
  const {userData} = useContext(AuthContext)
  let { id } = useParams();
  id = id ? id : Date.now();
  const navigate = useNavigate();
  const [seekerPosition, setSeekerPosition] = useState(0);
  const [sourceAndTiming, setSourceAndTiming] = useState([]);
  const [currentSourceAndTiming, setCurrentSourceAndTiming] = useState([]);
  const [effectsAndTiming, setEffectsAndTiming] = useState([]);
  const [currentEffectsAndTiming, setCurrentEffectsAndTiming] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedElement, setSelectedElement] = useState({});
  const [isSpeedChange, setIsSpeedChange] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [maxTime, setMaxTime] = useState("00:00:00");
  const videoPlayerRef = useRef(null);
  const [seekerPositionManuallyChanged, setSeekerPositionManuallyChanged] =
    useState(false);
  const [zoomTimeline, setZoomTimeline] = useState(1); //to be worked on
  const [isSplit, setIsSplit] = useState(false);
  const [isTrim, setIsTrim] = useState(false);
  const [isTimerChanged, setIsTimerChanged] = useState(false);
  const [dataArray, setDataArray] = useState([]);
  const [undo, setUndo] = useState(false);
  const [redo, setRedo] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16/9");
  const [isExportPreview, setIsExportPreview] = useState(false);
  const [isSubtitleGen, setIsSubtitleGen] = useState(false);
  const [subtitleArray, setSubtitleArray] = useState([]);
  const [subtitleStyle, setSubtitleStyle] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [projectTitle, setProjectTitle] = useState("Project Title");
  const [cursorDataObj, setCursorDataObj] = useState([]);
  const [selectedZoomElement, setSelectedZoomElement] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const screenRecorder = useRef(null);
  const cameraRecorder = useRef(null);
  const screenChunks = useRef([]);
  const cameraChunks = useRef([]);
  const activeStreams = useRef([])
  const [isRecordingCursor, setIsRecordingCursor] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);

  const convertToFormattedTime = (position) => {
    const time = Math.floor(position);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedHours = hours < 10 ? `0${hours}` : hours;

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };
  const convertToPixels = (time) => {
    const timeInSeconds = time.split(":").reduce((acc, time) => {
      return acc * 60 + parseInt(time, 10);
    }, 0);
    return timeInSeconds * pixels[zoomTimeline];
  };
  const getWidthByAspectRatio = (aspectRatio) => {
    switch (aspectRatio) {
      case "9/16":
      case "3/4":
        return "20vw"; // Reduce width for taller aspect ratios
      case "4/3":
        return "35vw"; // Slightly reduce width for 4:3
      case "16/9":
        return "40vw";
      default:
        return "40vw"; // Default for 16:9 or unknown ratios
    }
  };
  const handleSave = async (sources, effects, elements, positions, cursorDataObj) => {
    if (sources.length === 0 && effects.length === 0) {
      notify("Please add a media on the timeline before saving", "warning");
      return;
    }
    notify("Saving project...", "info");
    sources = await convertBlobToBase64(sources);
    const projectId = window.location.href.includes("new")
      ? id
      : window.location.pathname.split("/")[1];
    const projectData = {
      source_and_timing: sources,
      effects_and_timing: effects,
      elements: elements,
      positions: positions,
      project_id: projectId,
      project_title: !projectTitle ? "Project Title" : projectTitle,
      cursor_data_obj: cursorDataObj
    };

    try {
      const unencryptedDataReq = await sendUnencryptedData(
        `${import.meta.env.VITE_SERVER_URL}/api/user/save-data`,
        projectData,
        userData.token
      );
      if (unencryptedDataReq?.ok) {
        notify("Project saved successfully!", "success");
        if (window.location.href.includes("new")) {
          navigate(`/${projectId}`);
        }
      } else if (unencryptedDataReq?.status === 401) {
        notify("Please login to continue", "info");
        navigate("/auth");
      } else {
        notify("Error saving project data", "error");
      }
    } catch (error) {
      notify("Error saving project data", "error");
    }
  };

  useEffect(() => {
    setCurrentTime(
      convertToFormattedTime(seekerPosition / pixels[zoomTimeline])
    );
  }, [seekerPosition]);

  return (
    <AppContext.Provider
      value={{
        seekerPosition: seekerPosition,
        setSeekerPosition: setSeekerPosition,
        sourceAndTiming: sourceAndTiming,
        setSourceAndTiming: setSourceAndTiming,
        currentSourceAndTiming: currentSourceAndTiming,
        setCurrentSourceAndTiming: setCurrentSourceAndTiming,
        effectsAndTiming: effectsAndTiming,
        setEffectsAndTiming: setEffectsAndTiming,
        currentEffectsAndTiming: currentEffectsAndTiming,
        setCurrentEffectsAndTiming: setCurrentEffectsAndTiming,
        isPlaying: isPlaying,
        setIsPlaying: setIsPlaying,
        selectedElement: selectedElement,
        setSelectedElement: setSelectedElement,
        isSpeedChange: isSpeedChange,
        setIsSpeedChange: setIsSpeedChange,
        maxTime: maxTime,
        setMaxTime: setMaxTime,
        convertToFormattedTime: convertToFormattedTime,
        convertToPixels: convertToPixels,
        videoPlayerRef: videoPlayerRef,
        seekerPositionManuallyChanged: seekerPositionManuallyChanged,
        setSeekerPositionManuallyChanged: setSeekerPositionManuallyChanged,
        zoomTimeline: zoomTimeline,
        setZoomTimeline: setZoomTimeline,
        isSplit: isSplit,
        setIsSplit: setIsSplit,
        isTrim: isTrim,
        setIsTrim: setIsTrim,
        isTimerChanged: isTimerChanged,
        setIsTimerChanged: setIsTimerChanged,
        dataArray: dataArray,
        setDataArray: setDataArray,
        aspectRatio: aspectRatio,
        setAspectRatio: setAspectRatio,
        getWidthByAspectRatio: getWidthByAspectRatio,
        projectId: id,
        isExportPreview: isExportPreview,
        subtitleArray: subtitleArray,
        setSubtitleArray: setSubtitleArray,
        subtitleStyle: subtitleStyle,
        setSubtitleStyle: setSubtitleStyle,
        mediaFiles: mediaFiles,
        setMediaFiles: setMediaFiles,
        projectTitle: projectTitle,
        setProjectTitle: setProjectTitle,
        isExportPreview: isExportPreview,
        setIsExportPreview: setIsExportPreview,
        isSubtitleGen: isSubtitleGen,
        setIsSubtitleGen: setIsSubtitleGen,
        cursorDataObj: cursorDataObj,
        setCursorDataObj: setCursorDataObj,
        selectedZoomElement: selectedZoomElement,
        setSelectedZoomElement: setSelectedZoomElement,
        isRecording: isRecording,
        setIsRecording: setIsRecording,
        screenRecorder: screenRecorder,
        cameraRecorder: cameraRecorder,
        screenChunks: screenChunks,
        cameraChunks: cameraChunks,
        activeStreams: activeStreams,
        isRecordingCursor: isRecordingCursor,
        setIsRecordingCursor: setIsRecordingCursor,
        recordingStartTime: recordingStartTime,
        setRecordingStartTime: setRecordingStartTime
      }}
    >
      {!isExportPreview && (
        <>
          <Header />
          <Navbar />
          <div className="video-preview">
            <VideoPlayer />
            <div className="video-player-controls">
              <span>{currentTime}</span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ backgroundColor: "transparent", border: "none" }}
              >
                {isPlaying ? (
                  <FontAwesomeIcon icon={faPause} size="lg" />
                ) : (
                  <FontAwesomeIcon icon={faPlay} size="lg" />
                )}
              </button>
              <span>{maxTime}</span>
            </div>
          </div>
          <Timeline
            undo={undo}
            redo={redo}
            setUndo={setUndo}
            setRedo={setRedo}
            handleSave={handleSave}
          />
        </>
      )}
      {isExportPreview && <ExportPreview />}
    </AppContext.Provider>
  );
}

export default App;
