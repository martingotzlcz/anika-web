import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, image_id } = await req.json();
    
    if (!image_url || !image_id) {
      return Response.json({ error: 'Missing image_url or image_id' }, { status: 400 });
    }

    // Get image dimensions using wsrv.nl JSON endpoint
    const encodedUrl = encodeURIComponent(image_url);
    const infoUrl = `https://wsrv.nl/?url=${encodedUrl}&output=json`;
    const infoResponse = await fetch(infoUrl);
    const imageInfo = await infoResponse.json();
    const width = imageInfo.width || 0;
    const height = imageInfo.height || 0;
    
    // Create thumbnail (300px width, WebP)
    const thumbnailApiUrl = `https://wsrv.nl/?url=${encodedUrl}&w=300&output=webp&q=70`;
    const thumbnailResponse = await fetch(thumbnailApiUrl);
    const thumbnailBlob = await thumbnailResponse.blob();
    const thumbnailFile = new File([thumbnailBlob], 'thumbnail.webp', { type: 'image/webp' });
    const { file_url: thumbnail_url } = await base44.integrations.Core.UploadFile({ file: thumbnailFile });

    // Create medium size (800px width, WebP)
    const mediumApiUrl = `https://wsrv.nl/?url=${encodedUrl}&w=800&output=webp&q=85`;
    const mediumResponse = await fetch(mediumApiUrl);
    const mediumBlob = await mediumResponse.blob();
    const mediumFile = new File([mediumBlob], 'medium.webp', { type: 'image/webp' });
    const { file_url: medium_url } = await base44.integrations.Core.UploadFile({ file: mediumFile });

    // Update the GalleryImage entity with new URLs and dimensions
    await base44.entities.GalleryImage.update(image_id, {
      thumbnail_url,
      medium_url,
      width,
      height
    });

    return Response.json({ 
      success: true, 
      thumbnail_url, 
      medium_url,
      width,
      height
    });

  } catch (error) {
    console.error('Error compressing image:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});