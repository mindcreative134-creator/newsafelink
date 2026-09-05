import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-12 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-heading mb-2">
            Something went wrong loading this content.
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            {this.state.error?.message || 'Please refresh the page to continue.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
