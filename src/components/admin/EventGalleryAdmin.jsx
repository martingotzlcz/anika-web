import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function EventGalleryAdmin() {
  const [uploading, setUploading] = useState(null);
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['eventGalleryImages'],
    queryFn: () => base44.entities.EventGallery.list('order'),
  });

  const currentImages = images.filter(img => img.type === 'current').sort((a, b) => (a.order || 0) - (b.order || 0));
  const pastImages = images.filter(img => img.type === 'past').sort((a, b) => (a.order || 0) - (b.order || 0));

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EventGallery.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventGalleryImages'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EventGallery.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventGalleryImages'] }),
  });

  const handleUpload = async (type, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(type);
    const existingCount = type === 'current' ? currentImages.length : pastImages.length;
    
    for (let i = 0; i < files.length; i++) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: files[i] });
      await base44.entities.EventGallery.create({
        type,
        url: file_url,
        hover_text: '',
        order: existingCount + i,
        visible: true
      });
    }
    
    queryClient.invalidateQueries({ queryKey: ['eventGalleryImages'] });
    setUploading(null);
  };

  const handleDragEnd = (result, type) => {
    if (!result.destination) return;
    
    const items = type === 'current' ? [...currentImages] : [...pastImages];
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    
    items.forEach((img, index) => {
      if (img.order !== index) {
        updateMutation.mutate({ id: img.id, data: { order: index } });
      }
    });
  };

  const handleMoveToOther = async (image) => {
    const newType = image.type === 'current' ? 'past' : 'current';
    const targetImages = newType === 'current' ? currentImages : pastImages;
    await updateMutation.mutateAsync({ 
      id: image.id, 
      data: { type: newType, order: targetImages.length } 
    });
  };

  const GallerySection = ({ title, type, items }) => (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-[#1e3a5f]">{title}</h3>
        <label className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-[#1e3a5f] text-white rounded-md cursor-pointer hover:bg-[#2a4a6f] ${uploading === type ? 'opacity-50' : ''}`}>
          <Upload className="w-4 h-4" />
          {uploading === type ? 'Nahrávám...' : 'Přidat fotky'}
          <input type="file" accept="image/*" multiple onChange={(e) => handleUpload(type, e)} className="hidden" disabled={uploading === type} />
        </label>
      </div>
      
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Žádné fotky</p>
      ) : (
        <DragDropContext onDragEnd={(result) => handleDragEnd(result, type)}>
          <Droppable droppableId={type}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {items.map((image, index) => (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex gap-3 items-center p-2 bg-gray-50 rounded-lg ${snapshot.isDragging ? 'shadow-lg' : ''} ${!image.visible ? 'opacity-50' : ''}`}
                      >
                        <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="relative group flex-shrink-0"><div className="w-16 h-16 rounded overflow-hidden ring-1 ring-gray-200"><img src={image.url} alt="" className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: image.focal || "center" }} /></div><div className="absolute z-50 left-0 bottom-full mb-2 hidden group-hover:block"><div className="bg-white p-2 rounded-lg shadow-2xl ring-1 ring-gray-200"><p className="text-[10px] text-gray-500 mb-1 text-center whitespace-nowrap">Klikni na fotku, kam zaměřit</p><div className="relative inline-block cursor-crosshair" onClick={(ev) => { const r = ev.currentTarget.getBoundingClientRect(); const x = Math.round((ev.clientX - r.left) / r.width * 100); const y = Math.round((ev.clientY - r.top) / r.height * 100); updateMutation.mutate({ id: image.id, data: { focal: x + "% " + y + "%" } }); }}><img src={image.url} alt="" className="max-w-[260px] max-h-[260px] block rounded pointer-events-none select-none" draggable="false" />{image.focal && image.focal.indexOf("%") > -1 && <div className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-[#c94a4a] ring-2 ring-white pointer-events-none" style={{ left: image.focal.split(" ")[0], top: image.focal.split(" ")[1] }} />}</div></div></div></div>
                        <Input
                          value={image.hover_text || ''}
                          onChange={(e) => updateMutation.mutate({ id: image.id, data: { hover_text: e.target.value } })}
                          placeholder="Text při najetí..."
                          className="flex-1 h-8 text-sm"
                        />
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMoveToOther(image)}
                            title={type === 'current' ? 'Přesunout do starších' : 'Přesunout do aktuálních'}
                          >
                            {type === 'current' ? <ArrowRight className="w-4 h-4 text-blue-500" /> : <ArrowLeft className="w-4 h-4 text-blue-500" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateMutation.mutate({ id: image.id, data: { visible: !image.visible } })}
                          >
                            {image.visible !== false ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteMutation.mutate(image.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Card>
  );

  if (isLoading) return <div className="text-center py-8 text-gray-500">Načítám...</div>;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <GallerySection title="Galerie aktuálních představení" type="current" items={currentImages} />
      <GallerySection title="Galerie starších představení" type="past" items={pastImages} />
    </div>
  );
}