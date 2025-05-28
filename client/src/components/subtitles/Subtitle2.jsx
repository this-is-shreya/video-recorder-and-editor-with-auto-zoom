import React from 'react'

const Subtitle2 = ({ wordsToShow, startIdx, highlightedWordIndex }) => {
  if (!wordsToShow || wordsToShow.length === 0) {
    return null;
  }
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
        const globalIndex = startIdx + idx;
        const isCurrent = globalIndex === highlightedWordIndex;

        if (word.word.length === 0) {
          return <></>;
        }
        return (
          <span
            key={idx}
            style={{
              backgroundColor: isCurrent ? "blue" : "transparent",
              color: isCurrent ? "white" : "black",
              padding: "4px 8px",
              borderRadius: "4px",
              fontWeight: isCurrent ? "bold" : "normal",
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

export default Subtitle2