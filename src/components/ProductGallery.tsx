import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Product } from '../data/products';

interface ProductGalleryProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductGallery({ product, isOpen, onClose }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allImages = [product.image, ...(product.images || [])];

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 text-white/70 hover:text-white transition-colors z-10"
        aria-label="Закрыть"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 text-white/70 text-sm">
        {currentIndex + 1} / {allImages.length}
      </div>

      {/* Main image */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={allImages[currentIndex]}
          alt={`${product.name} - изображение ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 md:left-8 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 md:right-8 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all"
              aria-label="Следующее изображение"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-4 bg-black/50 rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-accent scale-110'
                  : 'border-white/30 hover:border-white/60'
              }`}
            >
              <img
                src={img}
                alt={`Миниатюра ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Product info */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-center hidden md:block"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-xl font-semibold">{product.name}</h3>
        {product.material && (
          <p className="text-white/60 text-sm mt-1">Материал: {product.material}</p>
        )}
      </div>
    </div>
  );
}
