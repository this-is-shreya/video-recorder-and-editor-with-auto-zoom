import React from 'react'

const Subtitle6 = ({ wordsToShow }) => {
  return (
    <div
      className="subtitles-preview"
      style={{
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center", // Center by default
        padding: "12px 16px",
        borderRadius: "8px",
        backgroundColor:"#ffffff",
        zIndex: 6,
        pointerEvents: "none",
        width: "90%", // Always use 90% of parent width
        maxWidth: "1000px", // Cap width on large screens
        lineHeight: "1.4",
        rowGap: "10px",
        columnGap: "10px",
        textAlign: "center",
        justifyContent: "space-evenly", // Tries to spread when enough space
      }}
    >
      {wordsToShow.map((word, idx) => {
        if (word.word.length === 0) {
          return <></>;
        }
        return (
          <span
            key={idx}
            style={{
              color: "black",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "16px",
              transition: "all 0.15s ease",
            }}
          >
            {word.word}
          </span>
        );
      })}
    </div>
  );
};

export default Subtitle6