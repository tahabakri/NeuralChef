import { MicroPreference, CookingGoal, MedicalCondition } from '@/stores/preferencesStore';

// Common Types

// Dietary profile type
export type DietaryProfileType =
  | 'noRestrictions'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'paleo'
  | 'keto'
  | 'lowCarb'
  | 'glutenFree'
  | 'dairyFree';

// Spice level type
export type SpiceLevelType = 'none' | 'mild' | 'medium' | 'spicy' | 'extraSpicy';

// Portion size type
export type PortionSizeType = 'single' | 'couple' | 'family' | 'large';

// Component Props Types

export interface DietaryProfileSelectorProps {
  selectedProfile: DietaryProfileType | string; // Allow string for initial/default state if needed, or be strict with DietaryProfileType
  onSelectProfile: (profile: DietaryProfileType) => void;
}

export interface AllergiesSectionProps {
  selectedAllergies: string[];
  customAllergies: string[];
  onToggleAllergy: (id: string) => void;
  onAddCustomAllergy: (allergy: string) => void;
  onRemoveCustomAllergy: (allergy: string) => void;
}

export interface DislikedIngredientsSectionProps {
  dislikedIngredients: string[];
  onAddIngredient: (ingredient: string) => void;
  onRemoveIngredient: (ingredient: string) => void;
}

export interface SpiceLevelSelectorProps {
  selectedLevel: SpiceLevelType | string; // Allow string for initial/default state
  onSelectLevel: (level: SpiceLevelType) => void;
}

export interface CuisineTypeSelectorProps {
  selectedCuisines: string[];
  onToggleCuisine: (id: string) => void;
  customCuisines: string[]; // New: to hold custom entered cuisines
  onAddCustomCuisine: (cuisine: string) => void; // New: handler to add custom cuisine
  onRemoveCustomCuisine: (cuisine: string) => void; // New: handler to remove custom cuisine
}

export interface CookingTimeSelectorProps {
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

export interface CalorieSelectorProps {
  maxCalories: string;
  onChangeCalories: (calories: string) => void;
}

export interface PortionSizeSelectorProps {
  selectedSize: PortionSizeType | string; // Allow string for initial/default state
  onSelectSize: (size: PortionSizeType) => void;
}

export interface MicroPreferencesSectionProps {
  selectedPreferences: MicroPreference[];
  onTogglePreference: (id: MicroPreference) => void;
}

export interface CookingGoalsSectionProps {
  selectedGoals: CookingGoal[];
  onToggleGoal: (id: CookingGoal) => void;
}

// Updated Props for MedicalConditionsSelector
export interface MedicalConditionsSelectorProps {
  selectedPredefinedConditions: MedicalCondition[]; // Stores IDs of selected predefined conditions
  customMedicalConditions: string[]; // Stores user-added custom condition strings
  onTogglePredefinedCondition: (conditionId: MedicalCondition) => void;
  onAddCustomCondition: (condition: string) => void;
  onRemoveCustomCondition: (condition: string) => void;
}
