import { z } from 'zod';

export const RegisterUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().min(1, { message: 'Email is required' }).email(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;
