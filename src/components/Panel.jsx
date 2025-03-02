import React, { useState } from "react";
import { navbarObject } from "../utils/MediaEnum";
import Recorder from "./Recorder";
import Media from "./Media";
import Video from "./Video";
import TextEffectPanel from "./TextEffectPanel";

const Panel = (props) => {
  return (
    <>
      {props.panelType === navbarObject.record && <Recorder />}
      {props.panelType === navbarObject.media && <Media />}
      {props.panelType === navbarObject.video && <Video />}
      {props.panelType === navbarObject.text && <TextEffectPanel />}
    </>
  );
};

export default Panel;
