import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { AlertTriangle } from 'lucide-react-native';

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

      return (
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          accessible={true}
          accessibilityLabel="Error screen"
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={60} color={colors.error} />
            </View>
            
            <Text style={styles.title} accessibilityRole="header">
              Oops! Something went wrong
            </Text>
            
            <Text style={styles.message}>
              {friendlyMessage}
            </Text>
            
            {Platform.OS !== 'web' && (
              <Text style={styles.description}>
                If this problem persists, please restart the app.
              </Text>
            )}
            
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={this.handleRetry}
              accessibilityLabel="Try again button"
              accessibilityHint="Attempts to recover from the error"
              accessibilityRole="button"
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.title2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    minWidth: 150,
    alignItems: 'center',
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default ErrorBoundary;