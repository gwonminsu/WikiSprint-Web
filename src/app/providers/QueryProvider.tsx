import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@shared';

type QueryProviderProps = {
  children: React.ReactNode;
};

// TanStack Query 프로바이더
export function QueryProvider({ children }: QueryProviderProps): React.ReactElement {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
