import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../components/header/styles/header.module.css";
import { useAuth } from "@clerk/clerk-react";
import AppContext from "../../AppContext";
import { notify } from "../../utils/toast";

const Header = () => {
  const { projectTitle, setProjectTitle } = useContext(AppContext);
  const { signOut } = useAuth();
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
    <div className={styles.header}>
      <Link to={"/dashboard"}>Home</Link>
      {window.location.href.includes("dashboard") && (
        <button style={{marginLeft:"90%"}}
        onClick={handleSignOut}>Signout</button>
      )}
      {!window.location.href.includes("dashboard") && (
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
