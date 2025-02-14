import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function convertToRSD(amount) {
	const currencyFormat = new Intl.NumberFormat('sr-Latn-RS', {
		style: 'currency',
		currency: 'EUR'
	});
	return currencyFormat.format(amount).replace('€', 'RSD');
}

export function convertToEUR(amount) {
	const currencyFormat = new Intl.NumberFormat('sr-Latn-RS', {
		style: 'currency',
		currency: 'EUR'
	});
	return currencyFormat.format(amount);
}

export function convertToUSD(amount) {
	const currencyFormat = new Intl.NumberFormat('sr-Latn-RS', {
		style: 'currency',
		currency: 'USD'
	});
	return currencyFormat.format(amount);
}
