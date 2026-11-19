import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF4EE] text-[#2A1A20] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-[#2A1A20]/10 text-center space-y-4">
            <img
              src="/logo.png"
              alt="Bags&Steps"
              className="w-16 h-16 mx-auto rounded-full object-cover"
            />
            <h2 className="text-2xl font-serif-editorial text-[#6B1238]">
              Bags&amp;Steps
            </h2>
            <p className="text-sm text-[#6E5760] leading-relaxed">
              Something interrupted the storefront connection. Please refresh the page to continue browsing.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-[#6B1238] text-[#FAF4EE] text-sm font-medium hover:bg-[#540D2B] transition-colors"
            >
              Reload Boutique
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
