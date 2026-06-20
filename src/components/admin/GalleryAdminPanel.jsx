import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Upload, Ruler } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function GalleryAdminPanel() {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
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
      await base44.entities.GalleryImage.create({
        url: file_url,
        alt: file.name,
        hover_text: '',
        order: images.length + i,
        visible: true,
      });
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-[#1e3a5f]">Správa galerie</h2>
        <div className="flex gap-2">
          {images.some(img => !img.width || !img.height) && (
            <Button onClick={handleUpdateAllDimensions} variant="outline" size="sm" className="gap-2" disabled={updatingDimensions}>
              <Ruler className={`w-4 h-4 ${updatingDimensions ? 'animate-pulse' : ''}`} />
              {updatingDimensions ? 'Aktualizuji...' : 'Načíst rozměry'}
            </Button>
          )}
          
        </div>
      </div>

      {/* Add new image */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1e3a5f] transition-colors">
              <Upload className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">{uploading ? 'Nahrávám...' : 'Nahrát soubory'}</span>
              <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <div className="flex-1 flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Nebo zadat URL..."
            />
            <Button onClick={handleAddFromUrl} disabled={!newImageUrl} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
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
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {images.map((image, index) => (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-3 ${snapshot.isDragging ? 'shadow-lg' : ''} ${!image.visible ? 'opacity-60' : ''}`}
                      >
                        <div className="flex gap-3 items-center">
                          <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="relative">
                            <img src={image.url} alt={image.alt} className="w-16 h-16 object-cover rounded" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Input
                              value={image.alt || ''}
                              onChange={(e) => updateMutation.mutate({ id: image.id, data: { alt: e.target.value } })}
                              placeholder="Popis"
                              className="text-sm mb-1"
                            />
                            <Input
                              value={image.hover_text || ''}
                              onChange={(e) => updateMutation.mutate({ id: image.id, data: { hover_text: e.target.value } })}
                              placeholder="Hover text"
                              className="text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={image.visible !== false}
                              onCheckedChange={(checked) => updateMutation.mutate({ id: image.id, data: { visible: checked } })}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(image.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
  );
}