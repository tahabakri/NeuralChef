import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { imageCache } from './imageCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache expiration time (7 days in milliseconds)
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

// Cache size limit (50MB default)
const DEFAULT_CACHE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB

interface ImageCacheContextType {
  clearCache: () => Promise<void>;
  prefetchImages: (uris: string[]) => Promise<void>;
  isLowDataMode: boolean;
  isCachingEnabled: boolean;
  setCachingEnabled: (enabled: boolean) => void;
  setCacheSizeLimit: (sizeInBytes: number) => void;
}

const ImageCacheContext = createContext<ImageCacheContextType>({
  clearCache: async () => {},
  prefetchImages: async () => {},
  isLowDataMode: false,
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
  const [isLowDataMode, setIsLowDataMode] = useState(false);
  const [isCachingEnabled, setCachingEnabled] = useState(initialCachingEnabled);
  const [cacheSizeLimitBytes, setCacheSizeLimitInternal] = useState(cacheSizeLimit);

  // Track network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      // Consider it low data mode if on cellular with expensive cost
      const lowDataMode = state.type === 'cellular' && 
                          state.details?.cellularGeneration !== '4g' &&
                          state.details?.cellularGeneration !== '5g' &&
                          state.isConnectionExpensive === true;
      
      setIsLowDataMode(lowDataMode);
    });

    return () => unsubscribe();
  }, []);

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
    if (!isCachingEnabled || isLowDataMode || !uris.length) return;
    
    try {
      await imageCache.prefetchMultiple(uris);
    } catch (error) {
      console.warn('Failed to prefetch images:', error);
    }
  };

  const contextValue = useMemo(() => ({
    clearCache,
    prefetchImages,
    isLowDataMode,
    isCachingEnabled,
    setCachingEnabled,
    setCacheSizeLimit
  }), [isLowDataMode, isCachingEnabled, cacheSizeLimitBytes]);

  return (
    <ImageCacheContext.Provider value={contextValue}>
      {children}
    </ImageCacheContext.Provider>
  );
};

export default ImageCacheProvider; 