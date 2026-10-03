import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`[ErrorBoundary caught crash in ${this.props.moduleName || 'module'}]:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-4 bg-white rounded-lg border border-red-200 shadow-sm flex flex-col items-center justify-center text-center">
          <AlertOctagon className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Module Crash Detected</h2>
          <p className="text-slate-600 text-sm mb-4">
            The <b>{this.props.moduleName || 'Component'}</b> module experienced an unexpected rendering error and was safely contained.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
          >
            Attempt Recovery
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
