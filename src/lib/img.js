export function optImg(url, width, quality = 78) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/storage/v1/object/public/')) return url;
  return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + '?width=' + width + '&quality=' + quality + '&resize=contain';
}

export function tooBig(file, mb = 25) {
  if (file && file.size > mb * 1024 * 1024) {
    alert('Fotka "' + (file.name || '') + '" má ' + (file.size/1024/1024).toFixed(1) + ' MB. Web umí automaticky zmenšit jen fotky do ' + mb + ' MB — zmenši ji prosím (ideálně pod 5 MB) a nahraj znovu.');
    return true;
  }
  return false;
}
