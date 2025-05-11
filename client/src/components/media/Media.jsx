import { faFileUpload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaMusic } from "react-icons/fa";
import React, { useContext, useState } from "react";
import { Tooltip } from "react-tooltip";
import { mediaType } from "../../utils/MediaEnum";
import AppContext from "../../AppContext";

const Media = () => {
  const {mediaFiles, setMediaFiles} = useContext(AppContext)
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files).map((file) => {
      return {
        file,
        preview: URL.createObjectURL(file),
      };
    });

    setMediaFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };
  const removeFile = (index) => {
    setMediaFiles((prevFiles) => {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(prevFiles[index].preview);
      return mediaFiles.filter((_, i) => i !== index);
    });
  };
  // console.log("files", files);
  const handleDragStart = (e, _mediaType, preview, index, fileObj) => {
    console.log("dragging", fileObj);

    const element =
      _mediaType === mediaType.audio
        ? e.currentTarget.querySelector("audio")
        : e.target;
    const id = Date.now();
    // Ensure metadata is loaded before accessing duration
    if (element.readyState >= 1 || _mediaType !== mediaType.video) {
      console.log("duration", element.duration, preview);
      const src = preview;
      e.dataTransfer.setData("text/plain", src);
      e.dataTransfer.setData("media-type", _mediaType);
      e.dataTransfer.setData("duration", Math.floor(element.duration ?? 10));
      e.dataTransfer.setData("id", id);
    } else {
      // If metadata isn't loaded, listen for it
      element.addEventListener(
        "loadedmetadata",
        () => {
          const videoSrc = preview;
          e.dataTransfer.setData("text/plain", videoSrc);
          e.dataTransfer.setData("media-type", "video");
          e.dataTransfer.setData("duration", Math.floor(element.duration));
          e.dataTransfer.setData("id", id);
        },
        { once: true }
      ); // Ensures the event fires only once
    }
  };

  return (
    <div className="panel">
      <label
        className="custom-file-upload"
        style={{
          cursor: "pointer",
          color: "#d5d5d6",
          backgroundColor: "#892fff",
        }}
      >
        <FontAwesomeIcon icon={faFileUpload} /> Import File
        <input
          type="file"
          accept=".mp4, .mp3, .jpg, .png, .webm, .ogg"
          multiple
          onChange={handleFileUpload}
        />
      </label>

      <br></br>
      <div className="media-container">
        {mediaFiles.map((fileObj, index) => (
          <div key={index} className="media-item" data-tooltip-id="tooltip">
            {fileObj.file.type.startsWith("video") && (
              <video
                src={fileObj.preview}
                draggable
                onDragStart={(e) =>
                  handleDragStart(
                    e,
                    mediaType.video,
                    fileObj.preview,
                    index,
                    fileObj
                  )
                }
                preload="metadata"
                onLoadedMetadata={(e) => {
                  if (e.target.duration === Infinity) {
                    // Force browser to calculate duration by seeking to the end
                    e.target.currentTime = Number.MAX_SAFE_INTEGER;
                    e.target.ontimeupdate = () => {
                      e.target.ontimeupdate = null;
                      console.log("Actual Duration:", e.target.duration);
                      e.target.currentTime = 0; // Reset to the beginning
                    };
                  } else {
                    console.log("Duration:", e.target.duration);
                  }
                }}
              />
            )}
            {fileObj.file.type.startsWith("audio") && (
              <div
                draggable
                onDragStart={(e) =>
                  handleDragStart(
                    e,
                    mediaType.audio,
                    fileObj.preview,
                    index,
                    fileObj
                  )
                }
              >
                <span><FaMusic size={30}/></span>
                <audio
                  src={fileObj.preview}
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    if (e.target.duration === Infinity) {
                      // Force browser to calculate duration by seeking to the end
                      e.target.currentTime = Number.MAX_SAFE_INTEGER;
                      e.target.ontimeupdate = () => {
                        e.target.ontimeupdate = null;
                        console.log("Actual Duration:", e.target.duration);
                        e.target.currentTime = 0; // Reset to the beginning
                      };
                    } else {
                      console.log("Duration:", e.target.duration);
                    }
                  }}
                />
              </div>
            )}

            {fileObj.file.type.startsWith("image") && (
              <img
                src={fileObj.preview}
                draggable
                onDragStart={(e) =>
                  handleDragStart(
                    e,
                    mediaType.image,
                    fileObj.preview,
                    index,
                    fileObj
                  )
                }
              />
            )}
            <button
              style={{
                color: "white",
                backgroundColor: "transparent",
                marginLeft:"15px",
                borderColor:"transparent",
                cursor:"pointer",
              }}
              onClick={() => removeFile(index)}
            >
              Remove<FontAwesomeIcon icon={faTrash} />
            </button>
            <Tooltip
              id="tooltip"
              place="right"
              content={fileObj.file.name}
              style={{
                backgroundColor: "#892fff",
                color: "white",
                fontSize: "12px",
                padding: "5px",
                borderRadius: "4px",
              }}
              />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Media;
