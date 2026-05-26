import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[RoadSOS render crash]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 px-6 text-white">
          <div className="max-w-sm rounded-[28px] border border-red-300/20 bg-red-500/10 p-5 text-center shadow-2xl">
            <h1 className="text-lg font-bold">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-300">{this.state.error.message || "RoadSOS could not render this page."}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
