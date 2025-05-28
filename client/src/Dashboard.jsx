import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VscNewFolder } from "react-icons/vsc";
import { FaFolderOpen } from "react-icons/fa";
import { useUser, useAuth, SignedIn } from "@clerk/clerk-react";
import { notify } from "./utils/toast";
import Header from "./components/header/Header";

const Dashboard = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const username = user?.fullName;
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        if (!token) {
          navigate("/auth");
        } else {
          setToken(token);
        }
      }
    };
    fetchToken();
  }, []);

  if (!isLoaded) return <h1 style={{ textAlign: "center" }}>Loading...</h1>;
  if (!isSignedIn)
    return (
      <h1 style={{ textAlign: "center" }}>
        Please sign in to access the dashboard
      </h1>
    );

  const handleNew = async () => {
    if (!token) {
      navigate("/auth");
    }
    notify("Creating new project...", "info");
    navigate(`/new`);
};

  return (
    <>
      <Header />
      <h1 style={{ color: "white", textAlign: "center", marginTop: "30px", fontSize:"40px" }}>
        Welcome, {username ? username : "user"}
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
