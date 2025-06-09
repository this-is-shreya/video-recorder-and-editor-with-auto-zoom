import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../AppContext";
import { mediaType, transitionType } from "../../utils/MediaEnum";
import { FiLoader } from "react-icons/fi";
import { RxValueNone } from "react-icons/rx";

const TransitionPanel = () => {
  const { selectedElement, sourceAndTiming, setSourceAndTiming } =
    useContext(AppContext);
  const [currentSourceAndTiming, setCurrentSourceAndTiming] = useState(
    sourceAndTiming.find((item) => item.id === selectedElement.id)
  );

  const [transition, setTransition] = useState(null);
  const previousSourceAndTiming = sourceAndTiming.find(
    (item) =>
      Math.abs(item.newEnd - currentSourceAndTiming?.newStart) <= 1 &&
      item.id !== selectedElement.id &&
      item.trackNum === currentSourceAndTiming?.trackNum
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
  useEffect(() => {
    setCurrentSourceAndTiming(
      sourceAndTiming.find((item) => item.id === selectedElement.id)
    );


    setTransition(previousSourceAndTiming?.transitionType);
  }, [selectedElement, currentSourceAndTiming]);

  return (
    <div className="panel">
      {(!selectedElement.id ||
        selectedElement.mediaType !== mediaType.video) && (
        <h3 style={{ padding: "10px" }}>No video element selected</h3>
      )}
      {previousSourceAndTiming &&
        selectedElement.mediaType === mediaType.video && (
          <div className="media-container">
            <div
              className="media-item"
              data-alt={null}
              onClick={(e) => handleTransition(e)}
              style={{
                border: !transition ? "2px solid blue" : "2px solid grey",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <RxValueNone size={50} />
              None
            </div>
            {Object.values(transitionType).map((value) => {
              return (
                <div
                  className="media-item"
                  data-alt={value}
                  onClick={(e) => handleTransition(e)}
                  style={{
                    border:
                      transition === value
                        ? "2px solid blue"
                        : "2px solid grey",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FiLoader size={50} />
                  {value}
                </div>
              );
            })}
          </div>
        )}
      {selectedElement.id && !previousSourceAndTiming && (
        <h3 style={{ padding: "10px" }}>
          The selected element doesn't have an element before it
        </h3>
      )}
    </div>
  );
};

export default TransitionPanel;
