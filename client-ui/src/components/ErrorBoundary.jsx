import React, { useState } from 'react';
import ErrorToast from './ErrorToast';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0F0F1E] to-[#1A1A2E]">
          <div className="max-w-md mx-auto p-6 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
            <h1 className="text-lg font-semibold text-red-300 mb-2">Something went wrong</h1>
            <p className="text-sm text-red-400 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
