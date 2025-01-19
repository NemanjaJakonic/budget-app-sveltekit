class CacheEntry {
	constructor(data, ttl = 5 * 60 * 1000) {
		// 5 minutes default TTL
		this.data = data;
		this.timestamp = Date.now();
		this.ttl = ttl;
	}

	isValid() {
		return Date.now() - this.timestamp < this.ttl;
	}
}

let transactionCache = new Map();
let exchangeRatesCache = null;

export const cache = {
	setTransactions: (userId, transactions, ttl) => {
		transactionCache.set(userId, new CacheEntry(transactions, ttl));
	},

	getTransactions: (userId) => {
		const entry = transactionCache.get(userId);
		if (entry && entry.isValid()) {
			return entry.data;
		}
		transactionCache.delete(userId);
		return null;
	},

	clearTransactions: (userId) => {
		transactionCache.delete(userId);
	},

	setExchangeRates: (rates) => {
		// Cache for one month
		exchangeRatesCache = new CacheEntry(rates, 30 * 24 * 60 * 60 * 1000);
	},

	getExchangeRates: () => {
		if (exchangeRatesCache && exchangeRatesCache.isValid()) {
			return exchangeRatesCache.data;
		}
		exchangeRatesCache = null;
		return null;
	},

	clearExchangeRates: () => {
		exchangeRatesCache = null;
	},

	clearAll: () => {
		transactionCache.clear();
		exchangeRatesCache = null;
	}
};
