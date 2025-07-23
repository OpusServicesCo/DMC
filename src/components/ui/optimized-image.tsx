import { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+",
  priority = false,
  quality = 80,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer pour lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Commencer à charger 50px avant que l'image soit visible
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Génération d'URLs optimisées (exemple avec un service d'optimisation)
  const getOptimizedSrc = (originalSrc: string) => {
    // Si c'est une URL locale, on la retourne telle quelle
    if (originalSrc.startsWith('/') || originalSrc.startsWith('data:')) {
      return originalSrc;
    }

    // Pour des services comme Cloudinary, ImageKit, etc.
    // return `https://res.cloudinary.com/your-cloud/image/fetch/f_auto,q_${quality},w_${width || 'auto'},h_${height || 'auto'}/${encodeURIComponent(originalSrc)}`;
    
    return originalSrc;
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          'bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm',
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label="Image non disponible"
      >
        Image non disponible
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Image placeholder */}
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            'animate-pulse bg-gray-200 dark:bg-gray-700'
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Image principale */}
      {isInView && (
        <img
          ref={imgRef}
          src={getOptimizedSrc(src)}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
});

export { OptimizedImage };

// Hook pour optimiser le chargement d'images multiples
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState(new Set<string>());
  const [failedImages, setFailedImages] = useState(new Set<string>());

  useEffect(() => {
    const loadImage = (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(url));
          resolve();
        };
        img.onerror = () => {
          setFailedImages(prev => new Set(prev).add(url));
          reject();
        };
        img.src = url;
      });
    };

    // Charger les images en parallèle mais limiter la concurrence
    const loadBatch = async (batch: string[]) => {
      await Promise.allSettled(batch.map(loadImage));
    };

    // Traitement par batch de 3 images
    const batchSize = 3;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      loadBatch(batch);
    }
  }, [urls]);

  return {
    loadedImages,
    failedImages,
    isLoaded: (url: string) => loadedImages.has(url),
    hasFailed: (url: string) => failedImages.has(url),
  };
}

// Composant pour avatar optimisé
interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const OptimizedAvatar = memo(function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  fallback,
  className,
}: OptimizedAvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const pixelSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  if (!src) {
    return (
      <div 
        className={cn(
          'rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium',
          sizes[size],
          className
        )}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={pixelSizes[size]}
      height={pixelSizes[size]}
      className={cn('rounded-full', sizes[size], className)}
      quality={90}
    />
  );
});
