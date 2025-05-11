export async function extractAudioFromBlobURL(blobUrl) {
  try {
    // Fetch the Blob from the Blob URL
    const response = await fetch(blobUrl);
    const videoBlob = await response.blob();

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await videoBlob.arrayBuffer();

    // Create an AudioContext
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Decode audio data from the ArrayBuffer
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Convert AudioBuffer to WAV Blob
    const wavBlob = audioBufferToWavBlob(audioBuffer);

    // Trigger download
    const audioURL = URL.createObjectURL(wavBlob);
    const link = document.createElement("a");
    link.href = audioURL;
    link.download = "extracted_audio.wav";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error extracting audio:", error);
  }
}

// Convert AudioBuffer to WAV Blob
function audioBufferToWavBlob(audioBuffer) {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);

  // WAV file header
  writeString(view, 0, "RIFF");
  view.setUint32(4, length - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM format
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * 2 * numOfChan, true);
  view.setUint16(32, numOfChan * 2, true);
  view.setUint16(34, 16, true); // 16 bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, length - 44, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      const sample = audioBuffer.getChannelData(channel)[i];
      const s = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

// Helper function to write strings into DataView
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// // Example Usage:
// const blobUrl = "YOUR_BLOB_URL_HERE"; // Replace with your Blob URL
// extractAudioFromBlobURL(blobUrl);
