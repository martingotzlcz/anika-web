import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Upload, RefreshCw, Ruler } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function GalleryAdmin() {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState({});
  const [compressingAll, setCompressingAll] = useState(false);
  const [updatingDimensions, setUpdatingDimensions] = useState(false);
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['galleryImages'],
    queryFn: () => base44.entities.GalleryImage.list('order'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GalleryImage.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['galleryImages'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GalleryImage.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['galleryImages'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GalleryImage.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['galleryImages'] }),
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newImage = await base44.entities.GalleryImage.create({
        url: file_url,
        alt: file.name,
        hover_text: '',
        order: images.length + i,
        visible: true,
      });
      // Auto-compress after upload
      try {
        await base44.functions.invoke('compressImage', {
          image_url: file_url,
          image_id: newImage.id
        });
      } catch (err) {
        console.error('Auto-compression failed:', err);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
    setUploading(false);
  };

  const handleAddFromUrl = () => {
    if (!newImageUrl) return;
    createMutation.mutate({
      url: newImageUrl,
      alt: '',
      hover_text: '',
      order: images.length,
      visible: true,
    });
    setNewImageUrl('');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(images);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    reordered.forEach((img, index) => {
      if (img.order !== index) {
        updateMutation.mutate({ id: img.id, data: { order: index } });
      }
    });
  };

  const handleCompressImage = async (image) => {
    setCompressing(prev => ({ ...prev, [image.id]: true }));
    try {
      await base44.functions.invoke('compressImage', {
        image_url: image.url,
        image_id: image.id
      });
      queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
    } catch (error) {
      console.error('Compression failed:', error);
    }
    setCompressing(prev => ({ ...prev, [image.id]: false }));
  };

  const handleCompressAll = async () => {
    const toCompress = images.filter(img => !img.thumbnail_url);
    if (toCompress.length === 0) return;
    
    setCompressingAll(true);
    for (const image of toCompress) {
      setCompressing(prev => ({ ...prev, [image.id]: true }));
      try {
        await base44.functions.invoke('compressImage', {
          image_url: image.url,
          image_id: image.id
        });
      } catch (error) {
        console.error('Compression failed for', image.id, error);
      }
      setCompressing(prev => ({ ...prev, [image.id]: false }));
    }
    queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
    setCompressingAll(false);
  };

  const handleUpdateAllDimensions = async () => {
    setUpdatingDimensions(true);
    try {
      await base44.functions.invoke('updateImageDimensions', {});
      queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
    } catch (error) {
      console.error('Failed to update dimensions:', error);
    }
    setUpdatingDimensions(false);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-[#1e3a5f]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Správa galerie
          </h1>
          <div className="flex gap-2">
                          {images.some(img => !img.width || !img.height) && (
                            <Button onClick={handleUpdateAllDimensions} variant="outline" className="gap-2" disabled={updatingDimensions}>
                              <Ruler className={`w-4 h-4 ${updatingDimensions ? 'animate-pulse' : ''}`} />
                              {updatingDimensions ? 'Aktualizuji...' : 'Načíst rozměry'}
                            </Button>
                          )}
                          {images.some(img => !img.thumbnail_url) && (
                            <Button onClick={handleCompressAll} variant="outline" className="gap-2" disabled={compressingAll}>
                              <RefreshCw className={`w-4 h-4 ${compressingAll ? 'animate-spin' : ''}`} />
                              {compressingAll ? 'Optimalizuji...' : 'Optimalizovat všechny'}
                            </Button>
                          )}
                        </div>
        </div>

        {/* Add new image */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Přidat obrázek</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">Nahrát soubor</label>
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1e3a5f] transition-colors">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">{uploading ? 'Nahrávám...' : 'Vybrat soubory'}</span>
                <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">Nebo zadat URL</label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                <Button onClick={handleAddFromUrl} disabled={!newImageUrl}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Image list */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Načítám...</div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Žádné obrázky v galerii</div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gallery">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {images.map((image, index) => (
                    <Draggable key={image.id} draggableId={image.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 ${snapshot.isDragging ? 'shadow-lg' : ''} ${!image.visible ? 'opacity-60' : ''}`}
                        >
                          <div className="flex gap-4">
                            <div {...provided.dragHandleProps} className="flex items-center text-gray-400 cursor-grab">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="relative">
                              <img
                                src={image.url}
                                alt={image.alt}
                                className="w-24 h-24 object-cover rounded"
                              />
                              {image.thumbnail_url ? (
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                  ✓
                                </span>
                              ) : (
                                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                  !
                                </span>
                              )}
                            </div>
                            <div className="flex-1 space-y-3">
                              <Input
                                value={image.alt || ''}
                                onChange={(e) => updateMutation.mutate({ id: image.id, data: { alt: e.target.value } })}
                                placeholder="Popis obrázku"
                              />
                              <Textarea
                                value={image.hover_text || ''}
                                onChange={(e) => updateMutation.mutate({ id: image.id, data: { hover_text: e.target.value } })}
                                placeholder="Text při najetí myší"
                                rows={2}
                              />
                            </div>
                            <div className="flex flex-col items-center gap-3">
                              <div className="flex items-center gap-2">
                                {image.visible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                                <Switch
                                  checked={image.visible !== false}
                                  onCheckedChange={(checked) => updateMutation.mutate({ id: image.id, data: { visible: checked } })}
                                />
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={image.thumbnail_url ? "text-green-500" : "text-blue-500 hover:text-blue-700 hover:bg-blue-50"}
                                  onClick={() => handleCompressImage(image)}
                                  disabled={compressing[image.id]}
                                  title={image.thumbnail_url ? "Již optimalizováno" : "Optimalizovat"}
                                >
                                  <RefreshCw className={`w-4 h-4 ${compressing[image.id] ? 'animate-spin' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => deleteMutation.mutate(image.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}