import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClapperboard, faFont, faGear, faHurricane, faPhotoFilm, faSquare, faVideo } from "@fortawesome/free-solid-svg-icons";
import { navbarObject } from "../utils/MediaEnum";
import Panel from "./Panel";

const Navbar = () => {
  //need enums here
  const [activeState, setActiveState] = useState(navbarObject.media);

  return (
    <div className="preview-left">
      <div className="navbar">
        <button
          className="navbar-option"
          onClick={() => setActiveState(navbarObject.media)}
        >
          <FontAwesomeIcon icon={faPhotoFilm} size="xl" />
          <span>Media</span>
        </button>
        <button
          className="navbar-option"
          onClick={() => setActiveState(navbarObject.record)}
        >
          <FontAwesomeIcon icon={faVideo} size="xl" />
          <span>Record</span>
        </button>
        <button
          className="navbar-option"
          onClick={() => setActiveState(navbarObject.video)}
        >
          <FontAwesomeIcon icon={faClapperboard} size="xl" />
          <span>Video</span>
        </button>
        <button
          className="navbar-option"
          onClick={() => setActiveState(navbarObject.text)}
        >
          <FontAwesomeIcon icon={faFont} size="xl" />
          <span>Text</span>
        </button>
        <button
          className="navbar-option"
          onClick={() => setActiveState(navbarObject.textSettings)}
        >
          <FontAwesomeIcon icon={faGear} size="xl" />
          <span>Text Settings</span>
        </button>
        <button
          className="navbar-option"
          onClick={() => setActiveState(navbarObject.transition)}
        >
          <FontAwesomeIcon icon={faHurricane} size="xl" />
          <span>Transition</span>
        </button>
        <button
          className="navbar-option"
          onClick={() => setActiveState(navbarObject.background)}
        >
          <FontAwesomeIcon icon={faSquare} size="xl" />
          <span>Background</span>
        </button>
      </div>
      <Panel panelType={activeState} />
    </div>
  );
};

export default Navbar;
