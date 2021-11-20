import React from "react";

export interface ErrBoundProps {
  children: React.ReactNode | React.ReactNode[];
}

interface ErrBoundState {
  hasError: boolean;
}

export class ErrBound extends React.Component<ErrBoundProps, ErrBoundState> {
  constructor(props: ErrBoundProps) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(_err: Error): ErrBoundState {
    return {hasError: true};
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children || null;
  }
}
