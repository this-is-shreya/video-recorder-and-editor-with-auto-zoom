"use client";

import { useContext, useEffect, useState, useRef } from "react";
import AppContext from "../../AppContext";
import { pixels } from "../../utils/PixelsPerSecondEnum";
import { subStyles } from "../../utils/MediaEnum";
import Subtitle1 from "./Subtitle1";
import Subtitle2 from "./Subtitle2";
import Subtitle3 from "./Subtitle3";
import Subtitle4 from "./Subtitle4";
import Subtitle5 from "./Subtitle5";
import Subtitle6 from "./Subtitle6";

const SubtitlesPreview = () => {
  const {
    seekerPosition,
    zoomTimeline,
    subtitleArray,
    isPlaying,
    setSubtitleArray,
    subtitleStyle,
  } = useContext(AppContext);

  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const allWords = subtitleArray?.flatMap((group) => group.words);

  // Track previous times to handle 1-second jumps
  const prevTimeRef = useRef(0);
  const lastHighlightedTimeRef = useRef(0);
  const currentTimeRef = useRef(0);

  // Convert seekerPosition to seconds
  currentTimeRef.current = seekerPosition / pixels[zoomTimeline];

  // Calculate which words to show with a smarter window
  const windowSize = 5; // Increased for better context
  const halfWindow = Math.floor(windowSize / 2);

  let currentWindow = 0;

  if (highlightedWordIndex !== -1) {
    currentWindow = Math.floor(highlightedWordIndex / windowSize);
  }

  const startIdx = currentWindow * windowSize;
  const endIdx = Math.min(allWords.length, startIdx + windowSize);

  const wordsToShow = allWords.slice(startIdx, endIdx);

  // works better
  useEffect(() => {
    if (!subtitleArray.length) return;

    const currentTime = currentTimeRef.current;
    if (!allWords.length) return;

    // Handle 1-second jumps
    const timeJumped = Math.abs(currentTime - prevTimeRef.current) >= 0.9;

    if (timeJumped) {
      const minTime = Math.min(prevTimeRef.current, currentTime);
      const maxTime = Math.max(prevTimeRef.current, currentTime);
      if(allWords.length === 0) return;
      const wordsInTimeRange = allWords.filter(
        (word) =>
          word !== undefined && 
          (word?.start >= minTime && word?.start < maxTime) ||
          (word?.end > minTime && word?.end <= maxTime) ||
          (word?.start <= minTime && word?.end >= maxTime)
      );

      if (wordsInTimeRange.length > 0) {
        const wordToHighlight =
          currentTime > prevTimeRef.current
            ? wordsInTimeRange[wordsInTimeRange.length - 1]
            : wordsInTimeRange[0];

        const newIndex = allWords.findIndex(
          (w) =>
            w.start === wordToHighlight.start && w.end === wordToHighlight.end
        );

        if (newIndex !== -1) {
          setHighlightedWordIndex(newIndex);
          lastHighlightedTimeRef.current = currentTime;
        }
      }
    } else {
      const activeIndex = allWords.findIndex(
        (word) => currentTime >= word?.start && currentTime < word?.end
      );

      if (activeIndex !== -1) {
        setHighlightedWordIndex(activeIndex);
        lastHighlightedTimeRef.current = currentTime;
      } else if (currentTime > lastHighlightedTimeRef.current) {
        const nextWordIndex = allWords.findIndex(
          (word) => word.start > lastHighlightedTimeRef.current
        );
        if (
          nextWordIndex !== -1 &&
          currentTime >= allWords[nextWordIndex].start
        ) {
          setHighlightedWordIndex(nextWordIndex);
          lastHighlightedTimeRef.current = currentTime;
        }
      }
    }

    prevTimeRef.current = currentTime;
  }, [subtitleArray, seekerPosition, zoomTimeline]);

  // 🛠️ Conditionally render the component inside JSX instead
  if (
    !subtitleArray.length ||
    allWords[allWords.length - 1]?.end < currentTimeRef.current
  ) {
    return <></>; // safe empty render
  }

  return (
    <>
      {subtitleStyle === subStyles.style1 && (
        <Subtitle1
          wordsToShow={wordsToShow}
          startIdx={startIdx}
          highlightedWordIndex={highlightedWordIndex}
        />
      )}
      {subtitleStyle === subStyles.style2 && (
        <Subtitle2
          wordsToShow={wordsToShow}
          startIdx={startIdx}
          highlightedWordIndex={highlightedWordIndex}
        />
      )}
      {subtitleStyle === subStyles.style3 && (
        <Subtitle3 wordsToShow={wordsToShow} />
      )}
      {subtitleStyle === subStyles.style4 && (
        <Subtitle4 wordsToShow={wordsToShow} />
      )}
      {subtitleStyle === subStyles.style5 && (
        <Subtitle5 wordsToShow={wordsToShow} />
      )}
      {subtitleStyle === subStyles.style6 && (
        <Subtitle6 wordsToShow={wordsToShow} />
      )}
    </>
  );
};

export default SubtitlesPreview;
