import { Component, type ErrorInfo, type ReactNode } from 'react';
import { trackException } from '@/lib/telemetry';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Root error boundary. Catches rendering failures, reports them to App
 * Insights via trackException, and shows a recoverable surface instead of a
 * blank screen. Never renders raw error messages or stack traces.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    trackException(error, { componentStack: info.componentStack ?? '' });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.boundary} role="alert">
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.body}>
            The app hit an unexpected error. Reload the page to try again.
          </p>
          <button type="button" className={styles.button} onClick={this.handleReload}>
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
