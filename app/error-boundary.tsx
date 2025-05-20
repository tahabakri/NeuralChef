import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { AlertTriangle } from 'lucide-react-native';
import ErrorScreen from '@/components/ErrorScreen';
import { RecipeErrorType } from '@/services/recipeService'; // Import RecipeErrorType

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const IFRAME_ID = 'rork-web-preview';

const webTargetOrigins = [
  "http://localhost:3000",
  "https://rorkai.com",
  "https://rork.app",
];    

function sendErrorToIframeParent(error: any, errorInfo?: any) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    console.debug('Sending error to parent:', {
      error,
      errorInfo,
      referrer: document.referrer
    });

    const errorMessage = {
      type: 'ERROR',
      error: {
        message: error?.message || error?.toString() || 'Unknown error',
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
      },
      iframeId: IFRAME_ID,
    };

    try {
      window.parent.postMessage(
        errorMessage,
        webTargetOrigins.includes(document.referrer) ? document.referrer : '*'
      );
    } catch (postMessageError) {
      console.error('Failed to send error to parent:', postMessageError);
    }
  }
}

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    event.preventDefault();
    const errorDetails = event.error ?? {
      message: event.message ?? 'Unknown error',
      filename: event.filename ?? 'Unknown file',
      lineno: event.lineno ?? 'Unknown line',
      colno: event.colno ?? 'Unknown column'
    };
    sendErrorToIframeParent(errorDetails);
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    sendErrorToIframeParent(event.reason);
  }, true);

  const originalConsoleError = console.error;
  console.error = (...args) => {
    sendErrorToIframeParent(args.join(' '));
    originalConsoleError.apply(console, args);
  };
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    sendErrorToIframeParent(error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // Determine error type based on error message
  getErrorType(error: Error | null): RecipeErrorType {
    if (!error) return RecipeErrorType.UNKNOWN_ERROR;
    
    if (error.message.includes('Network request failed')) {
      return RecipeErrorType.NETWORK_ERROR;
    // Assuming 'Timeout' maps to a generic FETCH_ERROR or a new TIMEOUT_ERROR if defined
    // For now, let's map it to FETCH_ERROR as a placeholder, or consider adding TIMEOUT_ERROR to RecipeErrorType
    } else if (error.message.includes('Timeout')) {
      return RecipeErrorType.FETCH_ERROR; // Or a new RecipeErrorType.TIMEOUT_ERROR
    } else if (error.message.includes('Failed to generate recipe') ||
               error.message.includes('AI generation failed')) {
      return RecipeErrorType.GENERATE_ERROR;
    // Assuming 'validation' or 'Invalid input' maps to a generic GENERATE_ERROR or a new VALIDATION_ERROR
    // For now, let's map it to GENERATE_ERROR as a placeholder, or consider adding VALIDATION_ERROR to RecipeErrorType
    } else if (error.message.includes('validation') ||
               error.message.includes('Invalid input')) {
      return RecipeErrorType.GENERATE_ERROR; // Or a new RecipeErrorType.VALIDATION_ERROR
    } else {
      return RecipeErrorType.UNKNOWN_ERROR;
    }
  }

  getFriendlyErrorMessage(error: Error | null): string {
    if (!error) return "An unknown error occurred";
    
    // Convert technical errors into user-friendly messages
    if (error.message.includes('Network request failed')) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    } else if (error.message.includes('Timeout')) {
      return "The operation timed out. Please try again later.";
    } else if (error.message.includes('Failed to generate recipe')) {
      return "We couldn't create a recipe with these ingredients. Please try different ingredients or try again later.";
    } else {
      // Generic user-friendly message
      return "Something unexpected happened. Please try again.";
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      const friendlyMessage = this.getFriendlyErrorMessage(this.state.error);
      const errorType = this.getErrorType(this.state.error);
      
      return (
        <ErrorScreen
          title="Oops! Something went wrong"
          message={friendlyMessage}
          buttonText="Try Again"
          errorType={errorType}
          onTryAgain={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;