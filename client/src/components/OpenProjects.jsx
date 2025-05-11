import React, { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import { notify } from "../utils/toast";

const OpenProjects = () => {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    setShowLoading(true);

    fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/projects`, {
      method: "GET",
    })
      .then(async (res) => {
        if (res.status !== 200) {
          setMessage("No projects found");
          setShowLoading(false);
          return;
        }
        const data = await res.json();
        setProjects(data);
        setShowLoading(false);
        console.log("data", data);
      })
      .catch((err) => {
        setShowLoading(false);
        notify("Error fetching projects", "error");
      });
  }, []);

  return (
    <div
      style={{
        color: "#cdc8c1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2 style={{ padding: "10px" }}>Your Projects</h2>
      {showLoading && <div className="loader"></div>}
      <div style={{ display: "flex", padding: "20px", gap: "20px" }}>
        {projects &&
          projects.map((project) => <ProjectCard project={project} />)}
        {!projects.length && <p>{message}</p>}
      </div>
    </div>
  );
};

export default OpenProjects;
