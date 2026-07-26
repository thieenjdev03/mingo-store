/**
 * Data-layer admin cho Policy — bọc client generated `/admin/policies` (policies-admin).
 * List trả mảng phẳng đã sắp theo display_order (không phân trang server-side).
 */
import {
  policiesControllerFindAll,
  policiesControllerFindOne,
  policiesControllerCreate,
  policiesControllerUpdate,
  policiesControllerRemove,
  getPoliciesControllerFindAllKey,
} from '@/lib/api/generated/policies-admin/policies-admin';
import type {
  PoliciesControllerFindAllParams,
  CreatePolicyDto,
  UpdatePolicyDto,
} from '@/lib/api/generated/ecomAPI.schemas';

export const policiesKey = getPoliciesControllerFindAllKey;

export function listPolicies(params?: PoliciesControllerFindAllParams) {
  return policiesControllerFindAll(params);
}
export function getPolicy(id: string) {
  return policiesControllerFindOne(id);
}
export function createPolicy(dto: CreatePolicyDto) {
  return policiesControllerCreate(dto);
}
export function updatePolicy(id: string, dto: UpdatePolicyDto) {
  return policiesControllerUpdate(id, dto);
}
export function deletePolicy(id: string) {
  return policiesControllerRemove(id);
}
