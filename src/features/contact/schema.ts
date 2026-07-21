import { z } from 'zod';

export interface ContactValidationMessages {
  required: string;
  email: string;
  phone: string;
  messageMin: string;
}

export const createContactFormSchema = (messages: ContactValidationMessages) =>
  z.object({
    fullName: z.string().trim().min(1, messages.required),
    email: z.string().trim().min(1, messages.required).email(messages.email),
    phone: z
      .string()
      .trim()
      .min(1, messages.required)
      .regex(/^(?:0\d{9,10}|\+84\d{9,10})$/, messages.phone),
    department: z.string().trim().min(1, messages.required),
    subject: z.string().trim().min(1, messages.required),
    message: z.string().trim().min(1, messages.required).min(10, messages.messageMin),
  });

export type ContactFormValues = z.infer<ReturnType<typeof createContactFormSchema>>;
