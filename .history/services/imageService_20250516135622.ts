import { Alert } from 'react-native';

// Mock function simulating Gemini API image-to-text
const mockGeminiImageToText = async (imageUri: string): Promise<string> => {
  console.log('Processing image:', imageUri);
  // Simulate API response (replace with real API call later)
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock response - simulates text extracted from an ingredient list image
      resolve("chicken breast, olive oil, garlic, onion, bell pepper, tomatoes, basil, oregano, salt, black pepper");
    }, 1500);
  });
};

/**
 * Extract text from an image using Google Gemini's OCR capabilities
 * @param imageUri URI of the image to process
 * @returns Array of extracted ingredients
 */
export const extractTextFromImage = async (imageUri: string): Promise<string[]> => {
  try {
    const extractedText = await mockGeminiImageToText(imageUri);
    
    // Process text into an array of ingredients
    const ingredients = extractedText
      .split(/,|\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    
    console.log('Extracted ingredients:', ingredients);
    return ingredients;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    Alert.alert(
      "Text Extraction Failed", 
      "Couldn't read the ingredients from your photo. Please try again or enter them manually."
    );
    return [];
  }
};

/**
 * In a real implementation, this function would use the Google Gemini API
 * Example of how the real implementation might look:
 */
/*
const realGeminiImageToText = async (imageUri: string): Promise<string> => {
  try {
    // Convert image to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    // Remove prefix from base64 string (data:image/jpeg;base64,)
    const base64Data = base64.split(',')[1];
    
    // Make API request to Gemini
    const apiResponse = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': 'YOUR_GEMINI_API_KEY',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Extract all ingredients from this image. Format them as a comma-separated list."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }
        ]
      })
    });
    
    const data = await apiResponse.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
*/ 