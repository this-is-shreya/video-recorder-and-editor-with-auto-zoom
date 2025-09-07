import React, { useState, useEffect, useContext } from "react";
import AppContext from "../../AppContext";

const Seeker = () => {
  const {seekerPosition} = useContext(AppContext)
  return (
    <div
      style={{
        position: "absolute",
        top: -100,
        left: `${seekerPosition}px`, // Adjust based on timeline scale
        height: "600px",
        width: "2px",
        background: "#cbc3c3",
        zIndex: 1,
        marginTop: "25px",
      }}
    />
  );
};

export default Seeker;
