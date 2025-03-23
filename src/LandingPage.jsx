import React, { useState } from "react";
import App from "./App";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleNew = () => {
    const timestamp = Date.now(); // Generate a unique ID
    navigate(`/${timestamp}`); // Navigate to new project
  };

  return (
    <div>
      <button onClick={handleNew}>New</button>
      <button onClick={() => navigate("/open")}>Open</button>
    </div>
  );
};

export default LandingPage;
