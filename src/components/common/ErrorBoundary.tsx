import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 max-w-md w-full shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-amber-700" />
            </div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Something went wrong
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              The application encountered an unexpected issue. Please click below to reload the café ordering page.
            </p>
            {this.state.error?.message && (
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-[11px] font-mono text-stone-600 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Café Menu</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
