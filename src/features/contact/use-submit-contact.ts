'use client';

import { useState } from 'react';
import { contactControllerSubmit } from '@/lib/api/generated/contact/contact';
import type { ContactFormValues } from './schema';

export function useSubmitContact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Ném lỗi ra ngoài để form không báo "gửi thành công" khi request hỏng. */
  const submitContact = async (payload: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      await contactControllerSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitContact };
}
