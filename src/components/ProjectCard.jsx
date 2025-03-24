import React, { useState } from "react";
import { PiVideo } from "react-icons/pi";
import { FiMoreVertical } from "react-icons/fi"; // Ellipsis menu icon
import { deleteBlobFromCache } from "../utils/cache";
import { Link } from "react-router-dom";

const ProjectCard = ({ date, setAllIds }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const day = new Date(Number(date)).getDate();
  const month = new Date(Number(date)).getMonth() + 1;
  const year = new Date(Number(date)).getFullYear();

  const handleDelete = () => {
    const data = JSON.parse(localStorage.getItem(date));
    data?.sourceAndTiming.forEach((source) => {
      deleteBlobFromCache(source.id);
    });
    localStorage.removeItem(date);
    let videoProjects = JSON.parse(localStorage.getItem("video-project-id"));
    videoProjects = videoProjects.filter((item) => item !== date);
    localStorage.setItem("video-project-id", JSON.stringify(videoProjects));
    setShowDialog(false);
    setAllIds(JSON.parse(localStorage.getItem("video-project-id")));
  };

  return (
    <div className="project-card">
      {/* Ellipsis Menu */}
      <div className="menu-container">
        <FiMoreVertical
          size={20}
          className="ellipsis-icon"
          onClick={() => setShowMenu(!showMenu)}
        />
        {showMenu && (
          <div className="menu">
            <button onClick={() => setShowDialog(true)}>Delete</button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="dialog">
          <p>Are you sure you want to delete this project?</p>
          <button onClick={handleDelete}>Yes</button>
          <button onClick={() => setShowDialog(false)}>Cancel</button>
        </div>
      )}
      <Link key={date} to={`/${date}`}>
        {/* Video Icon */}
        <PiVideo
          size={150}
          color="rgb(242 21 233)"
          style={{ margin: "0 auto" }}
        />

        {/* Project Details */}
        <p className="heading">Project Card</p>
        <p className="date">Created on: {`${day}-${month}-${year}`}</p>
      </Link>
    </div>
  );
};

export default ProjectCard;
