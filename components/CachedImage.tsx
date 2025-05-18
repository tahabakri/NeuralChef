import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { useImageCache } from '@/services/ImageCacheManager';
import colors from '@/constants/colors';

interface CachedImageProps {
  source: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
}

/**
 * CachedImage component for displaying images that work offline
 * This component handles caching and placeholder display
 */
export default function CachedImage({
  source,
  style,
  contentFit = 'cover',
  placeholder,
  onLoad,
  onError,
  accessible,
  accessibilityLabel,
}: CachedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { prefetchImages, isCachingEnabled } = useImageCache();
  
  // Prefetch the image when component mounts
  useEffect(() => {
    const prefetch = async () => {
      if (source && isCachingEnabled) {
        await prefetchImages([source]);
      }
    };
    
    prefetch();
  }, [source, isCachingEnabled, prefetchImages]);

  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Handle image load error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Main Image */}
      <Image
        source={source}
        contentFit={contentFit}
        style={[styles.image, hasError && styles.hiddenImage]}
        onLoad={handleLoad}
        onError={handleError}
        cachePolicy="memory-disk"
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
      />
      
      {/* Loading Placeholder */}
      {isLoading && !hasError && (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          {placeholder || <View style={styles.defaultPlaceholder} />}
        </View>
      )}
      
      {/* Error Placeholder */}
      {hasError && (
        <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
          {placeholder || (
            <View style={styles.errorPlaceholder}>
              <Image
                source={require('@/assets/images/placeholder-error.png')}
                style={styles.errorImage}
                contentFit="contain"
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hiddenImage: {
    opacity: 0,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  defaultPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  errorPlaceholder: {
    width: '50%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorImage: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
}); 