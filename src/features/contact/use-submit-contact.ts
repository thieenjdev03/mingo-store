'use client';

import { useState } from 'react';
import type { ContactFormValues } from './schema';

export function useSubmitContact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitContact = async (payload: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO(api): đổi sang POST /contact khi backend bổ sung endpoint; không gọi /marketing.
      await new Promise((resolve) => window.setTimeout(resolve, 800));
      console.info('[contact] mock payload', payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitContact };
}
