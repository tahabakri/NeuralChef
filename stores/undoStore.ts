import { create } from 'zustand';

export type UndoAction = {
  type: string;
  payload: any;
  timestamp: number;
  screen: string;
  undo: () => void;
};

interface UndoState {
  actions: UndoAction[];
  currentScreen: string;
  lastAction: UndoAction | null;
}

interface UndoActions {
  addAction: (action: Omit<UndoAction, 'timestamp'>) => void;
  getLastAction: () => UndoAction | null;
  undoLastAction: () => boolean;
  setCurrentScreen: (screen: string) => void;
  clearActions: () => void;
}

export const useUndoStore = create<UndoState & UndoActions>((set, get) => ({
  actions: [],
  currentScreen: '',
  lastAction: null,

  addAction: (action) => {
    const fullAction: UndoAction = {
      ...action,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      actions: [fullAction, ...state.actions.slice(0, 9)], // Keep only the last 10 actions
      lastAction: fullAction,
    }));
  },

  getLastAction: () => {
    return get().lastAction;
  },

  undoLastAction: () => {
    const { actions, currentScreen } = get();
    
    // Find the last action for the current screen
    const actionToUndo = actions.find(action => action.screen === currentScreen);
    
    if (actionToUndo) {
      // Execute the undo function
      actionToUndo.undo();
      
      // Remove this action from the stack
      set((state) => ({
        actions: state.actions.filter(a => a !== actionToUndo),
        lastAction: state.actions.length > 1 
          ? state.actions.find(a => a !== actionToUndo) || null 
          : null,
      }));
      
      return true;
    }
    
    return false;
  },

  setCurrentScreen: (screen) => {
    set({ currentScreen: screen });
  },

  clearActions: () => {
    set({ actions: [], lastAction: null });
  },
})); 