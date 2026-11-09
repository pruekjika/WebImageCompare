import React from "react";

interface Props {
  /** What broke, as the visitor would name it ("Image compare"). */
  section: string;
  children: React.ReactNode;
}

/** Keeps one broken section from blanking the whole page. */
class ErrorBoundary extends React.Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`${this.props.section} crashed:`, error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className='load-status' role='alert'>
        <p>{this.props.section} stopped working.</p>
        <button type='button' className='btn' onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
