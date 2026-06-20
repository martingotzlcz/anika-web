import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

function GalleryImage({ image, index, onClick }) {
  const [loaded, setLoaded] = useState(false);
  
  // Calculate aspect ratio from stored dimensions, fallback to 3/4
  const aspectRatio = image.width && image.height 
    ? image.width / image.height 
    : 3/4;
  
  return (
    <div
      onClick={onClick}
      className="mb-3 break-inside-avoid group relative overflow-hidden rounded-lg cursor-pointer shadow-lg bg-[#1e3a5f]/20"
      style={{ aspectRatio }}
    >
      <img
        src={image.url}
        alt={image.alt || `Gallery ${index + 1}`}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading={index < 6 ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end justify-center">
        {image.hover_text && (
          <p className="text-white text-center px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-light">
            {image.hover_text}
          </p>
        )}
      </div>
    </div>
  );
}

export default function MarqueeGallery({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  // Filter only visible images
  const visibleImages = images.filter(img => img.visible !== false);
  
  if (visibleImages.length === 0) return null;

  const openLightbox = (index) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const nextImage = () => setSelectedIndex((prev) => (prev + 1) % visibleImages.length);
  const prevImage = () => setSelectedIndex((prev) => (prev - 1 + visibleImages.length) % visibleImages.length);

  return (
    <>
      <section className="relative z-10 bg-transparent py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
            {visibleImages.map((image, index) => (
              <GalleryImage
                key={image.id || index}
                image={image}
                index={index}
                onClick={() => openLightbox(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
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
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <motion.img
                                key={selectedIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                src={visibleImages[selectedIndex]?.url}
                                alt={visibleImages[selectedIndex]?.alt}
              className="max-h-[85vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}