import { ApplicationInsights, type IExceptionTelemetry } from '@microsoft/applicationinsights-web';

/**
 * Application Insights JS SDK — initialised once at app entry
 * (web-error-logging.md). Azure does not provide frontend telemetry
 * automatically. The connection string is a write-only ingestion key,
 * safe to expose in the browser. Never log content or PII — identifiers,
 * counts, and event names only.
 */
let appInsights: ApplicationInsights | null = null;

export function initTelemetry(): void {
  const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;
  if (!connectionString || appInsights) {
    return;
  }
  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      enableAutoRouteTracking: false,
      disableFetchTracking: false,
      disableCookiesUsage: true,
    },
  });
  appInsights.loadAppInsights();
  appInsights.trackPageView();
}

/** Report a caught error to App Insights. No-op if telemetry is not configured. */
export function trackException(error: Error, properties?: Record<string, unknown>): void {
  if (!appInsights) {
    return;
  }
  const telemetry: IExceptionTelemetry = { exception: error };
  appInsights.trackException(telemetry, properties);
}

/**
 * Track a named product event. Properties must carry identifiers/counts only —
 * never question text, option text, or voter identity (plan §5).
 */
export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (!appInsights) {
    return;
  }
  appInsights.trackEvent({ name }, properties);
}
