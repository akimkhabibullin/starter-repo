import { z } from 'zod';

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.'));
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be no more than 72 characters.');

export const credentialsSchema = z.object({ email, password });

export const signUpSchema = z
  .object({
    email,
    password,
    confirmPassword: password,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const emailSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: password,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type CredentialsInput = z.input<typeof credentialsSchema>;
export type Credentials = z.output<typeof credentialsSchema>;
export type SignUpInput = z.input<typeof signUpSchema>;
export type SignUp = z.output<typeof signUpSchema>;
export type EmailInput = z.input<typeof emailSchema>;
export type Email = z.output<typeof emailSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type ResetPassword = z.output<typeof resetPasswordSchema>;
