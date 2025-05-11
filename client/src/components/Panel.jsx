import React, { useState } from "react";
import { navbarObject } from "../utils/MediaEnum";
import Recorder from "./media/Recorder";
import Media from "./media/Media";
import Video from "./Video";
import TextEffectPanel from "./text/TextEffectPanel";
import TextEffectSettings from "./text/TextEffectSettings";
import TransitionPanel from "./transitions/TransitionPanel";
import BackgroundPanel from "./background/BackgroundPanel";
import Subtitles from "./subtitles/Subtitles";
import Icons from "./icons/Icons";
import SubtitleStyleSettings from "./subtitles/SubtitleStyleSettings";
import Elements from "./elements/Elements";

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
      {props.panelType === navbarObject.subtitles && <Subtitles />}
      {props.panelType === navbarObject.subtitleStyles && (
        <SubtitleStyleSettings />
      )}
      {props.panelType === navbarObject.icons && <Icons />}
      {props.panelType === navbarObject.elements && <Elements />}
    </>
  );
};

export default Panel;
