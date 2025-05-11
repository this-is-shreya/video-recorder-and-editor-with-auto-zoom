import React from 'react'

const Subtitle1 = ({ wordsToShow, startIdx, highlightedWordIndex }) => {
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
        backgroundColor: "rgba(255, 255, 255, 0.9)",
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
        const isAlreadyPassed = globalIndex < highlightedWordIndex;
        const isComingSoon =
          globalIndex > highlightedWordIndex &&
          globalIndex <= highlightedWordIndex + 3;

        if (word.word.length === 0) {
          return <></>;
        }
        return (
          <span
            key={idx}
            style={{
              backgroundColor: isCurrent
                ? "purple"
                : isAlreadyPassed
                ? "#ddd"
                : isComingSoon
                ? "#f5f5f5"
                : "transparent",
              color: isCurrent ? "white" : "black",
              padding: "4px 8px",
              borderRadius: "4px",
              fontWeight: isCurrent ? "bold" : "normal",
              fontSize: "16px",
              transition: "all 0.15s ease",
              opacity: isCurrent
                ? 1
                : isAlreadyPassed
                ? 0.7
                : isComingSoon
                ? 0.9
                : 0.8,
            }}
          >
            {word.word}
          </span>
        );
      })}
    </div>
  );
};

export default Subtitle1