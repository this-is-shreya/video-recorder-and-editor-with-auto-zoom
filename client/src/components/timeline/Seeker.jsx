import React, { useState, useEffect, useContext } from "react";
import AppContext from "../../AppContext";

const Seeker = () => {
  const {seekerPosition} = useContext(AppContext)

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: `${seekerPosition}px`, // Adjust based on timeline scale
        height: `280px`,
        width: "2px",
        background: "grey",
        zIndex:1,
        marginTop:"25px"
      }}
    />
  );
};

export default Seeker;
