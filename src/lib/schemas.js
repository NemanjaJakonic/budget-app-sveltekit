import { z } from 'zod';

export const transactionSchema = z.object({
	name: z.string().min(2),
	amount: z.number().positive(),
	type: z.enum(['expense', 'income']),
	currency: z.enum(['RSD', 'EUR', 'USD']),
	date: z.string()
});
