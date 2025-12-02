import { z } from 'zod';

export const transactionSchema = z
	.object({
		name: z.string().min(2),
		amount: z.number().positive(),
		type: z.enum(['expense', 'income']),
		currency: z.enum(['RSD', 'EUR', 'USD']),
		date: z.string(),
		category: z.enum(['bills', 'food', 'rest']).nullable().optional()
	})
	.refine(
		(data) => {
			// Category is required only for expenses
			if (data.type === 'expense') {
				return data.category !== null && data.category !== undefined;
			}
			return true;
		},
		{
			message: 'Category is required for expenses',
			path: ['category']
		}
	);

export const loginSchema = z.object({
	email: z.string().email(),
	password: z
		.string({ errorMap: () => ({ message: 'Pasword must be between 5 to 20 characters' }) })
		.min(5)
});
