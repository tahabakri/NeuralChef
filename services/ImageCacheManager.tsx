import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { imageCache } from './imageCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache size limit (50MB default)
const DEFAULT_CACHE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB

interface ImageCacheContextType {
  clearCache: () => Promise<void>;
  prefetchImages: (uris: string[]) => Promise<void>;
  isCachingEnabled: boolean;
  setCachingEnabled: (enabled: boolean) => void;
  setCacheSizeLimit: (sizeInBytes: number) => void;
}

const ImageCacheContext = createContext<ImageCacheContextType>({
  clearCache: async () => {},
  prefetchImages: async () => {},
  isCachingEnabled: true,
  setCachingEnabled: () => {},
  setCacheSizeLimit: () => {},
});

export const useImageCache = () => useContext(ImageCacheContext);

interface ImageCacheProviderProps {
  children: ReactNode;
  initialCachingEnabled?: boolean;
  cacheSizeLimit?: number;
}

export const ImageCacheProvider: React.FC<ImageCacheProviderProps> = ({ 
  children, 
  initialCachingEnabled = true,
  cacheSizeLimit = DEFAULT_CACHE_SIZE_LIMIT
}) => {
  const [isCachingEnabled, setCachingEnabled] = useState(initialCachingEnabled);
  const [cacheSizeLimitBytes, setCacheSizeLimitInternal] = useState(cacheSizeLimit);

  // Clear memory cache when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        imageCache.clearMemoryCache();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Clean up expired cache entries periodically
  useEffect(() => {
    const cleanupExpiredCache = async () => {
      try {
        const lastCleanupStr = await AsyncStorage.getItem('imageCache_lastCleanup');
        const now = Date.now();
        
        // Only clean up once a day
        if (!lastCleanupStr || now - parseInt(lastCleanupStr) > 24 * 60 * 60 * 1000) {
          // Clear disk cache (the imageCache service will handle this)
          await imageCache.clearDiskCache();
          await AsyncStorage.setItem('imageCache_lastCleanup', now.toString());
        }
      } catch (error) {
        console.warn('Failed to clean up image cache:', error);
      }
    };

    // Run cleanup on initial load
    cleanupExpiredCache();
  }, []);

  // Public method to clear cache
  const clearCache = async () => {
    try {
      await imageCache.clearDiskCache();
      imageCache.clearMemoryCache();
      await AsyncStorage.setItem('imageCache_lastCleanup', Date.now().toString());
    } catch (error) {
      console.error('Failed to clear image cache:', error);
    }
  };

  // Set cache size limit
  const setCacheSizeLimit = (sizeInBytes: number) => {
    setCacheSizeLimitInternal(sizeInBytes);
    // Note: expo-image doesn't directly support setting a cache size limit,
    // but we're keeping this API for potential future implementations
  };

  // Prefetch multiple images
  const prefetchImages = async (uris: string[]) => {
    if (!isCachingEnabled || !uris.length) return;
    
    try {
      await imageCache.prefetchMultiple(uris);
    } catch (error) {
      console.warn('Failed to prefetch images:', error);
    }
  };

  const contextValue = useMemo(() => ({
    clearCache,
    prefetchImages,
    isCachingEnabled,
    setCachingEnabled,
    setCacheSizeLimit
  }), [isCachingEnabled, cacheSizeLimitBytes]);

  return (
    <ImageCacheContext.Provider value={contextValue}>
      {children}
    </ImageCacheContext.Provider>
  );
};

export default ImageCacheProvider; 