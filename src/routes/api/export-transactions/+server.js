import { json } from '@sveltejs/kit';
import * as XLSX from 'xlsx';
import { getTransactions } from '$lib/transactions';
import { cache } from '$lib/cache';

export async function GET({ locals: { supabase } }) {
	try {
		const { transactions } = await getTransactions(supabase);
		let rates = cache.getExchangeRates();

		if (!rates) {
			console.log('Fetching fresh rates...');
			const response = await fetch('/api/exchange-rates');
			const data = await response.json();

			if (data && data.rates) {
				rates = data.rates;
			}

			cache.setExchangeRates(rates);
		}

		// Group transactions by month
		const transactionsByMonth = transactions.reduce((acc, t) => {
			const date = new Date(t.date);
			const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
			if (!acc[monthKey]) {
				acc[monthKey] = [];
			}
			acc[monthKey].push(t);
			return acc;
		}, {});

		const workbook = XLSX.utils.book_new();

		// Process each month
		Object.entries(transactionsByMonth).forEach(([monthKey, monthTransactions]) => {
			const [year, month] = monthKey.split('-');
			const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
			const sheetName = `${monthName} ${year}`;

			// Prepare data for Excel with converted amounts
			const excelData = monthTransactions.map((t) => {
				// Convert amount to RSD based on currency
				let amountInRSD = t.amount;
				switch (t.currency) {
					case 'EUR':
						amountInRSD = t.amount * rates.RSD;
						break;
					case 'USD':
						amountInRSD = t.amount * rates.USD * rates.RSD;
						break;
					case 'RSD':
						amountInRSD = t.amount;
						break;
				}

				// Add minus sign for expenses
				if (t.type === 'expense') {
					amountInRSD = -amountInRSD;
				}

				return {
					Name: t.name,
					Date: new Date(t.date).toLocaleDateString(),
					Amount: amountInRSD
				};
			});

			// Add total row with SUM formula
			const lastDataRow = excelData.length + 1; // +1 for header row
			excelData.push({
				Name: 'TOTAL',
				Date: '',
				Amount: { f: `SUM(C2:C${lastDataRow})` }
			});

			// Create worksheet
			const worksheet = XLSX.utils.json_to_sheet(excelData);

			// Set column widths
			worksheet['!cols'] = [
				{ wch: 30 }, // Name
				{ wch: 15 }, // Date
				{ wch: 15 } // Amount
			];

			// Format amount column as currency
			for (let i = 2; i <= lastDataRow + 1; i++) {
				// +1 because we added the total row
				const cellRef = `C${i}`;
				if (!worksheet[cellRef]) continue;

				worksheet[cellRef].z = '#,##0.00 "RSD"';
			}

			// Style the total row
			const totalRow = lastDataRow + 1;
			worksheet[`A${totalRow}`] = { v: 'TOTAL', s: { font: { bold: true } } };
			worksheet[`C${totalRow}`].s = { font: { bold: true } };

			XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
		});

		// Generate Excel file
		const excelBuffer = XLSX.write(workbook, {
			type: 'buffer',
			bookType: 'xlsx',
			bookSST: false
		});

		return new Response(excelBuffer, {
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'Content-Disposition': 'attachment; filename="transactions.xlsx"'
			}
		});
	} catch (error) {
		console.error('Export error:', error);
		return json({ error: 'Failed to export transactions' }, { status: 500 });
	}
}
