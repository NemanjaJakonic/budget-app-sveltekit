import { z } from 'zod';

export const transactionSchema = z.object({
	name: z.string().min(2),
	amount: z.number().positive(),
	type: z.enum(['expense', 'income']),
	currency: z.enum(['RSD', 'EUR', 'USD']),
	date: z.string()
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z
		.string({ errorMap: () => ({ message: 'Pasword must be between 5 to 20 characters' }) })
		.min(5)
});
