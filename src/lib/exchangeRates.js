const isBrowser = typeof window !== 'undefined';

export async function getLatestRates(fetch) {
	if (isBrowser) {
		const storedRates = localStorage.getItem('exchangeRates');
		console.log('Stored rates from localStorage:', storedRates);

		if (storedRates) {
			const { rates, timestamp } = JSON.parse(storedRates);
			const today = new Date().toISOString().split('T')[0];
			console.log('Comparing timestamps:', { stored: timestamp, today });
			console.log('Are timestamps equal?', timestamp === today);

			if (timestamp === today) {
				console.log('Cache hit! Using stored rates');
				return rates;
			} else {
				console.log("Cache miss: timestamps don't match");
			}
		} else {
			console.log('No stored rates found');
		}
	}

	try {
		console.log('Fetching fresh rates...');
		const fetchToUse = fetch || window.fetch;
		const response = await fetchToUse('/api/exchange-rates');

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log('Received rates data:', data);

		if (!data || !data.rates) {
			throw new Error('Invalid data received from API');
		}

		if (isBrowser) {
			const today = new Date().toISOString().split('T')[0];
			localStorage.setItem(
				'exchangeRates',
				JSON.stringify({
					rates: data.rates,
					timestamp: today
				})
			);
		}

		return data.rates;
	} catch (error) {
		console.error('Error getting exchange rates:', error);
		return null;
	}
}
