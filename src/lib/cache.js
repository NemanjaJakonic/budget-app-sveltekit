class CacheEntry {
	constructor(data, ttl = 60 * 60 * 1000) {
		// 1 hour default TTL
		this.data = data;
		this.timestamp = Date.now();
		this.ttl = ttl;
	}

	isValid() {
		return Date.now() - this.timestamp < this.ttl;
	}
}

let transactionCache = new Map();
let profileCache = new Map();
let exchangeRatesCache = null;

export const cache = {
	// Transactions
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

	// Profiles
	setProfile: (userId, profile, ttl) => {
		// Default 1 hour TTL, same as transactions
		profileCache.set(userId, new CacheEntry(profile, ttl));
	},

	getProfile: (userId) => {
		const entry = profileCache.get(userId);
		if (entry && entry.isValid()) {
			return entry.data;
		}
		profileCache.delete(userId);
		return null;
	},

	clearProfile: (userId) => {
		profileCache.delete(userId);
	},

	// Exchange Rates
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

	// Clear all
	clearAll: () => {
		transactionCache.clear();
		profileCache.clear();
		exchangeRatesCache = null;
	}
};
