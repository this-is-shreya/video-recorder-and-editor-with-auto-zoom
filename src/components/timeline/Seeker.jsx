import React, { useState, useEffect } from "react";

const Seeker = ({seekerPosition}) => {

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: `${seekerPosition}px`, // Adjust based on timeline scale
        height: "100%",
        width: "2px",
        background: "grey",
        zIndex:1
      }}
    />
  );
};

export default Seeker;
