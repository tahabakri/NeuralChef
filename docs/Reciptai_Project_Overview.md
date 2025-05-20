# Reciptai Project Overview

## 1. Introduction
   - Brief description of the Reciptai application.
   - Core purpose: Recipe management, generation, and discovery.

## 2. Core Technologies
   - React Native
   - Expo (including Expo Router)
   - TypeScript
   - State Management (inferred from `stores/` directory, specific library like Zustand, MobX, or Context API would require deeper code inspection)

## 3. Directory Structure Highlights
   - `app/`: Screens and navigation (Expo Router).
     - `(tabs)/`: Main application sections (e.g., Home, Recipe, Saved, Settings).
     - `onboarding/`: Initial user setup flow.
     - `recipe/`: Screens related to individual recipe display.
   - `assets/`: Static resources (images, fonts, animations).
   - `components/`: Reusable UI elements.
     - `home/`: Components specific to the home screen.
     - `common/`: General reusable components.
   - `constants/`: Application-wide constants (colors, typography, spacing).
   - `services/`: Business logic, API interactions, and utility functions (e.g., `recipeService.ts`, `imageService.ts`).
   - `stores/`: Application state management (e.g., `recipeStore.ts`, `userStore.ts`, `savedRecipesStore.ts`).
   - `hooks/`: Custom React hooks.
   - `styles/`: Global or shared styling definitions.
   - `types/`: TypeScript type definitions.
   - `utils/`: General utility functions.

## 4. Key Features & User Flows

   ### 4.1. Onboarding
      - Welcome screens to introduce the app.
      - Guided tour of features.
      - Potential for initial preference setup (e.g., dietary restrictions, favorite cuisines).
      - *Relevant Files/Folders:* `app/onboarding/`, `components/WelcomeScreen.tsx`, `components/OnboardingScreen.tsx`, `assets/animations/welcome.json`, `stores/onboardingStore.ts`, `stores/preferencesStore.ts`

   ### 4.2. Home & Discovery
      - Main dashboard, possibly with a personalized greeting.
      - Display of featured content: popular recipes, recommended recipes, "recipe of the day."
      - "Surprise Me" or similar feature for random recipe suggestion.
      - *Relevant Files/Folders:* `app/(tabs)/index.tsx`, `components/home/GreetingHeader.tsx`, `components/home/SurpriseButton.tsx`, `app/(tabs)/popular.tsx`, `app/recipes/recommended.tsx`, `app/recipes/today.tsx`

   ### 4.3. Recipe Input & Generation
      - Manual input of ingredients or recipe keywords.
      - Camera-based ingredient input (likely using image recognition).
      - Voice-based ingredient input.
      - Generation of recipes based on the provided inputs.
      - **Recipe Generation Screen (`app/generate.tsx`):**
         - **Purpose:** Displays the progress of AI recipe generation.
         - **Visual Layout:**
           - Background: Light gray (#F5F5F5).
           - Top-Left: `BackArrow.tsx` component to navigate back to the Home screen.
           - Center: `LoadingOverlay.tsx` component displaying a spinner and text (e.g., "Generating your lunch recipe...").
           - Bottom: `Button.tsx` labeled "Cancel" with a gray color (#B0BEC5).
         - **Functionality:**
           - Utilizes `services/recipeService.ts` to generate a recipe (e.g., "Chicken Salad").
           - Upon successful recipe generation, it redirects the user to the recipe detail screen (`app/recipe/[id].tsx`).
      - *Relevant Files/Folders:* `app/input.tsx`, `app/generate.tsx`, `components/IngredientInput.tsx`, `components/CameraInput.tsx`, `components/VoiceInputModal.tsx`, `components/BackArrow.tsx`, `components/LoadingOverlay.tsx`, `components/Button.tsx`, `services/recipeService.ts`, `services/imageService.ts`, `utils/mockRecipeGeneration.ts`, `utils/mockImageRecognition.ts`

   ### 4.4. Recipe Browsing & Search
      - Listing of recipes with various views (cards, lists).
      - Filtering options (e.g., by category, cuisine, cooking time).
      - Sorting options.
      - Keyword-based search functionality.
      - *Relevant Files/Folders:* `app/(tabs)/recipe.tsx` (could be a general browser or a specific recipe context), `app/search.tsx`, `components/RecipeCard.tsx`, `components/RecipeCarousel.tsx`, `components/SearchBar.tsx`, `components/RecipeFilter.tsx`, `utils/recipeFilters.ts`

   ### 4.5. Recipe Viewing
      - Detailed screen for individual recipes.
      - Display of:
         - Recipe name, description, images/videos.
         - List of ingredients with quantities.
         - Step-by-step preparation instructions.
         - Cooking time, difficulty, serving size.
         - Nutritional information (if available).
         - User ratings/reviews.
      - *Relevant Files/Folders:* `app/recipe.tsx`, `app/recipe/[id].tsx`, `components/RecipeDetailScreen.tsx`, `components/RecipeHeader.tsx`, `components/IngredientList.tsx`, `components/StepList.tsx`, `components/RecipeView.tsx`

   ### 4.6. Saved Recipes & History
      - Functionality for users to save or bookmark their favorite recipes.
      - A dedicated section to access saved recipes.
      - History of recently viewed or generated recipes.
      - *Relevant Files/Folders:* `app/(tabs)/saved.tsx`, `stores/savedRecipesStore.ts`, `app/(tabs)/history.tsx`, `stores/recipeHistoryStore.ts`, `components/SaveButton.tsx`

   ### 4.7. User Profile & Settings
      - User account management (if authentication is implemented).
      - Application settings:
         - Theme customization (light/dark mode).
         - Notification preferences.
         - Dietary preferences or other user-specific settings.
      - *Relevant Files/Folders:* `app/(tabs)/settings.tsx`, `app/profile.tsx`, `app/preferences.tsx`, `components/ThemeSwitch.tsx`, `components/NotificationSwitch.tsx`, `stores/userStore.ts`, `stores/preferencesStore.ts`

## 5. State Management
   - The application uses a structured approach for state management, evident from the `stores/` directory.
   - Key stores include:
     - `recipeStore.ts`: Manages general recipe data, possibly fetched recipes.
     - `ingredientsStore.ts`: Manages state related to ingredients.
     - `onboardingStore.ts`: Manages the state of the user onboarding process.
     - `preferencesStore.ts`: Stores user preferences.
     - `recipeHistoryStore.ts`: Keeps track of viewed recipes.
     - `savedRecipesStore.ts`: Manages user's saved/bookmarked recipes.
     - `userStore.ts`: Manages user-specific data and authentication state.
     - `undoStore.ts`: Suggests functionality for undoing actions.
   - The exact state management library (e.g., Zustand, MobX, Redux Toolkit, or custom Context API) would require inspecting the implementation within these store files.

## 6. Services & Data Handling
   - `services/recipeService.ts`: Handles logic related to fetching, creating, or processing recipe data. This might involve API calls to a backend or processing local data.
   - `services/imageService.ts`: Manages image-related operations, possibly including uploading images or processing images for ingredient recognition.
   - `services/imageCache.ts` & `services/ImageCacheManager.tsx`: Suggests a system for caching images to improve performance and reduce network requests.
   - `services/notifications.ts`: Handles push notifications or in-app notifications.
   - `services/voiceService.ts`: Manages voice input processing.
   - Data can be fetched from external APIs, or mock data might be used during development (e.g., `utils/mockRecipeGeneration.ts`).

## 7. Navigation
   - Expo Router is used for declarative, file-system-based routing.
   - `app/_layout.tsx`: Defines the root layout of the application.
   - `app/(tabs)/_layout.tsx`: Defines the layout for the main tab navigation.
   - Dynamic routes like `app/recipe/[id].tsx` allow for passing parameters to screens.
   - Stack navigation is implicitly handled by the directory structure for nested routes.

## 8. UI Components & Styling
   - A rich set of reusable components is present in `components/`.
   - Custom fonts are stored in `assets/fonts/`.
   - Animations (likely Lottie) are in `assets/animations/`.
   - Styling constants (colors, typography, spacing) are defined in `constants/`.

## 9. Potential Areas for Deeper Dive / Further Understanding
   - The specific implementation details of the camera input (`components/CameraInput.tsx`) and voice input (`components/VoiceInputModal.tsx`).
   - The logic behind recipe generation in `services/recipeService.ts` and `utils/mockRecipeGeneration.ts`.
   - Authentication flow, if implemented (related to `stores/userStore.ts` and potentially `components/AuthModal.tsx`).
   - Error handling strategies (`app/error-boundary.tsx`, `components/ErrorScreen.tsx`, `components/ErrorState.tsx`).
   - Offline support capabilities (`components/OfflineBanner.tsx`).
   - Feedback mechanisms (`components/FeedbackSystem.tsx`, `components/CustomToast.tsx`).
