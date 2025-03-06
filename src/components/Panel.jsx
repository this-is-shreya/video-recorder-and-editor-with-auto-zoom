import React, { useState } from "react";
import { navbarObject } from "../utils/MediaEnum";
import Recorder from "./Recorder";
import Media from "./Media";
import Video from "./Video";
import TextEffectPanel from "./TextEffectPanel";
import TextEffectSettings from "./TextEffectSettings";

const Panel = (props) => {
  return (
    <>
      {props.panelType === navbarObject.record && <Recorder />}
      {props.panelType === navbarObject.media && <Media />}
      {props.panelType === navbarObject.video && <Video />}
      {props.panelType === navbarObject.text && <TextEffectPanel />}
      {props.panelType === navbarObject.textSettings && <TextEffectSettings/>}
    </>
  );
};

export default Panel;
