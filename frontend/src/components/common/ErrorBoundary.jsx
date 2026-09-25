import { Component } from "react";

// A React error boundary — catches JavaScript errors thrown during
// rendering, in lifecycle methods, or in constructors of the component
// tree below it, and renders a fallback UI instead of a blank white
// screen. This is fundamentally different from axios error handling:
// it catches bugs in the React tree itself (e.g. a component crashing
// on unexpected data shape), not failed API calls, which are already
// fully handled by axiosInstance's interceptor above.
//
// Error boundaries MUST be class components — React does not currently
// provide a Hook equivalent for getDerivedStateFromError/componentDidCatch.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Logged for diagnosis. In a real production deployment this is
    // where an error-reporting service call would go — no such service
    // is part of the current stack, so this stays a console log.
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            An unexpected error occurred while displaying this page. You can
            try returning to your dashboard.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;