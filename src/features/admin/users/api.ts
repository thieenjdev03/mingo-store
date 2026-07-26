/** Data-layer admin cho Người dùng (/users). List phân trang UserListResponseDto. */
import {
  usersControllerFindAll,
  usersControllerCreate,
  usersControllerUpdate,
  usersControllerRemove,
} from '@/lib/api/generated/users/users';
import type {
  UsersControllerFindAllParams,
  CreateUserDto,
  UpdateUserDto,
} from '@/lib/api/generated/ecomAPI.schemas';

export function usersKey(params: UsersControllerFindAllParams) {
  return ['/users', params] as const;
}
export function listUsers(params: UsersControllerFindAllParams) {
  return usersControllerFindAll(params);
}
export function createUser(dto: CreateUserDto) {
  return usersControllerCreate(dto);
}
export function updateUser(id: string, dto: UpdateUserDto) {
  return usersControllerUpdate(id, dto);
}
export function deleteUser(id: string) {
  return usersControllerRemove(id);
}
