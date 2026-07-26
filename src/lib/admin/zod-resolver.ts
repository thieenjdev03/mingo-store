import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * Resolver zod cho react-hook-form — cùng cách repo đang làm ở contact-form (không cần
 * @hookform/resolvers). Dùng chung cho mọi form admin.
 */
export function zodResolver<T extends FieldValues>(schema: ZodType<T>): Resolver<T> {
  return async (values) => {
    const parsed = schema.safeParse(values);
    if (parsed.success) return { values: parsed.data, errors: {} };

    const errors = parsed.error.issues.reduce<FieldErrors<T>>((result, issue) => {
      const field = issue.path[0] as keyof T | undefined;
      if (field && !(field in result)) {
        // @ts-expect-error index theo key động của form
        result[field] = { type: issue.code, message: issue.message };
      }
      return result;
    }, {} as FieldErrors<T>);

    return { values: {}, errors };
  };
}
