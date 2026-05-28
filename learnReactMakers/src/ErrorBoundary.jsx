import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "#08060d",
            color: "rgba(240, 149, 149, 0.9)",
            minHeight: "120px",
            width: "100%",
            borderRadius: "16px",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "0.5px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >        
        {this.state.error?.message}

        </div>
      );
    }

    return <div>{this.props.children}</div>;
  }
}

export default ErrorBoundary;