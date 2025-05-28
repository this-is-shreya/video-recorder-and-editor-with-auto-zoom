import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";
import { RiCameraLensAiLine } from "react-icons/ri";
import { FaClapperboard, FaQuoteLeft, FaStar } from "react-icons/fa6";
import { BsStars } from "react-icons/bs";

const LandingPage = () => {
  const navigate = useNavigate();
  const featureSet = [
    "Record and edit in one place",
    "Smooth transitions",
    "Auto generate subtitles",
    "Zoom into a specific point",
    "Titlecards, lowerthirds and more!",
  ];
  return (
    <div className={styles["container"]}>
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
        <a
          href="https://ko-fi.com/rookieclip"
          target="_blank"
          className="button-purple"
          style={{
            width: "fit-content",
            height: "30px",
            fontSize: "15px",
            padding: "5px",
            marginTop: "10px",
            marginRight: "5px",
            backgroundColor: "white",
            textDecoration: "none",
          }}
        >
          Support me
        </a>
      </div>
      <div className={styles["hero-section"]}>
        <div>
          <h1 style={{ color: "white", fontSize: "40px" }}>EDIT LIKE A PRO</h1>
          <hr />
          <p style={{ color: "#ddd", marginTop: "10px", fontSize: "20px" }}>
            Screen recorder and video editor packed with powerful features like
            drag-and-drop timelines, zoom effects, text overlays, and one-click
            transitions.
          </p>
          <button
            className="button-purple"
            style={{ marginTop: "10px" }}
            onClick={() => navigate("/auth")}
          >
            Get started
          </button>
          <div className={styles["user-rating"]}>
            {/* <div className={styles["avatars"]}>
              <img
                className={styles["avatar"]}
                src="/assets/aesthetic.png"
              ></img>
              <img
                className={styles["avatar"]}
                src="/assets/aesthetic.png"
              ></img>
              <img
                className={styles["avatar"]}
                src="/assets/aesthetic.png"
              ></img>
            </div> */}
            <div className={styles["rating"]}>
              <div className={styles["stars"]}>
                <FaStar color="#fed187" size={"25"} />
                <FaStar color="#fed187" size={"25"} />
                <FaStar color="#fed187" size={"25"} />
                <FaStar color="#fed187" size={"25"} />
                <FaStar color="#fed187" size={"25"} />
              </div>
              <p style={{ color: "#ddd" }}>
                10+ creators record using RookieClip
              </p>
            </div>
            <label style={{ backgroundColor: "#f5e2bf", fontSize: "15px", padding:"5px", width:"fit-content", borderRadius:"5px" }}>
              <BsStars />Last updated on 26 May, 2025
            </label>
          </div>
        </div>
        <div className={styles["video-demo"]}>
          <video src=""></video>
        </div>
      </div>
      <h1 style={{ marginTop: "10%", textAlign: "center" }}>
        Create beautiful videos with just a click!
      </h1>
      <div className={styles["feature-section"]}>
        <div className={styles["features"]}>
          {featureSet.map((val, index) => (
            <div
              key={index}
              className={styles["feature"]}
              data-alt={`${index}`}
            >
              <h3>{val}</h3>
            </div>
          ))}
        </div>
        <div className={styles["video-demo"]}>
          <video src=""></video>
        </div>
      </div>
      <div className={styles["testimonials"]}>
        <div className={styles["testimonial"]}>
          <FaQuoteLeft color="EB1AB4" size={"30"} />
          <p>
            The zoom effects are spot-on, the cursor tracking is super smooth
            and the editing tools are easy to use. It's exactly what I needed!
          </p>
          <div className={styles["user-details"]}>
            <img className={styles["avatar"]} src="/assets/aesthetic.png"></img>
            <div>
              <h4>Name</h4>
              <p>@user</p>
            </div>
          </div>
        </div>
        <div className={styles["testimonial"]}>
          <FaQuoteLeft color="EB1AB4" size={"30"} />
          <p>
            The zoom effects are spot-on, the cursor tracking is super smooth
            and the editing tools are easy to use. It's exactly what I needed!
          </p>
          <div className={styles["user-details"]}>
            <img className={styles["avatar"]} src="/assets/aesthetic.png"></img>
            <div>
              <h4>Name</h4>
              <p>@user</p>
            </div>
          </div>
        </div>
      </div>
      <h1 style={{ marginTop: "10%", textAlign: "center" }}>
        What are you waiting for?
      </h1>
      <button
        className="button-purple"
        style={{
          margin: "0 auto",
          marginTop: "20px",
          width: "100px",
          height: "40px",
          fontSize: "15px",
        }}
        onClick={() => navigate("/auth")}
      >
        Get started
      </button>
      <div className={styles["footer"]}>
        <p style={{ color: "#ddd" }}>
          Copyright © 2025 RookieClip | All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
