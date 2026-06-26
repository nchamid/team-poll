import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

/**
 * In-app view-state navigation. The app deliberately mirrors the prototype's
 * internal list/create/detail view state rather than adding react-router
 * (ADR-001) — the app is a single section with three views, so a router would
 * add a dependency and chrome for no benefit at this scope.
 */
export type View = { name: 'list' } | { name: 'create' } | { name: 'detail'; pollId: number };

type Action = { type: 'GO_LIST' } | { type: 'GO_CREATE' } | { type: 'GO_DETAIL'; pollId: number };

function reducer(_state: View, action: Action): View {
  switch (action.type) {
    case 'GO_LIST':
      return { name: 'list' };
    case 'GO_CREATE':
      return { name: 'create' };
    case 'GO_DETAIL':
      return { name: 'detail', pollId: action.pollId };
  }
}

interface NavigationContextValue {
  view: View;
  goList: () => void;
  goCreate: () => void;
  goDetail: (pollId: number) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [view, dispatch] = useReducer(reducer, { name: 'list' });

  const goList = useCallback(() => dispatch({ type: 'GO_LIST' }), []);
  const goCreate = useCallback(() => dispatch({ type: 'GO_CREATE' }), []);
  const goDetail = useCallback((pollId: number) => dispatch({ type: 'GO_DETAIL', pollId }), []);

  const value = useMemo(
    () => ({ view, goList, goCreate, goDetail }),
    [view, goList, goCreate, goDetail],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
