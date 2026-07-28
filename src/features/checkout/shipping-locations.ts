import { getWardsByProvince, type Province } from '@/lib/vn-address';

export interface ShippingAreaOption {
  id: string;
  name: string;
}

export const HO_CHI_MINH_PROVINCE_CODE = '79';

const HO_CHI_MINH_DISTRICTS: ShippingAreaOption[] = [
  { id: '760', name: 'Quận 1' },
  { id: '761', name: 'Quận 12' },
  { id: '762', name: 'Thành phố Thủ Đức' },
  { id: '763', name: 'Quận 9' },
  { id: '764', name: 'Quận Gò Vấp' },
  { id: '765', name: 'Quận Bình Thạnh' },
  { id: '766', name: 'Quận Tân Bình' },
  { id: '767', name: 'Quận Tân Phú' },
  { id: '768', name: 'Quận Phú Nhuận' },
  { id: '769', name: 'Quận 2' },
  { id: '770', name: 'Quận 3' },
  { id: '771', name: 'Quận 10' },
  { id: '772', name: 'Quận 11' },
  { id: '773', name: 'Quận 4' },
  { id: '774', name: 'Quận 5' },
  { id: '775', name: 'Quận 6' },
  { id: '776', name: 'Quận 8' },
  { id: '777', name: 'Quận Bình Tân' },
  { id: '778', name: 'Quận 7' },
  { id: '783', name: 'Huyện Củ Chi' },
  { id: '784', name: 'Huyện Hóc Môn' },
  { id: '785', name: 'Huyện Bình Chánh' },
  { id: '786', name: 'Huyện Nhà Bè' },
  { id: '787', name: 'Huyện Cần Giờ' },
];

/**
 * Backend Mingo vẫn phân vùng trực tiếp bằng mã quận/huyện legacy tại TP.HCM.
 * Với các tỉnh khác, dealer được chọn theo province_code nên mã phường/xã mới
 * được dùng làm district_code chi tiết nhất cho quote.
 */
export function getShippingAreas(province: Province | null): ShippingAreaOption[] {
  if (!province) return [];
  if (province.id === HO_CHI_MINH_PROVINCE_CODE) return HO_CHI_MINH_DISTRICTS;
  return getWardsByProvince(province.id);
}
