export const getMediaSrcAndType = (event) => {
  if (event.dataTransfer && event.dataTransfer.getData("media-type")) {
    const src = event.dataTransfer.getData("text/plain");
    const mediaType = event.dataTransfer.getData("media-type");
    const duration = event.dataTransfer.getData("duration");
    const id = event.dataTransfer.getData("id");
    return { src, mediaType, duration, id };
  } 
};
