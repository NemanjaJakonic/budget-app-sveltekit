/**
 * Expense categories configuration
 * - value: stored in database (lowercase)
 * - label: displayed in UI (capitalized)
 */
export const EXPENSE_CATEGORIES = [
	{ value: 'bills', label: 'Bills' },
	{ value: 'food', label: 'Food' },
	{ value: 'rest', label: 'Rest' }
];

/**
 * Get category label by value
 * @param {string} value - lowercase category value
 * @returns {string} - capitalized label
 */
export function getCategoryLabel(value) {
	const category = EXPENSE_CATEGORIES.find((c) => c.value === value);
	return category ? category.label : value;
}

/**
 * Currency options
 */
export const CURRENCIES = [
	{ value: 'RSD', label: 'RSD' },
	{ value: 'EUR', label: 'EUR' },
	{ value: 'USD', label: 'USD' }
];

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = [
	{ value: 'expense', label: 'Expense' },
	{ value: 'income', label: 'Income' }
];

