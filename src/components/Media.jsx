import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { mediaType } from "../utils/MediaEnum";
import { saveBlobToCache } from "../utils/cache";

const Media = () => {
  const [files, setFiles] = useState([]);
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files).map((file) => {
      return {
        file,
        preview: URL.createObjectURL(file),
      };
    });

    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };
  const removeFile = (index) => {
    setFiles((prevFiles) => {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(prevFiles[index].preview);
      return prevFiles.filter((_, i) => i !== index);
    });
  };
  // console.log("files", files);
  const handleDragStart = (e, _mediaType, preview, index) => {
    const element =
      _mediaType === mediaType.audio
        ? e.currentTarget.querySelector("audio")
        : e.target;
    const id = Date.now();
    // Ensure metadata is loaded before accessing duration
    if (element.readyState >= 1 || _mediaType !== mediaType.video) {
      console.log("duration", element.duration);
      const src = preview;
      e.dataTransfer.setData("text/plain", src);
      e.dataTransfer.setData("media-type", _mediaType);
      e.dataTransfer.setData("duration", Math.floor(element.duration ?? 10));
      e.dataTransfer.setData("id", id);
      saveBlobToCache(id, new Blob([files[index].file], { type: _mediaType }));
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
          saveBlobToCache(
            id,
            new Blob([files[index].file], { type: _mediaType })
          );
        },
        { once: true }
      ); // Ensures the event fires only once
    }
  };

  return (
    <div className="panel">
      <label className="custom-file-upload">
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
        {files.map((fileObj, index) => (
          <div key={index} className="media-item">
            {fileObj.file.type.startsWith("video") && (
              <video
                src={fileObj.preview}
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, mediaType.video, fileObj.preview, index)
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
                  handleDragStart(e, mediaType.audio, fileObj.preview, index)
                }
              >
                <span>🎵</span>
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
                  handleDragStart(e, mediaType.image, fileObj.preview, index)
                }
              />
            )}
            <p>{fileObj.file.name}</p>
            <button onClick={() => removeFile(index)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Media;
