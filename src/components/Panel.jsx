import React, { useState } from "react";
import { navbarObject } from "../utils/MediaEnum";
import Recorder from "./Recorder";
import Media from "./Media";
import Video from "./Video";
import TextEffectPanel from "./TextEffectPanel";
import TextEffectSettings from "./TextEffectSettings";
import TransitionPanel from "./TransitionPanel";
import BackgroundPanel from "./BackgroundPanel";

const Panel = (props) => {
  return (
    <>
      {props.panelType === navbarObject.record && <Recorder />}
      {props.panelType === navbarObject.media && <Media />}
      {props.panelType === navbarObject.video && <Video />}
      {props.panelType === navbarObject.text && <TextEffectPanel />}
      {props.panelType === navbarObject.textSettings && <TextEffectSettings />}
      {props.panelType === navbarObject.transition && <TransitionPanel />}
      {props.panelType === navbarObject.background && <BackgroundPanel />}
    </>
  );
};

export default Panel;
