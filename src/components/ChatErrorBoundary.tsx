'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ChatErrorBoundary extends React.Component<
  React.PropsWithChildren<Record<never, never>>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<Record<never, never>>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ChatErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 p-6 text-center">
          <p className="text-base text-fg">Chat is unavailable</p>
          <p className="text-sm text-fg-dim">
            Something broke while loading the conversation. Refresh to try again.
          </p>
          <button
            type="button"
            className="h-7 px-3 bg-success hover:bg-success/90 text-bg text-sm font-medium rounded-md flex items-center gap-1.5"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
