import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../data/products';
import { ShoppingBag, ZoomIn } from 'lucide-react';
import ProductGallery from './ProductGallery';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const allImages = [product.image, ...(product.images || [])];
  const hasMultipleImages = allImages.length > 1;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <div className="card overflow-hidden group">
        {/* Image */}
        <div
          className="relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer"
          onClick={() => setIsGalleryOpen(true)}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Zoom indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2">
              <ZoomIn className="w-5 h-5" />
              {hasMultipleImages ? (
                <span className="text-sm font-medium">Смотреть все {allImages.length} фото</span>
              ) : (
                <span className="text-sm font-medium">Увеличить</span>
              )}
            </div>
          </div>

          {/* Image counter badge */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md flex items-center gap-1">
              <span className="text-xs font-medium">{allImages.length}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">{product.category}</p>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {product.name}
          </h3>
          {product.material && (
            <p className="text-sm text-muted-foreground mb-2">
              Материал: {product.material}
            </p>
          )}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold text-accent">
              {formatPrice(product.price)}
            </span>
            <Link
              to={`/request?product=${product.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-md hover:shadow-accent/30 transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4" />
              Заказать
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <ProductGallery
        product={product}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </>
  );
}
