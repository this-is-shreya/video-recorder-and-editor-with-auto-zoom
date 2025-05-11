import { exec } from "child_process";
import html2canvas from "html2canvas";

export async function captureDivAsVideo() {
  const div = document.querySelector(".video-preview");

  if (!div) {
    console.error("Div not found!");
    return null;
  }

  // Convert `.video-player` to canvas
  const canvas = await html2canvas(div, { logging: false, useCORS: true });

  // Convert to video stream
  return canvas.captureStream(30); // 30 FPS
}

async function convertVideo(resolution) {
  let scale = resolution === 480 ? "854:480" : "1280:720";
  let outputFile = `output_${resolution}p.mp4`;
}

async function captureInternalAudio() {
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();

  // Get all media players inside `.video-player`
  const mediaPlayers = document.querySelectorAll(".video-player");

  mediaPlayers.forEach((video) => {
    const source = audioContext.createMediaElementSource(video);
    source.connect(destination);
    source.connect(audioContext.destination); // Play sound while recording
  });

  return destination.stream;
}
let mediaRecorder;
let recordedChunks = [];

export async function startRecording() {
  const videoStream = await captureDivAsVideo();
  const audioStream = await captureInternalAudio();

  if (!videoStream || !audioStream) {
    console.error("Failed to capture video or audio");
    return;
  }

  // Merge video and audio streams
  const combinedStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...audioStream.getAudioTracks(),
  ]);

  mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType: "video/webm; codecs=vp9",
  });

  mediaRecorder.ondataavailable = (event) => recordedChunks.push(event.data);
  mediaRecorder.onstop = saveRecording;

  mediaRecorder.start();
  console.log("Recording started...");

  setTimeout(() => mediaRecorder.stop(), 10000); // Stop after 10 sec
}

async function saveRecording() {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const buffer = Buffer.from(await blob.arrayBuffer());
  require("fs").writeFileSync("recorded.webm", buffer);
  console.log("Recording saved! Now converting...");

  convertVideo(480);
  convertVideo(720);
}
