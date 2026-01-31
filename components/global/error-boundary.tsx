"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-12 min-h-[400px] w-full text-center space-y-6 bg-card/30 rounded-3xl border border-dashed border-red-500/20 backdrop-blur-sm">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 animate-pulse">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our editor encountered an unexpected error. This can sometimes
              happen with complex workflow layouts.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-red-500/5 rounded-lg border border-red-500/10 text-xs font-mono text-red-400 max-w-lg mx-auto overflow-auto">
                {this.state.error.message}
              </div>
            )}
          </div>
          <Button
            onClick={this.handleReset}
            variant="outline"
            className="gap-2 border-red-500/20 hover:bg-red-500/10"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Editor
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
