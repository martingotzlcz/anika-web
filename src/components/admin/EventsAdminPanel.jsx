import React, { useState } from 'react';
import { tooBig } from "@/lib/img";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, Upload, X, Calendar, Clock, MapPin, Image, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import EventGalleryAdmin from './EventGalleryAdmin';

export default function EventsAdminPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    city: '',
    description: '',
    ticket_url: '',
    image_url: '',
    featured_photo_id: ''
  });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('date'),
  });

  const { data: galleryImages = [] } = useQuery({
    queryKey: ['eventGalleryImages'],
    queryFn: () => base44.entities.EventGallery.list('order'),
  });

  const currentGalleryPhotos = galleryImages.filter(img => img.type === 'current' && img.visible !== false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      venue: '',
      city: '',
      description: '',
      ticket_url: '',
      image_url: '',
      featured_photo_id: ''
    });
    setEditingEvent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      date: event.date || '',
      time: event.time || '',
      venue: event.venue || '',
      city: event.city || '',
      description: event.description || '',
      ticket_url: event.ticket_url || '',
      image_url: event.image_url || '',
      featured_photo_id: event.featured_photo_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file && tooBig(file)) return;
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, [field]: file_url }));
    setUploading(false);
  };

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

  return (
    <div className="space-y-8">
      {/* Galleries Section */}
      <EventGalleryAdmin />

      {/* Events Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-[#1e3a5f]">Správa termínů</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#1e3a5f] hover:bg-[#2a4a6f]" onClick={() => resetForm()}>
                <Plus className="w-4 h-4" />
                Přidat termín
              </Button>
            </DialogTrigger>
            <DialogContent data-lenis-prevent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Upravit termín' : 'Nový termín'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Název *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Datum *</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Čas</label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="19:00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Místo konání</label>
                    <Input
                      value={formData.venue}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder="Divadlo..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Město</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Praha"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Popis</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Odkaz na vstupenky</label>
                  <Input
                    value={formData.ticket_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, ticket_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Hlavní obrázek</label>
                  <div className="flex gap-2 mt-1">
                    {formData.image_url ? (
                      <div className="relative">
                        <img src={formData.image_url} alt="" className="w-24 h-24 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-[#1e3a5f]">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image_url')} className="hidden" />
                      </label>
                    )}
                  </div>
                  {uploading && <p className="text-sm text-gray-500 mt-1">Nahrávám...</p>}
                </div>

                {/* Featured Photo Selection */}
                {currentGalleryPhotos.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Propojená fotka z galerie
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Při najetí na termín se zvýrazní tato fotka</p>
                    <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, featured_photo_id: '' }))}
                        className={`aspect-square rounded border-2 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors ${!formData.featured_photo_id ? 'border-[#1e3a5f] bg-gray-50' : 'border-gray-200'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {currentGalleryPhotos.map((photo) => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, featured_photo_id: photo.id }))}
                          className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${formData.featured_photo_id === photo.id ? 'border-[#c94a4a] ring-2 ring-[#c94a4a]/30' : 'border-transparent hover:border-gray-300'}`}
                        >
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                          {formData.featured_photo_id === photo.id && (
                            <div className="absolute inset-0 bg-[#c94a4a]/20 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Zrušit
                  </Button>
                  <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2a4a6f]">
                    {editingEvent ? 'Uložit změny' : 'Vytvořit'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Načítám...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Žádné termíny</div>
        ) : (
          <div className="space-y-6">
            {upcomingEvents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Nadcházející</h3>
                <div className="space-y-2">
                  {upcomingEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onEdit={handleEdit} 
                      onDelete={() => deleteMutation.mutate(event.id)}
                      featuredPhoto={currentGalleryPhotos.find(p => p.id === event.featured_photo_id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Proběhlé</h3>
                <div className="space-y-2">
                  {pastEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onEdit={handleEdit} 
                      onDelete={() => deleteMutation.mutate(event.id)} 
                      isPast 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onEdit, onDelete, isPast, featuredPhoto }) {
  return (
    <Card className={`p-4 ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex gap-4 items-start">
        {(event.image_url || featuredPhoto) && (
          <img src={event.image_url || featuredPhoto?.url} alt="" className="w-16 h-16 object-cover rounded" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-[#1e3a5f]">{event.title}</h4>
                {event.featured_photo_id && (
                  <span className="text-[10px] bg-[#c94a4a]/10 text-[#c94a4a] px-1.5 py-0.5 rounded">propojeno</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(event.date), 'd. MMMM yyyy', { locale: cs })}
                </span>
                {event.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </span>
                )}
                {event.venue && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.venue}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(event)}>
                <Pencil className="w-4 h-4 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}