# Custom Illustrations for ReciptAI

This directory contains custom illustrations used throughout the ReciptAI app. These illustrations help create a unique, branded visual experience for users.

## Available Illustrations

The app uses two types of custom illustrations:

1. **SVG Illustrations** - Simple vector graphics defined in `assets/illustrations/index.ts`
2. **Lottie Animations** - More complex, animated illustrations stored as JSON files in `assets/animations/`

### SVG Illustrations

SVG illustrations are defined as string constants in `assets/illustrations/index.ts`:

- `EMPTY_STATE` - Used for empty states
- `RECIPE_SUCCESS` - Success confirmation after creating a recipe
- `SHOPPING_LIST` - Used in the shopping list feature
- `ONBOARDING_WELCOME` - Used in the onboarding tutorial
- `ERROR_STATE` - Used when errors occur

### Lottie Animations

Lottie animations are stored as JSON files in `assets/animations/`:

- `empty-state.json` - Empty state animation
- `recipe-success.json` - Success confirmation animation
- `shopping-list.json` - Shopping list animation
- `welcome.json` - Welcome/onboarding animation
- `error.json` - Error state animation
- `cooking.json` - Cooking process animation

## Using Illustrations in Your App

### Using SVG Illustrations

Use the `CustomIllustration` component:

```tsx
import CustomIllustration from '@/components/CustomIllustration';

// In your component:
<CustomIllustration 
  type="empty-state" 
  size={180}
  animationEnabled={true}
  color="#34C759" // Optional: override color
/>
```

### Using Lottie Animations

Use the `LottieIllustration` component:

```tsx
import LottieIllustration from '@/components/LottieIllustration';

// In your component:
<LottieIllustration 
  type="empty-state" 
  size={180}
  autoPlay={true}
  loop={true}
  speed={1}
/>
```

## Creating New Illustrations

### Adding New SVG Illustrations

1. Design your SVG illustration using a tool like Figma, Adobe Illustrator, or Inkscape
2. Export as SVG
3. Optimize the SVG using a tool like SVGOMG (https://jakearchibald.github.io/svgomg/)
4. Add the SVG string to `assets/illustrations/index.ts`
5. Update the `IllustrationType` type in `components/CustomIllustration.tsx`

### Adding New Lottie Animations

1. Create your animation in Adobe After Effects
2. Export as Lottie JSON using the Bodymovin plugin
3. Place the JSON file in `assets/animations/`
4. Update the `LottieType` type in `components/LottieIllustration.tsx`
5. Add the new case in the `getLottieSource` function

## Best Practices

1. Keep SVGs simple and optimized for performance
2. Maintain consistent style across all illustrations
3. Use the app's color palette (defined in `constants/colors.ts`)
4. Keep animations subtle and not distracting from the content
5. Test animations on low-end devices to ensure good performance
6. Consider adding a static fallback for Lottie animations 