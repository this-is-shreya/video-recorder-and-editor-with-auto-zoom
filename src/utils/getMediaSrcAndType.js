export const getMediaSrcAndType = (event) => {
  if (event.dataTransfer && event.dataTransfer.getData("media-type")) {
    const src = event.dataTransfer.getData("text/plain");
    const mediaType = event.dataTransfer.getData("media-type");
    const duration = event.dataTransfer.getData("duration");
    const id = event.dataTransfer.getData("id");
    return { src, mediaType, duration, id };
  } else {
    const file = event.dataTransfer.files[0];
    if (file) {
      const mediaType = file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
        ? "audio"
        : "image";
      const src = URL.createObjectURL(file);
      const id = event.dataTransfer.getData("id");      
      const duration = event.target.duration ?? 10;
      console.log("duration", duration, event);
      return { src, mediaType, duration, id };
    }
  }
};
