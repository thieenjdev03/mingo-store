/** Data-layer admin cho Tuyển dụng (/careers). List cursor { items, nextCursor }. */
import {
  careersControllerFindAll,
  careersControllerCreate,
  careersControllerUpdate,
  careersControllerRemove,
  careersControllerFindApplications,
  careerApplicationsControllerFindAll,
  careerApplicationsControllerUpdate,
  careerApplicationsControllerRemove,
} from '@/lib/api/generated/careers/careers';
import type {
  CareersControllerFindAllParams,
  CareerApplicationsControllerFindAllParams,
  CareerApplicationDtoStatus,
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

export function deleteApplication(id: string) {
  return careerApplicationsControllerRemove(id);
}

/**
 * View-model (tier-2) cho một đơn ứng tuyển trong bảng admin. Ngoài các trường phẳng,
 * `career_title`/`career_slug` được nối từ object `career` lồng nhau mà backend trả về.
 */
export interface AdminApplication {
  id: string;
  career_id: string;
  full_name: string;
  email: string;
  phone: string;
  cover_letter: string | null;
  cv_url: string;
  status: CareerApplicationDtoStatus;
  created_at: string;
  career_title: string;
  career_slug: string;
}

/** Một trang kết quả đã chuẩn hoá (backend phân trang theo page/limit, không phải cursor). */
export interface AdminApplicationPage {
  items: AdminApplication[];
  total: number;
  page: number;
  limit: number;
}

export interface ListApplicationsParams {
  status?: CareerApplicationDtoStatus;
  career_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Response thô: chấp nhận cả hai hình dạng — hình dạng thực tế của backend
 * (`data`/`total`/`page`/`limit`, `career` lồng nhau) và hình dạng OpenAPI mô tả
 * (`items`/`nextCursor`, `career_title` phẳng) — để không vỡ nếu spec được đồng bộ lại.
 */
interface RawApplication {
  id: string;
  career_id: string;
  full_name: string;
  email: string;
  phone: string;
  cover_letter?: string | null;
  cv_url: string;
  status: CareerApplicationDtoStatus;
  created_at: string;
  career?: { id: string; title: string; slug: string } | null;
  career_title?: string;
  career_slug?: string;
}
interface RawApplicationsResponse {
  data?: RawApplication[];
  items?: RawApplication[];
  total?: number;
  page?: number;
  limit?: number;
}

function toApplicationView(raw: RawApplication): AdminApplication {
  return {
    id: raw.id,
    career_id: raw.career_id,
    full_name: raw.full_name,
    email: raw.email,
    phone: raw.phone,
    cover_letter: raw.cover_letter ?? null,
    cv_url: raw.cv_url,
    status: raw.status,
    created_at: raw.created_at,
    career_title: raw.career?.title ?? raw.career_title ?? '',
    career_slug: raw.career?.slug ?? raw.career_slug ?? '',
  };
}

/** Hộp thư ứng tuyển toàn hệ thống (mọi tin tuyển dụng). */
export function allApplicationsKey(params: ListApplicationsParams) {
  return ['/career-applications', params] as const;
}
export async function listAllApplications(params: ListApplicationsParams): Promise<AdminApplicationPage> {
  const raw = (await careerApplicationsControllerFindAll(
    params as CareerApplicationsControllerFindAllParams,
  )) as unknown as RawApplicationsResponse;
  const items = raw.data ?? raw.items ?? [];
  return {
    items: items.map(toApplicationView),
    total: raw.total ?? items.length,
    page: raw.page ?? params.page ?? 1,
    limit: raw.limit ?? params.limit ?? items.length,
  };
}
