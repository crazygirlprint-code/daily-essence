import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: (failureCount, error) => {
				// Don't retry on 429 (rate limit) — retrying immediately makes it worse
				if (error?.response?.status === 429) return false;
				return failureCount < 1;
			},
			staleTime: 30000,
		},
	},
});