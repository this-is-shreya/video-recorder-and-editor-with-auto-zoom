import React, { useState } from "react";
import { PiVideo } from "react-icons/pi";
import { FiMoreVertical } from "react-icons/fi"; // Ellipsis menu icon
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { notify } from "../utils/toast"

const ProjectCard = ({ project }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { getToken } = useAuth();

  const handleDelete = async (project_id) => {
    const token = await getToken();
    if (!token) {
      navigate("/auth");
    } else {
      fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/user/project/${project_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials:"include"
        }
      )
        .then(async (res) => {
          if (res.status !== 200) {
            notify("Error deleting project", "error");
            return;
          }
          window.location.reload();
        })
        .catch((err) => {
          notify("Error deleting project", "error");
        });
    }
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
            <button
              onClick={() => {
                setShowMenu(false);
                setShowDialog(true);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="cookies-overlay">
          <div className="cookies-card">
            <p className="cookie-para">
              Are you sure you want to delete this project?
            </p>

            <div className="button-wrapper">
              <button
                className="accept cookie-button"
                onClick={() => {
                  handleDelete(project.project_id);
                }}
              >
                Yes
              </button>
              <button
                className="reject cookie-button"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>
            </div>
            <button
              className="exit-button"
              onClick={() => setShowDialog(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 162 162"
                className="svgIconCross"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth="17"
                  stroke="black"
                  d="M9.01074 8.98926L153.021 153"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeWidth="17"
                  stroke="black"
                  d="M9.01074 153L153.021 8.98926"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      <Link key={project.project_id} to={`/${project.project_id}`}>
        {/* Video Icon */}
        <PiVideo
          size={150}
          color="rgb(242 21 233)"
          style={{ margin: "0 auto" }}
        />

        {/* Project Details */}
        <p className="heading">{project.project_title}</p>
        <p className="date">{project.created_at.split("T")[0]}</p>
      </Link>
    </div>
  );
};

export default ProjectCard;
