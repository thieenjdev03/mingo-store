/** Data-layer admin cho Tuyển dụng (/careers). List cursor { items, nextCursor }. */
import {
  careersControllerFindAll,
  careersControllerCreate,
  careersControllerUpdate,
  careersControllerRemove,
  careersControllerFindApplications,
  careerApplicationsControllerFindAll,
  careerApplicationsControllerUpdate,
} from '@/lib/api/generated/careers/careers';
import type {
  CareersControllerFindAllParams,
  CareerApplicationsControllerFindAllParams,
  CreateCareerDto,
  UpdateCareerDto,
  UpdateCareerApplicationDto,
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

export function applicationsKey(careerId: string) {
  return [`/careers/${careerId}/applications`] as const;
}
export function listApplications(careerId: string) {
  return careersControllerFindApplications(careerId);
}
export function updateApplicationStatus(id: string, dto: UpdateCareerApplicationDto) {
  return careerApplicationsControllerUpdate(id, dto);
}

/** Hộp thư ứng tuyển toàn hệ thống (mọi tin tuyển dụng). */
export function allApplicationsKey(params: CareerApplicationsControllerFindAllParams) {
  return ['/career-applications', params] as const;
}
export function listAllApplications(params: CareerApplicationsControllerFindAllParams) {
  return careerApplicationsControllerFindAll(params);
}
