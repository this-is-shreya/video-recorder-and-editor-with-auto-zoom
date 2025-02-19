export const getMediaSrcAndType = (event) => {
  if (event.dataTransfer && event.dataTransfer.getData("media-type")) {
    const src = event.dataTransfer.getData("text/plain");
    const mediaType = event.dataTransfer.getData("media-type");
    const duration = event.dataTransfer.getData("duration");
    console.log(event.dataTransfer);
    return { src, mediaType, duration };
  } else {
    const file = event.dataTransfer.files[0];
    if (file) {
      const mediaType = file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
        ? "audio"
        : "image";
      const src = URL.createObjectURL(file);
      const duration = event.target.duration ?? 10;
      console.log("duration", duration, event);
      return { src, mediaType, duration };
    }
  }
};
