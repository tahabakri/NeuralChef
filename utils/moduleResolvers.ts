/**
 * Mock implementations for native modules that might not be available
 * These are used when running in environments that don't support these native features
 */

// Mock for NetInfo module
export function mockNetInfo() {
  console.log('Using mock NetInfo implementation');
  
  return {
    addEventListener: (listener: string, callback: Function) => {
      console.log('Mock NetInfo: addEventListener called');
      // Immediately call with connected state
      setTimeout(() => {
        callback({
          type: 'wifi',
          isConnected: true,
          isInternetReachable: true,
        });
      }, 0);
      
      return {
        remove: () => console.log('Mock NetInfo: listener removed')
      };
    },
    fetch: () => {
      console.log('Mock NetInfo: fetch called');
      return Promise.resolve({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
      });
    },
    refresh: () => {
      console.log('Mock NetInfo: refresh called');
      return Promise.resolve({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
      });
    }
  };
}

// Mock for Camera module
export function mockCamera() {
  console.log('Using mock Camera implementation');
  
  return {
    requestCameraPermissionsAsync: () => {
      console.log('Mock Camera: requestCameraPermissionsAsync called');
      return Promise.resolve({ status: 'granted' });
    },
    getCameraPermissionsAsync: () => {
      console.log('Mock Camera: getCameraPermissionsAsync called');
      return Promise.resolve({ status: 'granted' });
    },
    Constants: {
      Type: {
        back: 'back',
        front: 'front'
      }
    },
    CameraType: {
      back: 'back',
      front: 'front'
    }
  };
}

// Mock for MediaLibrary module
export function mockMediaLibrary() {
  console.log('Using mock MediaLibrary implementation');
  
  return {
    requestPermissionsAsync: () => {
      console.log('Mock MediaLibrary: requestPermissionsAsync called');
      return Promise.resolve({ status: 'granted' });
    },
    getPermissionsAsync: () => {
      console.log('Mock MediaLibrary: getPermissionsAsync called');
      return Promise.resolve({ status: 'granted' });
    },
    createAssetAsync: (uri: string) => {
      console.log('Mock MediaLibrary: createAssetAsync called', uri);
      return Promise.resolve({
        id: 'mock-asset-id',
        uri: uri,
        filename: 'mock-image.jpg',
        mediaType: 'photo'
      });
    },
    saveToLibraryAsync: (uri: string) => {
      console.log('Mock MediaLibrary: saveToLibraryAsync called', uri);
      return Promise.resolve(true);
    }
  };
}

// Mock for Speech module
export function mockSpeech() {
  console.log('Using mock Speech implementation');
  
  return {
    speak: (text: string, options = {}) => {
      console.log('Mock Speech: speak called with text:', text);
      return Promise.resolve();
    },
    stop: () => {
      console.log('Mock Speech: stop called');
      return Promise.resolve();
    },
    isSpeakingAsync: () => {
      console.log('Mock Speech: isSpeakingAsync called');
      return Promise.resolve(false);
    }
  };
}

// Create a utility to register all mocks at once
export function registerMocks() {
  try {
    // If window object exists (web)
    if (typeof window !== 'undefined') {
      window.nativeModules = window.nativeModules || {};
      window.nativeModules.RNCNetInfo = window.nativeModules.RNCNetInfo || mockNetInfo();
      window.nativeModules.ExpoCamera = window.nativeModules.ExpoCamera || mockCamera();
      window.nativeModules.ExpoMediaLibrary = window.nativeModules.ExpoMediaLibrary || mockMediaLibrary();
      window.nativeModules.ExpoSpeech = window.nativeModules.ExpoSpeech || mockSpeech();
    } 
    // If global object exists (React Native)
    else if (typeof global !== 'undefined') {
      // @ts-ignore
      global.nativeModules = global.nativeModules || {};
      // @ts-ignore
      global.nativeModules.RNCNetInfo = global.nativeModules.RNCNetInfo || mockNetInfo();
      // @ts-ignore
      global.ExpoCamera = global.ExpoCamera || mockCamera();
      // @ts-ignore
      global.ExpoMediaLibrary = global.ExpoMediaLibrary || mockMediaLibrary();
      // @ts-ignore
      global.ExpoSpeech = global.ExpoSpeech || mockSpeech();
    }
    
    console.log('Successfully registered mock modules');
  } catch (e) {
    console.error('Error registering mock modules:', e);
  }
}

// Default export for the module
export default registerMocks; 