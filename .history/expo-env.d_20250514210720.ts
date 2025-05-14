/// <reference types="expo/types" />
/// <reference types="expo" />

// NOTE: This file should not be edited and should be in your git ignore

import { useState, useEffect } from 'react';
declare global {
  namespace React {
    export { useState, useEffect };
  }
}