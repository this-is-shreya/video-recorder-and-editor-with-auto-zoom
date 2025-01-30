import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhotoFilm, faVideo } from "@fortawesome/free-solid-svg-icons";
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
        </button>
        <button
          className="navbar-option"
          onClick={() => setActiveState(navbarObject.record)}
        >
          <FontAwesomeIcon icon={faVideo} size="xl" />
        </button>
      </div>
      <Panel panelType={activeState} />
    </div>
  );
};

export default Navbar;
