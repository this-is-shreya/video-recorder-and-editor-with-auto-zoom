import React, { useContext, useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import { notify } from "../utils/toast";
import Header from "./header/Header";
import { decryptData, fetchEncryptedData } from "../utils/authorization";
import AppContext from "../AppContext";
import { useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";

const OpenProjects = () => {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const {userData} = useContext(AuthContext)
  const navigate = useNavigate();
  
  useEffect(() => {
    setShowLoading(true);
    const fetchToken = async () => {
      if (!userData) {
        navigate("/auth");
      } else {
        let response = await fetchEncryptedData(
          `${import.meta.env.VITE_SERVER_URL}/api/user/projects`,
          userData.token
        );
        
        if (response.status !== 200 || response.data?.result.length === 0 || !response.data) {
          setMessage("No projects found");
          setShowLoading(false);
          return;
        }
        
        setProjects(response.data.result);
        setShowLoading(false);
      }
    };
    fetchToken();
  }, []);

  return (
    <>
      <Header />
      <div
        style={{
          color: "#cdc8c1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <h2 style={{ padding: "10px" }}>Your Projects</h2>
        {showLoading && <div className="loader"></div>}
        <div
          style={{
            display: "flex",
            padding: "20px",
            gap: "20px",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          {projects &&
            projects.map((project, index) => (
              <ProjectCard project={project} key={index} />
            ))}
          {!projects.length && <p>{message}</p>}
        </div>
      </div>
    </>
  );
};

export default OpenProjects;
