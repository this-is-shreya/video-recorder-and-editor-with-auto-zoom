"use client";

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";
import { RiCameraLensAiLine } from "react-icons/ri";
import { notify } from "./utils/toast";
import AuthContext from "./AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { userData, setUserData } = useContext(AuthContext);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // Call the main process to handle OAuth
      await window.electronAPI.startGoogleAuth();
    } catch (error) {
      console.error("Auth error:", error);
      notify("Something went wrong", "error");
      setIsLoading(false);
    }
  };

  const getUserInfo = async (accessToken) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      console.log("User Info:", data); // data.email, data.name, data.picture, etc.

      return data;
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  // Set up the auth success listener
  useEffect(() => {
    const handleAuthSuccess = async (event, token) => {
      console.log("Auth success received in renderer:", token);
      setIsLoading(false);

      // Handle the successful authentication here
      const _userData = await getUserInfo(token);
      _userData.token = token;
      console.log("userdata", _userData);
      setUserData(_userData);
      localStorage.setItem("userData", JSON.stringify(_userData));
      notify("Successfully logged in!", "success");
      navigate("/dashboard");
    };

    const handleAuthError = (event, error) => {
      console.error("Auth error received:", error);
      setIsLoading(false);
      notify("Authentication failed", "error");
    };

    // Set up the listeners
    window.electronAPI.onAuthSuccess(handleAuthSuccess);
    window.electronAPI.onAuthError(handleAuthError);

    // Cleanup function
    return () => {
      window.electronAPI.removeListener("auth-success", handleAuthSuccess);
      window.electronAPI.removeListener("auth-error", handleAuthError);
    };
  }, [navigate]);

  useEffect(() => {
    const stored = localStorage.getItem("userData")
      ? JSON.parse(localStorage.getItem("userData"))
      : null;
    if(stored){
      setUserData(stored);
      navigate("/dashboard")
    }
  }, []);
  return (
    <>
      <div className={styles["navbar"]}>
        <div
          style={{
            color: "white",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <RiCameraLensAiLine color="#EB1AB4" size={"40"} />
          <h3 style={{ verticalAlign: "middle" }}>RookieClip</h3>
        </div>
      </div>
      <div className={styles["login-form"]}>
        <h1 style={{ fontSize: "40px" }}>Welcome, sign in to continue</h1>
        <button
          className={styles["oauth-button"]}
          onClick={handleGoogleAuth}
          disabled={isLoading}
        >
          <svg className={styles["icon"]} viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            ></path>
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            ></path>
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            ></path>
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            ></path>
            <path d="M1 1h22v22H1z" fill="none"></path>
          </svg>
          {isLoading ? "Authenticating..." : "Continue with Google"}
        </button>
      </div>
    </>
  );
}
