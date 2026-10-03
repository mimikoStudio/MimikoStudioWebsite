import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <span className="text-5xl block mb-4">⚠️</span>
            <h1 className="font-heading text-2xl text-chocolate mb-4">Something went wrong</h1>
            <p className="text-coffee/60 mb-6 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '/';
                window.location.reload();
              }}
              className="btn-primary"
            >
              🏠 Go to Homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
