import React, { useContext, useEffect, useState } from "react";
import { LuCaptions } from "react-icons/lu";
import { subStyles } from "../../utils/MediaEnum";
import AppContext from "../../AppContext";

const SubtitleStyleSettings = () => {
  const { setSubtitleStyle } = useContext(AppContext);
  const [selectedStyle, setSelectedStyle] = useState(subStyles.style1);

  useEffect(() => {
    setSubtitleStyle(selectedStyle);
  }, [selectedStyle]);
  return (
    <div className="panel">
      <div className="media-container">
        <div
          className="media-item"
          style={{
            border: selectedStyle === subStyles.style1 ? "1px solid blue" : "",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
          }}
          onClick={() => setSelectedStyle(subStyles.style1)}
        >
          <LuCaptions size={50} />
          <label>highlight 1</label>
        </div>
        <div
          className="media-item"
          style={{
            border: selectedStyle === subStyles.style2 ? "1px solid blue" : "",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
          }}
          onClick={() => setSelectedStyle(subStyles.style2)}
        >
          <LuCaptions size={50} />
          <label>highlight 2</label>
        </div>
        <div
          className="media-item"
          style={{
            border: selectedStyle === subStyles.style3 ? "1px solid blue" : "",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
          }}
          onClick={() => setSelectedStyle(subStyles.style3)}
        >
          <LuCaptions size={50} />
          <label>white</label>
        </div>
        <div
          className="media-item"
          style={{
            border: selectedStyle === subStyles.style4 ? "1px solid blue" : "",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
          }}
          onClick={() => setSelectedStyle(subStyles.style4)}
        >
          <LuCaptions size={50} />
          <label>yellow</label>
        </div>
        <div
          className="media-item"
          style={{
            border: selectedStyle === subStyles.style5 ? "1px solid blue" : "",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
          }}
          onClick={() => setSelectedStyle(subStyles.style5)}
        >
          <LuCaptions size={50} />
          <label>black-bg</label>
        </div>
        <div
          className="media-item"
          style={{
            border: selectedStyle === subStyles.style6 ? "1px solid blue" : "",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
          }}
          onClick={() => setSelectedStyle(subStyles.style6)}
        >
          <LuCaptions size={50} />
          <label>white-bg</label>
        </div>
      </div>
    </div>
  );
};

export default SubtitleStyleSettings;
