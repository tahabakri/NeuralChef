import { prefetchAsync, clearMemoryCache, clearDiskCache } from 'expo-image';

/**
 * ImageCache service for improved image loading performance
 */
class ImageCache {
  // Track images currently being prefetched
  private prefetchQueue: Set<string> = new Set();
  
  // Track successfully prefetched images
  private prefetchedImages: Set<string> = new Set();
  
  /**
   * Prefetch an image to have it ready before rendering
   * @param uri Image URI to prefetch
   * @returns Promise that resolves when prefetching is complete
   */
  async prefetch(uri: string): Promise<boolean> {
    if (!uri || this.prefetchQueue.has(uri) || this.prefetchedImages.has(uri)) {
      return false;
    }
    
    try {
      this.prefetchQueue.add(uri);
      await prefetchAsync(uri);
      this.prefetchedImages.add(uri);
      return true;
    } catch (error) {
      console.warn('Failed to prefetch image:', uri, error);
      return false;
    } finally {
      this.prefetchQueue.delete(uri);
    }
  }
  
  /**
   * Prefetch multiple images at once
   * @param uris Array of image URIs to prefetch
   * @returns Promise that resolves when all prefetching is complete
   */
  async prefetchMultiple(uris: string[]): Promise<boolean[]> {
    if (!uris || !uris.length) return [];
    
    // Filter out duplicates and already prefetched images
    const uniqueUris = [...new Set(uris)].filter(
      uri => !this.prefetchQueue.has(uri) && !this.prefetchedImages.has(uri)
    );
    
    const results = await Promise.all(
      uniqueUris.map(uri => this.prefetch(uri))
    );
    
    return results;
  }
  
  /**
   * Clear the in-memory image cache
   */
  clearMemoryCache(): void {
    clearMemoryCache();
  }
  
  /**
   * Clear the on-disk image cache
   */
  async clearDiskCache(): Promise<void> {
    await clearDiskCache();
    this.prefetchedImages.clear();
  }
  
  /**
   * Check if an image has been prefetched
   * @param uri Image URI to check
   * @returns Boolean indicating if the image is prefetched
   */
  isPrefetched(uri: string): boolean {
    return this.prefetchedImages.has(uri);
  }
}

// Export singleton instance
export const imageCache = new ImageCache(); 