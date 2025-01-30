export const getCurrentSources = (sourceAndTiming, currentTime)=>{

  // console.log("current time is ", currentTime)
    const filteredElements = sourceAndTiming.filter((item) => {
      // const key = Object.keys(item)[0]; // Get the dynamic key (e.g., "1", "2")
      // const value = item[key]; // Access the value for that key
      // console.log("value is ", value, item)
      return 0.1*currentTime >= item.newStart && 0.1*currentTime <= item.newEnd;
    });

    return filteredElements;
}