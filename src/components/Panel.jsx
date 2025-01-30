import React, { useState } from "react";
import { navbarObject } from "../utils/MediaEnum";
import Recorder from "./Recorder";
import Media from "./Media";

const Panel = (props) => {
  return (
    <>
      {props.panelType === navbarObject.record && <Recorder />}
      {props.panelType === navbarObject.media && <Media />}
    </>
  );
};

export default Panel;
