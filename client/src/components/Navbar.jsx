import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaRegClosedCaptioning } from "react-icons/fa6";
import { RiClosedCaptioningAiFill } from "react-icons/ri";
import { TbIcons } from "react-icons/tb";
import { MdElectricBolt } from "react-icons/md";
import {
  faClapperboard,
  faFont,
  faGear,
  faHurricane,
  faPhotoFilm,
  faSquare,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { navbarObject } from "../utils/MediaEnum";
import Panel from "./Panel";

const Navbar = () => {
  //need enums here
  const [activeState, setActiveState] = useState(navbarObject.media);

  return (
    <div className="preview-left">
      <div className="navbar">
        <button
          className={`navbar-option${
            activeState === navbarObject.media ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.media)}
        >
          <FontAwesomeIcon icon={faPhotoFilm} size="xl" />
          <span>Media</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.record ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.record)}
        >
          <FontAwesomeIcon icon={faVideo} size="xl" />
          <span>Record</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.video ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.video)}
        >
          <FontAwesomeIcon icon={faClapperboard} size="xl" />
          <span>Video</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.text ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.text)}
        >
          <FontAwesomeIcon icon={faFont} size="xl" />
          <span>Text</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.textSettings ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.textSettings)}
        >
          <FontAwesomeIcon icon={faGear} size="xl" />
          <span>Text Settings</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.transition ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.transition)}
        >
          <FontAwesomeIcon icon={faHurricane} size="xl" />
          <span>Transition</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.background ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.background)}
        >
          <FontAwesomeIcon icon={faSquare} size="xl" />
          <span>Background</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.subtitles ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.subtitles)}
        >
          <FaRegClosedCaptioning size={20} />
          <span>Subtitles</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.subtitleStyles ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.subtitleStyles)}
        >
          <RiClosedCaptioningAiFill size={20} />
          <span>Subtitle styles</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.icons ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.icons)}
        >
          <TbIcons size={20} />
          <span>Icons</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.elements ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.elements)}
        >
          <MdElectricBolt size={20} />
          <span>Elements</span>
        </button>
        <button
          className={`navbar-option${
            activeState === navbarObject.zoom ? " active" : ""
          }`}
          onClick={() => setActiveState(navbarObject.zoom)}
        >
          <MdElectricBolt size={20} />
          <span>Zoom</span>
        </button>
      </div>
      <Panel panelType={activeState} />
    </div>
  );
};

export default Navbar;
