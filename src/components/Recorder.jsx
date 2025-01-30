import { useReactMediaRecorder } from "react-media-recorder";
import { recordingType } from "../utils/MediaEnum";
import { useEffect, useRef, useState } from "react";
import { downloadFile } from "../utils/downloadFile";

const Recorder = () => {
  const [recording, setRecording] = useState(false);
  const [recordElement, setRecordElement] = useState(recordingType.camera);
  const isMounted = useRef(null);

  const cameraObj = useReactMediaRecorder({
    video: true,
    audio: true,
    blobPropertyBag: { type: "video/mp4" },
  });

  const screenObj = useReactMediaRecorder({
    screen: true,
    audio: true,
    blobPropertyBag: { type: "video/mp4" },
  });

  const handleRecording = () => {
    console.log(recording);
    if (recording) {
      if (
        recordElement === recordingType.camera ||
        recordElement == recordingType.screenAndCamera
      ) {
        cameraObj.startRecording();
        console.log("started CAMERA");
      }
      if (
        recordElement === recordingType.screen ||
        recordElement == recordingType.screenAndCamera
      ) {
        screenObj.startRecording();
        console.log("started SCREEN");
      }
    }
  };
  useEffect(() => {
    if (!recording) {
      if (cameraObj) {
        cameraObj.stopRecording();
        if (cameraObj.mediaBlobUrl) {
          console.log("Downloading CAMERA recording");
          downloadFile(cameraObj);
          cameraObj.clearBlobUrl();
        }
      }
      if (screenObj) {
        screenObj.stopRecording();
        if (screenObj.mediaBlobUrl) {
          console.log("Downloading SCREEN recording");
          downloadFile(screenObj);
          screenObj.clearBlobUrl();
        }
      }
    } else {
      handleRecording();
    }
  }, [
    cameraObj.mediaBlobUrl,
    screenObj.mediaBlobUrl,
    recording,
    cameraObj.status,
    screenObj.status,
  ]);

  return (
    <div className="panel">
      <select
        name="recordElement"
        onChange={(e) => setRecordElement(e.target.value)}
      >
        <option value={recordingType.camera}>Camera</option>
        <option value={recordingType.screen}>Screen</option>
        <option value={recordingType.screenAndCamera}>Screen and Camera</option>
      </select>
      <button
        onClick={() => {
          setRecording(!recording);
        }}
      >
        {(recording ? "Stop" : "Start") + " Recording"}
      </button>
    </div>
  );
};

export default Recorder;
