import { customFetch } from '@/lib/api/fetcher';
import type { UserResponseDto } from '@/lib/api/generated/ecomAPI.schemas';

export interface UpdateMyProfilePayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
}

export function updateMyProfile(payload: UpdateMyProfilePayload): Promise<UserResponseDto> {
  return customFetch<UserResponseDto>({
    url: '/me',
    method: 'PATCH',
    data: payload,
  });
}
