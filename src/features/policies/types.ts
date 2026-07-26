/**
 * TẦNG 2 — View model của feature policies.
 * Component chỉ nhận các type ở đây, KHÔNG nhận raw API type.
 * Policy title/content là string thuần (backend không đa ngôn ngữ ở field này).
 */
import type { PolicyDto, PolicyListItemDto } from '@/lib/api/generated/ecomAPI.schemas';

/** Mục trong sidebar "Chính sách và hỗ trợ". */
export interface PolicyNavItem {
  title: string;
  slug: string;
}

/** Nội dung một chính sách — content là HTML đã được backend sanitize. */
export interface PolicyDetailView {
  title: string;
  slug: string;
  contentHtml: string;
}

export function toPolicyNavItem(p: PolicyListItemDto): PolicyNavItem {
  return { title: p.title, slug: p.slug };
}

export function toPolicyDetailView(p: PolicyDto): PolicyDetailView {
  return { title: p.title, slug: p.slug, contentHtml: p.content };
}
