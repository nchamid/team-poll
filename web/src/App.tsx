import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/AppShell';
import { SignInPage } from '@/pages/SignInPage';
import { ApiClientProvider } from '@/lib/ApiClientProvider';
import { NavigationProvider, useNavigation } from '@/store/navigation';
import { queryKeys } from '@/lib/queryKeys';
import { PollListPage, CreatePollPage, PollDetailPage } from '@features/polls';
import { type PollDetail } from '@features/polls/types';

/** Renders the active view and computes the breadcrumb leaf for the top bar.
 * Exported so the static demo build (src/demo) can render the same view-switcher
 * against a mock API client without going through MSAL's auth gate. */
export function AppContent() {
  const { view } = useNavigation();
  const queryClient = useQueryClient();

  let breadcrumbLeaf: string | null = null;
  if (view.name === 'create') {
    breadcrumbLeaf = 'New poll';
  } else if (view.name === 'detail') {
    const cached = queryClient.getQueryData<PollDetail>(queryKeys.polls.detail(view.pollId));
    breadcrumbLeaf = cached?.question ?? 'Poll';
  }

  return (
    <AppShell breadcrumbLeaf={breadcrumbLeaf}>
      {view.name === 'list' && <PollListPage />}
      {view.name === 'create' && <CreatePollPage />}
      {view.name === 'detail' && <PollDetailPage pollId={view.pollId} />}
    </AppShell>
  );
}

/** Root app: MSAL gates the shell; unauthenticated users see the sign-in page. */
export function App() {
  return (
    <>
      <AuthenticatedTemplate>
        <ApiClientProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </ApiClientProvider>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <SignInPage />
      </UnauthenticatedTemplate>
    </>
  );
}
