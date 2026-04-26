import React from "react";

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("CloudBox UI crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="page-shell">
          <div className="error-panel">
            <p className="eyebrow">CloudBox UI Error</p>
            <h1>Halaman gagal dirender</h1>
            <p>{this.state.error.message || "Terjadi error runtime di frontend."}</p>
            <button className="button small" onClick={() => window.location.reload()}>
              Muat Ulang
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
