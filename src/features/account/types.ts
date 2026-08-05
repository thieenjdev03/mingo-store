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
  /** Tóm tắt địa chỉ mặc định/đầu tiên, nếu có — backend trả `addresses` nhưng chưa có DTO gõ kiểu riêng. */
  addressSummary: string | null;
  initials: string;
}

interface AddressLike {
  streetLine1?: string;
  ward?: string;
  district?: string;
  province?: string;
}

export function toAccountView(user: UserResponseDto): AccountView {
  const firstName = user.firstName ?? '';
  const lastName = user.lastName ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || user.email;

  // Backend chưa có DTO gõ kiểu riêng cho address item — đọc mềm qua AddressLike.
  const firstAddress = (user.addresses as AddressLike[] | undefined)?.[0];
  const addressSummary = firstAddress
    ? [firstAddress.streetLine1, firstAddress.ward, firstAddress.district, firstAddress.province]
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
    addressSummary,
    initials,
  };
}
