import React, { useState, useEffect, useContext, useRef } from "react";
import { mediaType, subStyles } from "../../utils/MediaEnum";
import AppContext from "../../AppContext";
import { pixels } from "../../utils/PixelsPerSecondEnum";
import { notify } from "../../utils/toast";

const Subtitles = () => {
  const {
    sourceAndTiming,
    aspectRatio,
    maxTime,
    subtitleArray,
    setSubtitleArray,
    setSubtitleStyle,
    setSeekerPosition,
    setSeekerPositionManuallyChanged,
    zoomTimeline,
  } = useContext(AppContext);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedWord, setEditedWord] = useState("");

  const handleExport = async () => {
    const startVideo = sourceAndTiming.find(
      (item) => item.newStart === 0 && item.mediaType === mediaType.video
    );
    const startAudio = sourceAndTiming.find(
      (item) => item.newStart === 0 && item.mediaType === mediaType.audio
    );
    if (
      (!startVideo || startVideo.length === 0) &&
      (!startAudio || startAudio.length === 0)
    ) {
      notify("Please ensure there's a video or audio element at the start", "warning");
      return;
    }
    const id = window.location.pathname.split("/")[1];
    const exportUrl = `/${id}/export?aspectRatio=${aspectRatio}&rate=5000000&fps=30&type=generate-subtitles`;
    window.open(exportUrl, "_blank");
  };
  // Group words by 5-second intervals
  const groupWords = (subtitles) => {
    const grouped = {};
    subtitles.forEach((wordObj) => {
      const groupStart = Math.floor(wordObj.start / 5) * 5;
      if (!grouped[groupStart]) grouped[groupStart] = [];
      grouped[groupStart].push(wordObj);
    });

    // Convert object to sorted array of { interval, words }
    const result = Object.entries(grouped)
      .sort(([a], [b]) => a - b)
      .map(([start, words]) => ({
        interval: `${formatTime(start)} - ${formatTime(Number(start) + 5)}`,
        words,
      }));

    setSubtitleArray(result);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleWordClick = (intervalIdx, wordIdx, word) => {
    setEditingIndex(`${intervalIdx}-${wordIdx}`);
    setEditedWord(word);
  };

  const handleInputChange = (e) => {
    setEditedWord(e.target.value);
  };

  const handleBlur = (intervalIdx, wordIdx) => {
    const newArray = [...subtitleArray];
    const currentWordObj = newArray[intervalIdx].words[wordIdx];
    const originalWord = currentWordObj.word;
    const newWordText = editedWord.trim();

    // Check if the edited text contains multiple words
    const newWords = newWordText.split(/\s+/).filter((word) => word.length > 0);

    if (newWords.length <= 1) {
      // If it's still one word or empty, just update the word
      currentWordObj.word = newWordText;
    } else {
      // If multiple words, distribute the time evenly
      const startTime = currentWordObj.start;
      const endTime = currentWordObj.end;
      const timeSpan = endTime - startTime;
      const timePerWord = timeSpan / newWords.length;

      // Create new word objects with distributed timings
      const newWordObjects = newWords.map((word, i) => {
        const wordStart = startTime + i * timePerWord;
        const wordEnd = startTime + (i + 1) * timePerWord;

        return {
          word,
          start: wordStart,
          end: wordEnd,
          confidence: currentWordObj.confidence || 1.0, // Keep original confidence if exists
        };
      });
      // Replace the original word with the new words array
      newArray[intervalIdx].words.splice(wordIdx, 1, ...newWordObjects);
    }
    setSubtitleArray(newArray);

    setEditingIndex(null);
    setEditedWord("");
    console.log(subtitleArray);
  };

  const _setSeekerPosition = (e) => {
    const val = e.target.innerText.split(" - ")[0].split(":");
    const seconds = parseInt(val[0]) * 60 + parseInt(val[1]);
    const valInPixels = seconds * pixels[zoomTimeline];
    setSeekerPosition(valInPixels);
    setSeekerPositionManuallyChanged(true);
  };
  // Only group once when subtitles first come from server
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "SUBTITLES_GENERATED") {
        setSubtitleArray(event.data.subtitles);
        groupWords(event.data.subtitles);
        setSubtitleStyle(subStyles.style1);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const sampleSubtitle = [
      { conf: 1, end: 1.98, start: 1.68, word: "hello" },
      { conf: 1, end: 2.61, start: 1.98, word: "everyone" },
      { conf: 0.8408, end: 3.27, start: 3.03, word: "this" },
      { conf: 0.500852, end: 3.42, start: 3.27, word: "is" },
      { conf: 0.937641, end: 4.08, start: 3.430877, word: "share" },
      { conf: 0.413824, end: 4.656, start: 4.2, word: "shadow" },
      { conf: 0.492194, end: 5.04, start: 4.656, word: "hope" },
      { conf: 1, end: 5.73, start: 5.46, word: "it's" },
      { conf: 0.561888, end: 5.88, start: 5.82, word: "a" },
      { conf: 0.649051, end: 6.54, start: 5.89384, word: "gordon" },
      { conf: 0.525115, end: 8.28, start: 7.86, word: "well" },
    ];
    setSubtitleArray(sampleSubtitle);
    groupWords(sampleSubtitle);
    console.log("subtitlearray set", subtitleArray);
  }, []);
  useEffect(() => {
    console.log("subtitleArray updated", subtitleArray);
  }, [subtitleArray]);
  return (
    <div className="panel">
      <div className="media-container p-4">
        <button
          onClick={() => handleExport()}
          style={{
            cursor: "pointer",
            backgroundColor: "#892fff",
            color: "#fff",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            width: "60%",
            marginLeft: "20%",
          }}
        >
          Generate Subtitles
        </button>
        <table>
          <tbody>
            {subtitleArray?.map((group, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: "nowrap", paddingRight: "12px" }}>
                  <button
                    onClick={(e) => _setSeekerPosition(e)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      border:"none",
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    <u>{group.interval.split(" - ")[0]}</u>
                  </button>
                </td>
                <td>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {group.words?.map((wordObj, j) => {
                      const indexKey = `${i}-${j}`;
                      return editingIndex === indexKey ? (
                        <input
                          key={indexKey}
                          value={editedWord}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur(i, j)}
                          autoFocus
                          style={{
                            minWidth: "40px",
                            padding: "2px 4px",
                            fontSize: "14px",
                          }}
                        />
                      ) : (
                        <span
                          key={indexKey}
                          onClick={() => handleWordClick(i, j, wordObj.word)}
                          style={{
                            padding: "4px 6px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {wordObj.word}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subtitles;
