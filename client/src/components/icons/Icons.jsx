import React, { useState } from "react";
import { mediaType } from "../../utils/MediaEnum";

const Icons = () => {
  const [search, setSearch] = useState("");
  const [icons, setIcons] = useState([]);

  const searchIcons = () => {
    if(search.length === 0){
      setIcons([]);
      return;
    }
    fetch(`https://api.iconify.design/search?query=${search}`)
      .then((res) => res.json())
      .then((data) => {
        setIcons(data.icons);
      });
  };
  const handleDragStart = (e) => {
    const element =
      e.target.tagName.toLowerCase() === "img"
        ? e.target
        : e.target.querySelector("img");

    const id = Date.now();
    e.dataTransfer.setData("text/plain", element.getAttribute("alt"));
    e.dataTransfer.setData("media-type", mediaType.icons);
    e.dataTransfer.setData("id", id);
    e.dataTransfer.setData("duration", 4);

  };

  return (
    <div className="panel">
      <div style={{ display: "flex", padding: "10px", gap: "10px" }}>
        <input type="text" onChange={(e) => setSearch(e.target.value)} />
        <button
          onClick={() => searchIcons()}
          style={{
            width: "20%",
            cursor: "pointer",
            backgroundColor: "#892fff",
            color: "#fff",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
          }}
        >
          Search
        </button>
      </div>
      <div className="media-container">
        {icons.map((icon, index) => (
          <div
            key={index}
            className="media-item"
            draggable
            onDragStart={(e) => handleDragStart(e)}
            style={{backgroundColor: "#fff"}}
          >
            <img
              src={`https://api.iconify.design/${icon.split(":")[0]}/${
                icon.split(":")[1]
              }.svg?height=40`}
              alt={icon}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Icons;
