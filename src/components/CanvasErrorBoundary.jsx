import { Component } from "react"

// The 3D record is decorative — a WebGL failure (lost context, no GPU) must never
// take down the hero. This boundary swaps in a static fallback when that happens.
class CanvasErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // Intentionally swallowed: the fallback is the user-facing recovery.
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

export default CanvasErrorBoundary
