import type { UserResponseDto } from '@/lib/api/generated/ecomAPI.schemas';

/** TẦNG 2 — view model của tài khoản đăng nhập. Component chỉ nhận type này, không đụng User trực tiếp. */
export interface AccountView {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  country: string;
  profile: string;
  /** Tóm tắt địa chỉ mặc định (hoặc đầu tiên), nếu có. */
  addressSummary: string | null;
  initials: string;
}

interface AddressLike {
  streetLine1?: string;
  ward?: string;
  district?: string;
  province?: string;
  isDefault?: boolean;
}

export function toAccountView(user: UserResponseDto): AccountView {
  const firstName = user.firstName ?? '';
  const lastName = user.lastName ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || user.email;

  // Backend chưa có DTO gõ kiểu riêng cho address item — ưu tiên đúng địa chỉ mặc định.
  const addresses = (user.addresses as AddressLike[] | undefined) ?? [];
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const addressSummary = defaultAddress
    ? [defaultAddress.streetLine1, defaultAddress.ward, defaultAddress.district, defaultAddress.province]
        .filter(Boolean)
        .join(', ')
    : null;

  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join('') || user.email[0]?.toUpperCase() || '?';

  return {
    id: user.id,
    email: user.email,
    firstName,
    lastName,
    fullName,
    phoneNumber: user.phoneNumber ?? '',
    country: user.country ?? '',
    profile: user.profile ?? '',
    addressSummary,
    initials,
  };
}
