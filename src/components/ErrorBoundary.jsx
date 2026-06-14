import { Component } from "react"

// Error boundaries must be class components (React has no hook equivalent).
// Belt-and-suspenders around the dynamic, animated bits so a framer-motion /
// React-19 reconciliation hiccup degrades gracefully instead of blanking the page.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
