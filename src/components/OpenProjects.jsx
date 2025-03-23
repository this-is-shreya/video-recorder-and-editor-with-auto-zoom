import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard";

const OpenProjects = () => {
  const navigate = useNavigate();
  const allIds = JSON.parse(localStorage.getItem("video-project-id"));
  console.log(allIds);
  //when a project gets deleted, all the associated media 
  // from cache should get deleted as well
  return (
    <div>
      <button onClick={() => navigate("/")}>Go back</button>
      <h2>Your Projects</h2>
      <div style={{ display: "flex", padding:"20px", gap:"20px" }}>
        {allIds &&
          allIds.map((project) => (
            <Link key={project} to={`/${project}`}>
              <ProjectCard date={project}/>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default OpenProjects;
