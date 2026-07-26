/** Data-layer admin cho Tuyển dụng (/careers). List cursor { items, nextCursor }. */
import {
  careersControllerFindAll,
  careersControllerCreate,
  careersControllerUpdate,
  careersControllerRemove,
} from '@/lib/api/generated/careers/careers';
import type {
  CareersControllerFindAllParams,
  CreateCareerDto,
  UpdateCareerDto,
} from '@/lib/api/generated/ecomAPI.schemas';

export function careersKey(params: CareersControllerFindAllParams) {
  return ['/careers', params] as const;
}
export function listCareers(params: CareersControllerFindAllParams) {
  return careersControllerFindAll(params);
}
export function createCareer(dto: CreateCareerDto) {
  return careersControllerCreate(dto);
}
export function updateCareer(id: string, dto: UpdateCareerDto) {
  return careersControllerUpdate(id, dto);
}
export function deleteCareer(id: string) {
  return careersControllerRemove(id);
}
