import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard";

const OpenProjects = () => {
  const navigate = useNavigate();
  const [allIds, setAllIds] = useState(
    JSON.parse(localStorage.getItem("video-project-id"))
  );

  return (
    <div>
      <button onClick={() => navigate("/")}>Go back</button>
      <h2>Your Projects</h2>
      <div style={{ display: "flex", padding: "20px", gap: "20px" }}>
        {allIds &&
          allIds.map((project) => <ProjectCard key={project} date={project} setAllIds={setAllIds}/>)}
      </div>
    </div>
  );
};

export default OpenProjects;
