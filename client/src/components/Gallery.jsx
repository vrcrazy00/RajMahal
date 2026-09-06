import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

export default function Gallery({ images = [], title = 'Property Image', fallbackImage = null }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Normalize images array
  const displayImages = images.length > 0
    ? images
    : [{ url: fallbackImage || '/uploads/properties/villa-1.jpg', caption: title || 'Property Preview' }];

  const currentImage = displayImages[selectedIndex] || displayImages[0];

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  }, [displayImages.length]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  }, [displayImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, handlePrev, handleNext]);

  return (
    <div className="gallery-container">
      {/* Main Viewport */}
      <div className="gallery-main-wrap" onClick={() => setLightboxOpen(true)}>
        <img
          src={currentImage.url}
          alt={currentImage.caption || title}
          className="gallery-main-img"
        />

        {displayImages.length > 1 && (
          <>
            <button
              className="gallery-nav-btn prev"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="gallery-nav-btn next"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="gallery-zoom-badge">
          <Maximize2 size={14} />
          <span>Click to Enlarge ({selectedIndex + 1}/{displayImages.length})</span>
        </div>
      </div>

      {/* Thumbnail Carousel */}
      {displayImages.length > 1 && (
        <div className="gallery-thumbnails">
          {displayImages.map((img, idx) => (
            <div
              key={img.id || idx}
              className={`gallery-thumb ${idx === selectedIndex ? 'active' : ''}`}
              onClick={() => setSelectedIndex(idx)}
            >
              <img src={img.url} alt={img.caption || `Thumbnail ${idx + 1}`} loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-modal" onClick={() => setLightboxOpen(false)}>
          <button
            className="lightbox-close-btn"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>

          {displayImages.length > 1 && (
            <>
              <button
                className="gallery-nav-btn prev"
                style={{ left: '2rem' }}
                onClick={handlePrev}
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                className="gallery-nav-btn next"
                style={{ right: '2rem' }}
                onClick={handleNext}
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          <div className="lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImage.url}
              alt={currentImage.caption || title}
              className="lightbox-img"
            />
          </div>

          <div className="lightbox-caption">
            {currentImage.caption || title} — {selectedIndex + 1} of {displayImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
