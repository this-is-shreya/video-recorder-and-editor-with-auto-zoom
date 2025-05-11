import React, { useState } from "react";
import { mediaType } from "../../utils/MediaEnum";

const Elements = () => {
  const handleDragStart = (e) => {
    const element =
      e.target.tagName.toLowerCase() === "img"
        ? e.target
        : e.target.querySelector("img");
    console.log(element);
    
    if (!element) {
      e.dataTransfer.setData("text/plain", e.target.getAttribute("alt"));
      e.dataTransfer.setData("media-type", e.target.getAttribute("media-type"));
    } else {
      e.dataTransfer.setData("text/plain", element.getAttribute("alt"));
      e.dataTransfer.setData("media-type", element.getAttribute("media-type"));
    }
    e.dataTransfer.setData("duration", 4);
    const id = Date.now();
    e.dataTransfer.setData("id", id);
  };

  return (
    <div className="panel">
      <div className="media-container">
        <div className="media-item">
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#fff",
              opacity: 0.1,
            }}
            draggable
            onDragStart={handleDragStart}
            alt="blurred-element"
            media-type={mediaType.icons}
          ></div>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={handleDragStart}
          alt="/assets/Subscribe Button.mp4"
          media-type={mediaType.video}
        >
          <video src="/assets/Subscribe Button.mp4"></video>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={handleDragStart}
          alt="/assets/Loader Circles.mp4"
          media-type={mediaType.video}
        >
          <video src="/assets/Loader Circles.mp4"></video>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={handleDragStart}
          alt="/assets/Loader Blobs.mp4"
          media-type={mediaType.video}
        >
          <video src="/assets/Loader Blobs.mp4"></video>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={handleDragStart}
          alt="/assets/Spinner.mp4"
          media-type={mediaType.video}
        >
          <video src="/assets/Spinner.mp4"></video>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={handleDragStart}
          alt="/assets/Youtube Subscribe.gif"
          media-type={mediaType.image}
        >
          <img
            src="/assets/Youtube Subscribe.gif"
            alt="/assets/Youtube Subscribe.gif"
            media-type={mediaType.image}
          ></img>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={handleDragStart}
          alt="/assets/Subscribe Button.gif"
          media-type={mediaType.image}
        >
          <img
            src="/assets/Subscribe Button.gif"
            alt="/assets/Subscribe Button.gif"
            media-type={mediaType.image}
          ></img>
        </div>
      </div>
    </div>
  );
};

export default Elements;
