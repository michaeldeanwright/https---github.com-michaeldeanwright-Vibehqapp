import { QueryClient, QueryCache } from '@tanstack/react-query';
import { showErrorBanner } from '@/lib/error-banner';

export const queryClientInstance = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			console.error('Query failed:', query.queryKey, error);
			showErrorBanner(`Couldn't load "${query.queryKey.join('/')}": ${error?.message || error}`);
		},
	}),
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});
