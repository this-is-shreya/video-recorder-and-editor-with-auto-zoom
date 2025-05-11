import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VscNewFolder } from "react-icons/vsc";
import { FaFolderOpen } from "react-icons/fa";
import { useUser, useAuth, SignedIn } from "@clerk/clerk-react";
import { notify } from "./utils/toast";

const LandingPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const sendToken = async () => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Backend response:", res);
    };

    if (isSignedIn) {
      sendToken();
    }
  }, [isSignedIn, getToken]);

  if (!isLoaded) return <h1 style={{ textAlign: "center" }}>Loading...</h1>;
  if (!isSignedIn)
    return (
      <h1 style={{ textAlign: "center" }}>
        Please sign in to access the dashboard
      </h1>
    );

  const handleNew = async() => {
    const token = await getToken();

    const timestamp = Date.now();
    const projectData = {
      source_and_timing: null,
      effects_and_timing: null,
      elements: null,
      positions: null,
      project_id: timestamp,
      project_title: "Project Title",
    };
    notify("Craeting new project...", "info");

    fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/save-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(projectData),
    })
      .then((res) => {
        if (res.ok) {
          notify("Project created successfully!", "success");
          navigate(`/${timestamp}`);
        } else {
          notify("Error creating new project", "error");
        }
      })
      .catch((error) => {
        notify("Error creating new project", "error");
      });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "50px",
        gap: "20px",
      }}
    >
      <button
        className="project-card"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={handleNew}
      >
        <VscNewFolder size={35} />
        <label style={{ fontSize: "25px" }}>New</label>
      </button>
      <button
        className="project-card"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={() => navigate("/open")}
      >
        <FaFolderOpen size={35} />
        <label style={{ fontSize: "25px" }}>Open</label>{" "}
      </button>
    </div>
  );
};

export default LandingPage;
