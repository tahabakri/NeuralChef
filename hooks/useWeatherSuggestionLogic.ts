import { Ionicons } from '@expo/vector-icons';
import { Recipe as ServiceRecipe } from '@/stores/recipeStore'; // Assuming this is the correct path and type

export interface MockWeather {
  city: string;
  conditionCode: number;
  description: string;
  temp: number; // Celsius
  feels_like: number;
  humidity: number; // Percentage
  wind_speed: number; // m/s
  iconName: keyof typeof Ionicons.glyphMap;
  sunrise: number; // Unix timestamp
  sunset: number; // Unix timestamp
}

export const mockWeatherScenarios: MockWeather[] = [
  { city: "San Francisco", conditionCode: 800, description: "clear sky", temp: 18, feels_like: 17, humidity: 60, wind_speed: 5, iconName: 'sunny-outline', sunrise: 1672588800, sunset: 1672624800 },
  { city: "London", conditionCode: 803, description: "broken clouds", temp: 12, feels_like: 10, humidity: 80, wind_speed: 7, iconName: 'cloudy-outline', sunrise: 1672588800, sunset: 1672624800 },
  { city: "Tokyo", conditionCode: 500, description: "light rain", temp: 15, feels_like: 14, humidity: 90, wind_speed: 3, iconName: 'rainy-outline', sunrise: 1672588800, sunset: 1672624800 },
  { city: "New York", conditionCode: 601, description: "snow", temp: -2, feels_like: -5, humidity: 75, wind_speed: 6, iconName: 'snow-outline', sunrise: 1672588800, sunset: 1672624800 },
  { city: "Dubai", conditionCode: 800, description: "clear sky", temp: 35, feels_like: 38, humidity: 40, wind_speed: 4, iconName: 'sunny', sunrise: 1672588800, sunset: 1672624800 },
];

export interface WeatherRecipeSuggestion {
  id: string;
  title: string;
  message: string; // This will be constructed to include city, temp, description and recipe title
  suggestionReason: string;
  iconName: keyof typeof Ionicons.glyphMap; // Weather icon for the banner
}

export const getWeatherBasedSuggestionLogic = (
  weather: MockWeather,
  availableRecipes: ServiceRecipe[]
): WeatherRecipeSuggestion | null => {
  if (!weather || availableRecipes.length === 0) return null;

  let suggestedRecipe: ServiceRecipe | undefined;
  let reason = "";
  const now = new Date();
  const hour = now.getHours();

  // Prioritize based on weather condition and temperature
  if (weather.temp > 28 && (weather.conditionCode === 800 || weather.description.toLowerCase().includes("sun"))) { // Hot and sunny
    suggestedRecipe = availableRecipes.find(r => r.tags?.includes("salad") || r.tags?.includes("refreshing") || r.tags?.includes("cold"));
    reason = "A light and refreshing dish would be perfect.";
  } else if (weather.conditionCode >= 500 && weather.conditionCode < 600) { // Rainy
    suggestedRecipe = availableRecipes.find(r => r.tags?.includes("soup") || r.tags?.includes("comfort food") || r.tags?.includes("stew"));
    reason = "Rainy days call for comforting food like a warm soup or stew.";
  } else if (weather.temp < 10) { // Cold
    suggestedRecipe = availableRecipes.find(r => r.tags?.includes("hearty") || r.tags?.includes("winter") || r.tags?.includes("baked"));
    reason = `Something warm and hearty is in order.`;
  } else if (hour >= 17 && hour <= 20) { // Dinner time, general nice weather
    suggestedRecipe = availableRecipes.find(r => r.tags?.includes("dinner") && !r.tags?.includes("heavy"));
    reason = "Perfect evening for a delightful dinner.";
  }

  // Fallback if no specific match
  if (!suggestedRecipe) {
    suggestedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    reason = "Here's a tasty idea for today!";
  }

  if (!suggestedRecipe) return null;

  return {
    id: suggestedRecipe.id,
    title: suggestedRecipe.title,
    message: `${weather.city}: ${weather.temp}°C, ${weather.description}. How about ${suggestedRecipe.title}?`,
    suggestionReason: reason, // This is the specific reason for the suggestion
    iconName: weather.iconName,
  };
};
