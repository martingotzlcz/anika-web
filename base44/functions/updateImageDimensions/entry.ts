import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all gallery images
    const images = await base44.entities.GalleryImage.list();
    const results = [];

    for (const image of images) {
      // Skip if already has dimensions
      if (image.width && image.height) {
        results.push({ id: image.id, status: 'skipped' });
        continue;
      }

      try {
        const encodedUrl = encodeURIComponent(image.url);
        const infoUrl = `https://wsrv.nl/?url=${encodedUrl}&output=json`;
        const infoResponse = await fetch(infoUrl);
        const imageInfo = await infoResponse.json();
        
        if (imageInfo.width && imageInfo.height) {
          await base44.entities.GalleryImage.update(image.id, {
            width: imageInfo.width,
            height: imageInfo.height
          });
          results.push({ id: image.id, status: 'updated', width: imageInfo.width, height: imageInfo.height });
        } else {
          results.push({ id: image.id, status: 'no_dimensions' });
        }
      } catch (err) {
        results.push({ id: image.id, status: 'error', error: err.message });
      }
    }

    return Response.json({ success: true, results });

  } catch (error) {
    console.error('Error updating dimensions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});