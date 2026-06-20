export function optImg(url, width, quality = 78) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/storage/v1/object/public/')) return url;
  return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + '?width=' + width + '&quality=' + quality;
}
