export async function convertBlobToBase64(jsonArray) {
  try {
    const updatedArray = await Promise.all(
      jsonArray.map(async (item) => {
        if (!item.source.startsWith("blob:")) return item; // Skip non-blob

        // Fetch the blob from the URL
        const response = await fetch(item.source);
        const blob = await response.blob();

        // Convert to base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const sizeInBytes = new TextEncoder().encode(base64).length;
        console.log("size in mb ", sizeInBytes / (1024 * 1024)); // Convert to MB

        return {
          ...item,
          source: base64, // Replace blob URL with base64 string
        };
      })
    );
    console.log("updatedArray", updatedArray);

    return updatedArray;
  } catch (error) {
    console.error("Error converting blob to base64:", error);
    throw error;
  }
}

export async function convertBase64ToBlob(jsonArray) {
  return jsonArray?.map((item) => {
    if (!item.source.startsWith("data:")) return item; // Skip non-base64

    const base64 = item.source.split(",")[1]; // Extract base64 part
    const mimeType = item.source.split(";")[0].split(":")[1]; // Extract MIME type
    const blob = b64toBlob(base64, mimeType);
    return {
      ...item,
      source: URL.createObjectURL(blob), // Convert back to blob URL for use in the app
    };
  });
}
const b64toBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
};
