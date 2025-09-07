import { saveAs } from "file-saver";
export const downloadFile = async (recordedObject) => {
  try {
    // Fetch the blob from the URL
    if(!recordedObject.mediaBlobUrl){
      return;
    }
    const response = await fetch(recordedObject.mediaBlobUrl);
    if (!response.ok) {
      // throw new Error("Failed to fetch the file");
      return;
    }

    const blob = await response.blob();

    const file = new File([blob], "project-id-datetime", { type: "video/webm" });
    saveAs(file);
    // recordedObject.clearBlobUrl();
  } catch (error) {
    // console.error("Error downloading the file:", error);
  }
};
