import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../components/header/styles/header.module.css";
import { useAuth } from "@clerk/clerk-react";
import AppContext from "../../AppContext";
import { notify } from "../../utils/toast";
import { RiCameraLensAiLine } from "react-icons/ri";

const Header = () => {
  const { projectTitle, setProjectTitle } = useContext(AppContext);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [textProjectTitle, setTextProjectTitle] = useState(projectTitle);

  const handleSignOut = () => {
    signOut({ redirectUrl: "/auth" }).catch(() => {
      notify("Something went wrong", "error");
    });
  };

  useEffect(() => {
    setTextProjectTitle(projectTitle);
  }, [projectTitle]);

  return (
    <div
      className={
        !window.location.href.includes("dashboard") &&
        !window.location.href.includes("open")
          ? styles["container"]
          : ""
      }
    >
      <div className={styles.header}>
        <button
          style={{ backgroundColor: "transparent", border:"none", cursor:"pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          <RiCameraLensAiLine
            color="#EB1AB4"
            size={"40"}
            
          />
        </button>

        {(window.location.href.includes("dashboard") ||
          window.location.href.includes("open")) && (
          <button
            className="button-purple"
            style={{ width: "80px", height: "30px" }}
            onClick={() => handleSignOut()}
          >
            Signout
          </button>
        )}
      </div>

      {!window.location.href.includes("dashboard") &&
        !window.location.href.includes("open") && (
          <div className={styles["input-container"]}>
            <input
              type="text"
              id="input"
              placeholder="Title"
              value={textProjectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
            <div className={styles["underline"]}></div>
          </div>
        )}
    </div>
  );
};

export default Header;
