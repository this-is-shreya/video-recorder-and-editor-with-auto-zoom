import React from "react";
import { Link } from "react-router-dom";
import styles from "../../components/header/styles/header.module.css";

const Header = () => {
  return (
    <div className={styles.header}>
      <Link to={"/dashboard"}>Home</Link>
      <div className={styles["input-container"]}>
        <input type="text" id="input" placeholder="Title" />
        <div className={styles["underline"]}></div>
      </div>
    </div>
  );
};

export default Header;
