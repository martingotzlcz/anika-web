import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Clock, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

// Component for lazy-loaded event photo with fade-in
function EventPhoto({ photo, onClick, maxHeight }) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div 
      className="lg:w-2/5 relative group cursor-pointer overflow-hidden rounded-xl shadow-md bg-[#1e3a5f]/10"
      style={{ maxHeight: window.innerWidth >= 1024 ? maxHeight : 'none' }}
      onClick={onClick}
    >
      <img
        src={photo.url}
        alt=""
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {photo.hover_text && (
        <p className="absolute bottom-4 left-4 right-4 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {photo.hover_text}
        </p>
      )}
    </div>
  );
}

// Marquee component with preloaded images
function PastGalleryMarquee({ images, onImageClick }) {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [allLoaded, setAllLoaded] = useState(false);
  const marqueeRef = useRef(null);
  
  // Preload all images
  useEffect(() => {
    if (images.length === 0) return;
    
    const imagePromises = images.map((img, idx) => {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          setLoadedImages(prev => new Set([...prev, idx]));
          resolve();
        };
        image.onerror = () => resolve();
        image.src = img.url;
      });
    });
    
    Promise.all(imagePromises).then(() => {
      setAllLoaded(true);
    });
  }, [images]);
  
  // Random start position
  useEffect(() => {
    if (allLoaded && marqueeRef.current) {
      const randomOffset = Math.random() * 50;
      marqueeRef.current.style.animationDelay = `-${randomOffset}s`;
    }
  }, [allLoaded]);
  
  if (images.length === 0) return null;
  
  return (
    <div className="overflow-hidden">
      <h2 className="text-[10px] font-medium text-gray-400 mb-4 tracking-[0.3em] uppercase">
        Ze starších představení
      </h2>
      <div className="relative">
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              animation: marquee ${images.length * 10}s linear infinite;
              will-change: transform;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
          `}
        </style>
        
        {/* Loading state */}
        {!allLoaded && (
          <div className="flex gap-4 overflow-hidden">
            {images.slice(0, 6).map((_, idx) => (
              <div key={idx} className="h-36 w-48 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
            ))}
          </div>
        )}
        
        {/* Actual marquee - shown after all images loaded */}
        <div 
          ref={marqueeRef}
          className={`marquee-track flex gap-4 transition-opacity duration-700 ${allLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
          style={{ width: 'max-content' }}
        >
          {[...images, ...images].map((image, idx) => (
            <div
              key={`${image.id}-${idx}`}
              className="relative cursor-pointer overflow-hidden rounded-lg flex-shrink-0"
              onClick={() => onImageClick(idx % images.length)}
            >
              <img 
                src={image.url} 
                alt="" 
                className="h-36 w-auto object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-date'),
  });

  const { data: galleryImages = [], isLoading: isLoadingGallery } = useQuery({
    queryKey: ['eventGalleryImages'],
    queryFn: () => base44.entities.EventGallery.list('order'),
  });

  const currentGallery = galleryImages.filter(img => img.type === 'current' && img.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  const pastGallery = galleryImages.filter(img => img.type === 'past' && img.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).reverse();
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

  const openLightbox = (images, index) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setLightboxImages([]);
  };



  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="pt-28 pb-10 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-light text-[#1e3a5f] tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
            TERMÍNY
          </h1>
          <div className="w-12 h-0.5 bg-[#c94a4a] mx-auto mt-4" />
          {upcomingEvents.length > 0 && (
            <p className="text-xs text-gray-400 mt-4">
              Nejbližší: {upcomingEvents[0].title} · {format(new Date(upcomingEvents[0].date), 'd. M.', { locale: cs })}
              {upcomingEvents[0].venue && ` · ${upcomingEvents[0].venue}`}
            </p>
          )}
        </motion.div>
      </div>

      {/* Upcoming Events - Photo Groups */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-[10px] font-medium text-[#1e3a5f]/50 mb-8 tracking-[0.3em] uppercase">
          Nadcházející představení
        </h2>
        
        {(isLoading || isLoadingGallery) ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-[#1e3a5f]/20 border-t-[#1e3a5f] rounded-full animate-spin" />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-gray-400 text-sm py-8">Momentálně nejsou naplánovány žádné akce.</p>
        ) : (
          <div className="space-y-10">
            {/* Group events by featured_photo_id */}
            {(() => {
              // Create groups: photos with their events
              const photoGroups = [];
              const eventsWithPhoto = {};
              const eventsWithoutPhoto = [];
              
              upcomingEvents.forEach(event => {
                if (event.featured_photo_id) {
                  if (!eventsWithPhoto[event.featured_photo_id]) {
                    eventsWithPhoto[event.featured_photo_id] = [];
                  }
                  eventsWithPhoto[event.featured_photo_id].push(event);
                } else {
                  eventsWithoutPhoto.push(event);
                }
              });
              
              // Add photo groups
              currentGallery.forEach(photo => {
                if (eventsWithPhoto[photo.id]) {
                  photoGroups.push({ photo, events: eventsWithPhoto[photo.id] });
                }
              });
              
              return (
                <>
                  {photoGroups.map(({ photo, events: groupEvents }, groupIdx) => (
                        <div
                          key={photo.id}
                          className={`flex flex-col lg:flex-row gap-6 items-stretch ${groupIdx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                        >
                      <EventPhoto
                        photo={photo}
                        maxHeight={Math.max(50 * groupEvents.length, 80) + 'px'}
                        onClick={() => openLightbox(currentGallery.map(i => i.url), currentGallery.findIndex(i => i.id === photo.id))}
                      />
                      
                      {/* Events for this photo */}
                      <div className="lg:w-3/5 flex flex-col justify-center space-y-2">
                        {groupEvents.map((event, eventIdx) => (
                          <div
                            key={event.id}
                            className="group bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#c94a4a]/30 transition-all duration-200"
                          >
                            <div className="flex items-center gap-2">
                              <div className="text-center flex-shrink-0 bg-[#1e3a5f] text-white rounded px-1.5 py-1 min-w-[36px]">
                                <div className="text-sm font-light leading-none">
                                  {format(new Date(event.date), 'd', { locale: cs })}
                                </div>
                                <div className="text-[7px] uppercase tracking-wider opacity-70">
                                  {format(new Date(event.date), 'LLL', { locale: cs })}
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-medium text-[#1e3a5f] group-hover:text-[#c94a4a] transition-colors">
                                  {event.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                                  {event.time && (
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {event.time}
                                    </span>
                                  )}
                                  {event.venue && (
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="w-2.5 h-2.5" />
                                      {event.venue}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {event.ticket_url && (
                                <a 
                                  href={event.ticket_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 px-2 py-1 text-[#c94a4a] text-[10px] font-medium hover:underline transition-colors flex items-center gap-0.5"
                                >
                                  Vstupenky
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              </div>
                              </div>
                              ))}
                              </div>
                              </div>
                              ))}
                  
                  {/* Events without photo */}
                  {eventsWithoutPhoto.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-medium text-[#1e3a5f]/40 tracking-[0.2em] uppercase mb-3">
                        Další termíny
                      </h3>
                      {eventsWithoutPhoto.map((event, index) => (
                        <div
                          key={event.id}
                          className="group bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#c94a4a]/30 transition-all duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-center flex-shrink-0 bg-[#1e3a5f] text-white rounded px-1.5 py-1 min-w-[36px]">
                              <div className="text-sm font-light leading-none">
                                {format(new Date(event.date), 'd', { locale: cs })}
                              </div>
                              <div className="text-[7px] uppercase tracking-wider opacity-70">
                                {format(new Date(event.date), 'LLL', { locale: cs })}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-medium text-[#1e3a5f] group-hover:text-[#c94a4a] transition-colors">
                                {event.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                                {event.time && (
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    {event.time}
                                  </span>
                                )}
                                {event.venue && (
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {event.venue}
                                  </span>
                                )}
                              </div>
                            </div>

                            {event.ticket_url && (
                              <a 
                                href={event.ticket_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-shrink-0 px-2 py-1 text-[#c94a4a] text-[10px] font-medium hover:underline transition-colors flex items-center gap-0.5"
                              >
                                Vstupenky
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            </div>
                            </div>
                            ))}
                            </div>
                            )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Past Events Section */}
      {(pastEvents.length > 0 || pastGallery.length > 0) && (
        <div className="mt-16 py-12 border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-6">
            {/* Past Events List */}
            {pastEvents.length > 0 && (
              <div className="mb-10">
                <h2 className="text-[10px] font-medium text-gray-400 mb-6 tracking-[0.3em] uppercase">
                  Proběhlé akce
                </h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
                  {pastEvents.slice(0, 12).map((event, index) => (
                              <div
                                key={event.id}
                                className="flex items-center gap-3 py-2 text-gray-500 hover:text-[#1e3a5f] transition-colors duration-200 text-sm"
                              >
                      <span className="text-[11px] w-20 flex-shrink-0 text-gray-400">
                        {format(new Date(event.date), 'd. M. yyyy', { locale: cs })}
                      </span>
                      <span className="flex-1 truncate">{event.title}</span>
                      </div>
                      ))}
                </div>
              </div>
            )}

            {/* Past Gallery - Auto-scrolling Marquee */}
            <PastGalleryMarquee 
              images={pastGallery} 
              onImageClick={(idx) => openLightbox(pastGallery.map(i => i.url), idx)} 
            />
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length); }}
              className="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={lightboxImages[lightboxIndex]}
              alt=""
              className="max-h-[85vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % lightboxImages.length); }}
              className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}