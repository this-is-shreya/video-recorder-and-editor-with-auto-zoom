export async function saveBlobToCache(id, blob) {
  const cache = await caches.open("video-cache");
  const response = new Response(blob);
  await cache.put(`/videos/${id}`, response);
}
export async function getBlobFromCache(id) {
  const cache = await caches.open("video-cache");
  const response = await cache.match(`/videos/${id}`);
  if (!response) return null;
  return response.blob();
}
export async function deleteBlobFromCache(id) {
  const cache = await caches.open("video-cache");
  await cache.delete(`/videos/${id}`);
}


