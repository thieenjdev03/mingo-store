/** Data-layer admin cho Nhà phân phối (/admin/distributors) — DTO đã document đầy đủ. */
import {
  distributorsControllerFindAll,
  distributorsControllerFindOne,
  distributorsControllerCreate,
  distributorsControllerUpdate,
  distributorsControllerRemove,
} from '@/lib/api/generated/distributors-admin/distributors-admin';
import type {
  DistributorsControllerFindAllParams,
  CreateDistributorDto,
  UpdateDistributorDto,
} from '@/lib/api/generated/ecomAPI.schemas';

export function distributorsKey(params: DistributorsControllerFindAllParams) {
  return ['/admin/distributors', params] as const;
}
export function listDistributors(params: DistributorsControllerFindAllParams) {
  return distributorsControllerFindAll(params);
}
export function getDistributor(id: string) {
  return distributorsControllerFindOne(id);
}
export function createDistributor(dto: CreateDistributorDto) {
  return distributorsControllerCreate(dto);
}
export function updateDistributor(id: string, dto: UpdateDistributorDto) {
  return distributorsControllerUpdate(id, dto);
}
export function deleteDistributor(id: string) {
  return distributorsControllerRemove(id);
}
