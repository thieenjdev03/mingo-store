import { customFetch } from '@/lib/api/fetcher';
import type { UpdateUserDto, UserResponseDto } from '@/lib/api/generated/ecomAPI.schemas';

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
