import { customFetch } from '@/lib/api/fetcher';
import { authControllerCheckExists, authControllerSetPassword } from '@/lib/api/generated/auth/auth';
import type {
  CheckExistsDto,
  LoginResponseDto,
  SetPasswordDto,
  UpdateUserDto,
  UserResponseDto,
} from '@/lib/api/generated/ecomAPI.schemas';

/** Các field profile mà endpoint `/me` cho phép khách tự cập nhật. */
export interface UpdateMyProfilePayload extends Pick<UpdateUserDto,
  'email' | 'firstName' | 'lastName' | 'phoneNumber' | 'country' | 'profile'
> {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  profile: string;
}

export function updateMyProfile(payload: UpdateMyProfilePayload): Promise<UserResponseDto> {
  return customFetch<UserResponseDto>({
    url: '/me',
    method: 'PATCH',
    data: payload,
  });
}

export interface AccountExistsResult {
  exists: boolean;
  hasPassword: boolean;
}

/**
 * POST /auth/check-exists — backend's Swagger decorator has no response `type`,
 * so orval generates `void`; the real payload is `{ exists, hasPassword }`.
 */
export async function checkAccountExists(dto: CheckExistsDto): Promise<AccountExistsResult> {
  return (await authControllerCheckExists(dto)) as unknown as AccountExistsResult;
}

/** Claims a passwordless guest account (created from a guest checkout) by setting its first password. */
export function claimGuestAccount(dto: SetPasswordDto): Promise<LoginResponseDto> {
  return authControllerSetPassword(dto);
}
