import React, { useContext, useState } from "react";
import AppContext from "../AppContext";
import { mediaType, transitionType } from "../utils/MediaEnum";

const TransitionPanel = () => {
  const { selectedElement, sourceAndTiming, setSourceAndTiming } =
    useContext(AppContext);
  const currentSourceAndTiming = sourceAndTiming.find(
    (item) => item.id === selectedElement.id
  );
  console.log(Object.values(transitionType));

  const previousSourceAndTiming = sourceAndTiming.find(
    (item) =>
      currentSourceAndTiming &&
      item.trackNum === currentSourceAndTiming.trackNum &&
      currentSourceAndTiming.newStart - item.newEnd <= 1 &&
      currentSourceAndTiming.newStart - item.newEnd >= 0 &&
      item.id !== selectedElement.id
  );

  const [transition, setTransition] = useState(
    currentSourceAndTiming?.transition
  );

  const handleTransition = (e) => {
    const transition = e.target.getAttribute("data-alt");
    setTransition(transition);
    const newSourceAndTiming = sourceAndTiming.map((item) => {
      if (transition) {
        if (item.id === selectedElement.id) {
          return {
            ...item,
            transitionFromId: previousSourceAndTiming.id,
            transitionFromSource: previousSourceAndTiming.source,
          };
        } else if (item.id === previousSourceAndTiming.id) {
          return {
            ...item,
            transitionToId: selectedElement.id,
            transitionToSource: currentSourceAndTiming.source,
            transitionType: transition,
          };
        }
      } else {
        if (item.id === selectedElement.id) {
          return {
            ...item,
            transitionFromId: null,
            transitionFromSource: "",
          };
        } else if (item.id === previousSourceAndTiming.id) {
          return {
            ...item,
            transitionToId: null,
            transitionToSource: "",
            transitionType: null,
          };
        }
      }
      return item;
    });
    setSourceAndTiming(newSourceAndTiming);
  };
  return (
    <div className="panel">
      {(!selectedElement.id ||
        selectedElement?.mediaType === mediaType.audio ||
        selectedElement?.mediaType === mediaType.effects) && (
        <h3>No element selected</h3>
      )}
      {previousSourceAndTiming && (
        <div className="media-container">
          <div
            className="media-item"
            data-alt={null}
            onClick={(e) => handleTransition(e)}
            style={{
              border: !transition ? "2px solid blue" : "none",
            }}
          >
            None
          </div>
          {Object.values(transitionType).map((value) => {
            return (
              <div
                className="media-item"
                data-alt={value}
                onClick={(e) => handleTransition(e)}
                style={{
                  border: transition === value ? "2px solid blue" : "none",
                }}
              >
                {value}
              </div>
            );
          })}
        </div>
      )}
      {selectedElement.id && !previousSourceAndTiming && (
        <h3>The selected element doesn't have an element before it</h3>
      )}
    </div>
  );
};

export default TransitionPanel;
