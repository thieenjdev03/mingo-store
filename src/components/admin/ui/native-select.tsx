'use client';

import * as React from 'react';
import { SelectField, type SelectOption } from '@/components/ui/select';

type NativeSelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'multiple' | 'size' | 'value' | 'defaultValue'
> & {
  value?: string;
  defaultValue?: string;
  /** Co bề rộng vừa khít nhãn dài nhất (thanh filter), thay vì full width. */
  fitContent?: boolean;
};

/**
 * Adapter tương thích cho các form admin cũ.
 * UI thực tế dùng cùng Radix Select/option styling với storefront.
 */
export function NativeSelect({
  children,
  value,
  defaultValue,
  onChange,
  id,
  disabled,
  fitContent,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: NativeSelectProps) {
  const options = React.Children.toArray(children).flatMap<SelectOption>((child) => {
    if (!React.isValidElement<{ value?: string; disabled?: boolean; children?: React.ReactNode }>(child)) return [];
    return [{
      value: String(child.props.value ?? ''),
      label: child.props.children,
      disabled: child.props.disabled,
    }];
  });

  return (
    <SelectField
      id={id}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(nextValue) => {
        onChange?.({ target: { value: nextValue } } as React.ChangeEvent<HTMLSelectElement>);
      }}
      options={options}
      disabled={disabled}
      size="sm"
      fitContent={fitContent}
      className={className}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid === true || ariaInvalid === 'true'}
    />
  );
}
