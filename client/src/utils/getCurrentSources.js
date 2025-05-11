import { pixels } from "./PixelsPerSecondEnum";

export const getCurrentSources = (
  sourceAndTiming,
  currentTime,
  zoomTimeline
) => {
  // console.log("current time is ", currentTime)
  const filteredElements = sourceAndTiming.filter((item) => {
    // const key = Object.keys(item)[0]; // Get the dynamic key (e.g., "1", "2")
    // const value = item[key]; // Access the value for that key
    console.log(
      "item iss",
      item,
      "current time as per zoom: ",
      currentTime / pixels[zoomTimeline],
    
    );

    // const endTime = item.newEnd > item.speedEnd ? item.speedEnd : item.newEnd;
    return (
      Math.floor(currentTime / pixels[zoomTimeline]) >= item?.newStart &&
      Math.floor(currentTime / pixels[zoomTimeline]) <= item?.newEnd
    );
  });

  return filteredElements;
};
