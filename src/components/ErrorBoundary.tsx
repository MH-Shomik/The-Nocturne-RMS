// Error boundary component with WorldPlate styling
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-deep-black flex items-center justify-center p-8">
          <div className="card max-w-lg w-full text-center">
            <div className="mb-6">
              <svg 
                className="w-16 h-16 text-alert-red mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              
              <h2 className="text-2xl font-display font-semibold text-light-gray mb-2">
                Something went wrong
              </h2>
              
              <p className="text-warm-beige mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              
              {this.state.error && (
                <details className="text-left bg-deep-black/50 p-4 rounded-lg mb-6">
                  <summary className="cursor-pointer text-accent-orange text-sm font-medium">
                    Technical Details
                  </summary>
                  <pre className="mt-2 text-xs text-warm-beige overflow-auto">
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>\n\nStack trace:\n{this.state.error.stack}</>
                    )}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="btn-secondary"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;