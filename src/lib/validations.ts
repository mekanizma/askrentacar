import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const searchSchema = z.object({
  pickupLocationId: z.string().min(1),
  dropoffLocationId: z.string().min(1),
  pickupAt: z.string().min(1),
  returnAt: z.string().min(1),
  pickupTime: z.string().min(1),
  returnTime: z.string().min(1),
  categorySlug: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
});

export const bookingCustomerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  notes: z.string().optional(),
  licenseFrontUrl: z.string().min(1, "Ehliyet ön yüzü gerekli"),
  licenseBackUrl: z.string().min(1, "Ehliyet arka yüzü gerekli"),
  licenseFrontName: z.string().optional(),
  licenseBackName: z.string().optional(),
});

export const paymentSchema = z.object({
  method: z.enum(["card", "cash", "transfer"]),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiry: z.string().optional(),
  cvc: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
