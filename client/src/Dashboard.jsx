import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VscNewFolder } from "react-icons/vsc";
import { FaFolderOpen } from "react-icons/fa";
import { notify } from "./utils/toast";
import Header from "./components/header/Header";
import AppContext from "./AppContext";
import AuthContext from "./AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const {userData} = useContext(AuthContext)

  const handleNew = async () => {
    if (!userData) {
      navigate("/auth");
    }
    notify("Creating new project...", "info");
    navigate(`/new`);
  };

  useEffect(()=>{
    if (!userData) {
      console.log("USERDATA IS ", userData);
      navigate("/auth")
    }
  },[])
  return (
    <>
      <Header />
      <h1
        style={{
          color: "white",
          textAlign: "center",
          marginTop: "30px",
          fontSize: "40px",
        }}
      >
        Welcome, {userData ? userData.name : "user"}
      </h1>
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
    </>
  );
};

export default Dashboard;
