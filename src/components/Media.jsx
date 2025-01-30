import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

const Media = () => {
  const [files, setFiles] = useState([]);
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

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
  const handleDragStart = (e) => {
    console.log("all data ", e.target)
    const videoSrc = e.target.getAttribute("src");
    e.dataTransfer.setData("text/plain", videoSrc);
    e.dataTransfer.setData("media-type","video");
    e.dataTransfer.setData("duration", Math.ceil(e.target.duration));
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
          <div
            key={index}
            className="media-item"
            
          >
            {fileObj.file.type.startsWith("video") && (
              <video
                src={fileObj.preview}
                draggable
                onDragStart={handleDragStart}
              />
            )}
            {fileObj.file.type.startsWith("audio") && (
              <audio
                src={fileObj.preview}
                controls
          
              />
            )}
            {fileObj.file.type.startsWith("image") && (
              <img src={fileObj.preview} />
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
