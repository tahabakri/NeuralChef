import { prefetchAsync, clearMemoryCache } from 'expo-image';

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
   * Prefetch multiple images in parallel
   * @param uris Array of image URIs to prefetch
   * @returns Promise that resolves when all images are prefetched
   */
  async prefetchMultiple(uris: string[]): Promise<boolean[]> {
    return Promise.all(uris.map(uri => this.prefetch(uri)));
  }
  
  /**
   * Clear the in-memory image cache
   */
  clearMemoryCache(): void {
    clearMemoryCache();
    this.prefetchedImages.clear();
  }
  
  /**
   * Clear the disk cache (if available)
   * Note: This is a no-op if clearDiskCache is not available
   */
  async clearDiskCache(): Promise<void> {
    try {
      // Import clearDiskCache dynamically to handle cases where it's not available
      const { clearDiskCache } = await import('expo-image');
      if (typeof clearDiskCache === 'function') {
        await clearDiskCache();
      }
    } catch (error) {
      // Silently handle the case where clearDiskCache is not available
      console.debug('clearDiskCache not available, skipping disk cache cleanup');
    }
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