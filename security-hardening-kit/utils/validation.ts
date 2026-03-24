// Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
// Proprietary and confidential.

import { z } from 'zod';

export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*on\w+\s*=\s*["'][^"']*["'][^>]*>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/on(click|load|error|mouseover|focus|blur|submit|change|input|keydown|keyup)\s*=/gi, '')
    .trim();
}

export function encodeHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
  };
  return input.replace(/[&<>"'/`]/g, (char) => map[char] || char);
}

export function sanitizeForLog(input: string): string {
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .substring(0, 500);
}

export const EmailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email too short')
  .max(254, 'Email too long')
  .transform((v) => v.toLowerCase().trim());

export const PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{6,14}$/, 'Phone must be in E.164 format (e.g., +639681577288)')
  .min(8, 'Phone number too short')
  .max(16, 'Phone number too long');

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const OTPSchema = z
  .string()
  .regex(/^\d{6}$/, 'OTP must be exactly 6 digits');

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const SignUpSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  fullName: z
    .string()
    .min(2, 'Name too short')
    .max(100, 'Name too long')
    .transform(sanitizeString),
  phone: PhoneSchema.optional(),
});

export const PhoneLoginSchema = z.object({
  phone: PhoneSchema,
  otp: OTPSchema.optional(),
});

// ZOD SCHEMAS — USER PROFILE

export const ProfileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2)
    .max(100)
    .transform(sanitizeString)
    .optional(),
  phone: PhoneSchema.optional(),
  address: z
    .string()
    .max(500)
    .transform(sanitizeString)
    .optional(),
  city: z
    .string()
    .max(100)
    .transform(sanitizeString)
    .optional(),
  bio: z
    .string()
    .max(1000)
    .transform(sanitizeString)
    .optional(),
  avatarUrl: z
    .string()
    .url('Invalid URL')
    .max(2048)
    .optional(),
});


export const ServiceListingSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title too long')
    .transform(sanitizeString),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description too long')
    .transform(sanitizeString),
  category: z
    .string()
    .min(1)
    .max(100)
    .transform(sanitizeString),
  priceMin: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(10_000_000, 'Price exceeds maximum'),
  priceMax: z
    .number()
    .min(0)
    .max(10_000_000)
    .optional(),
  currency: z.enum(['PHP', 'USD']).default('PHP'),
  location: z
    .string()
    .max(500)
    .transform(sanitizeString)
    .optional(),
});

export const BookingSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  providerId: z.string().uuid('Invalid provider ID'),
  scheduledDate: z
    .string()
    .datetime('Invalid date format')
    .refine(
      (d) => new Date(d) > new Date(),
      'Scheduled date must be in the future'
    ),
  notes: z
    .string()
    .max(2000)
    .transform(sanitizeString)
    .optional(),
  agreedPrice: z
    .number()
    .min(1, 'Price must be at least 1')
    .max(10_000_000),
});

export const ReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review too long')
    .transform(sanitizeString),
});

export const BidSchema = z.object({
  serviceRequestId: z.string().uuid('Invalid service request ID'),
  amount: z
    .number()
    .min(1, 'Bid must be at least 1')
    .max(10_000_000),
  message: z
    .string()
    .max(1000)
    .transform(sanitizeString)
    .optional(),
  estimatedDuration: z
    .string()
    .max(100)
    .transform(sanitizeString)
    .optional(),
});


export const SearchSchema = z.object({
  query: z
    .string()
    .max(200)
    .transform(sanitizeString),
  category: z.string().max(100).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().max(10_000_000).optional(),
  location: z.string().max(200).transform(sanitizeString).optional(),
  page: z.number().int().min(1).max(1000).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'relevance']).default('relevance'),
});


const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

export const FileUploadSchema = z.object({
  name: z
    .string()
    .max(255)
    .regex(/^[a-zA-Z0-9._\-\s]+$/, 'Filename contains invalid characters'),
  type: z.enum([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]),
  size: z
    .number()
    .max(MAX_FILE_SIZE, `File size cannot exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`),
});

export function validateMagicBytes(buffer: ArrayBuffer, declaredType: string): boolean {
  const bytes = new Uint8Array(buffer);
  const signatures: Record<string, number[]> = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'application/pdf': [0x25, 0x50, 0x44, 0x46],
  };

  const expected = signatures[declaredType];
  if (!expected) return false;

  return expected.every((byte, i) => bytes[i] === byte);
}

export function validate<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: boolean; data?: T; errors?: string[] } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
  };
}
