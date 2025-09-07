import React from "react";
import bgStyles1 from "./styles/background1.module.css";
import bgStyles2 from "./styles/background2.module.css";
import bgStyles3 from "./styles/background3.module.css";
import bgStyles4 from "./styles/background4.module.css";
import bgStyles5 from "./styles/background5.module.css";
import { backgroundType } from "../../utils/MediaEnum";

const styleMap = {
  "background-1": bgStyles1,
  "background-2": bgStyles2,
  "background-3": bgStyles3,
  "background-4": bgStyles4,
  "background-5": bgStyles5,
};

const Background = ({trackNum, variant="background-1"}) => {
  const styles = styleMap[variant] || bgStyles1;
  return <div className={styles["container"]} style={{zIndex:trackNum}}></div>;
};

export default Background;
