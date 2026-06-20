import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, GripVertical, Youtube } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function MusicAdminPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    youtube_id: '',
    description: '',
    order: 0
  });
  const queryClient = useQueryClient();

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: () => base44.entities.Song.list('order'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Song.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Song.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Song.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['songs'] }),
  });

  const resetForm = () => {
    setFormData({ title: '', youtube_id: '', description: '', order: 0 });
    setEditingSong(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (song) => {
    setEditingSong(song);
    setFormData({
      title: song.title || '',
      youtube_id: song.youtube_id || '',
      description: song.description || '',
      order: song.order || 0
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSong) {
      updateMutation.mutate({ id: editingSong.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, order: songs.length });
    }
  };

  const extractYoutubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    return match ? match[1] : url;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(songs);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    reordered.forEach((song, index) => {
      if (song.order !== index) {
        updateMutation.mutate({ id: song.id, data: { order: index } });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-[#1e3a5f]">Správa hudby</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#1e3a5f] hover:bg-[#2a4a6f]" onClick={() => resetForm()}>
              <Plus className="w-4 h-4" />
              Přidat skladbu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSong ? 'Upravit skladbu' : 'Nová skladba'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Název skladby *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Název písně"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">YouTube odkaz nebo ID *</label>
                <Input
                  value={formData.youtube_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtube_id: extractYoutubeId(e.target.value) }))}
                  placeholder="https://youtube.com/watch?v=... nebo ID videa"
                  required
                />
                {formData.youtube_id && (
                  <div className="mt-2 aspect-video rounded overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${formData.youtube_id}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Popis</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Hudba: ...\nText: ...\nMix & master: ..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">Každý řádek bude zobrazen zvlášť</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Zrušit
                </Button>
                <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2a4a6f]">
                  {editingSong ? 'Uložit změny' : 'Přidat'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Načítám...</div>
      ) : songs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Žádné skladby. Přidejte první!</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="songs">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {songs.map((song, index) => (
                  <Draggable key={song.id} draggableId={song.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-4 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <div className="flex gap-4 items-center">
                          <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="w-24 h-16 bg-black rounded overflow-hidden flex-shrink-0">
                            <img
                              src={`https://img.youtube.com/vi/${song.youtube_id}/mqdefault.jpg`}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[#1e3a5f]">{song.title}</h4>
                            {song.description && (
                              <p className="text-sm text-gray-500 truncate">{song.description.split('\n')[0]}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(song)}>
                              <Pencil className="w-4 h-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(song.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
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