// Mock data-access layer for the store locator.
// Swap point for the real backend: replace getStores() body with
// `fetch('/api/stores?province=...')` — the interface (Promise<Store[]>) stays put.

export type ProductLine = 'bars' | 'boxes' | 'cones';

export interface District {
  code: string;
  name: string;
  lat: number; // ward-center, used to place mock stores
  lng: number;
}

export interface Province {
  code: string;
  name: string;
  districts: District[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  province: string; // Province.code
  district: string; // District.code — filter by code, never by the accented name
  lat: number;
  lng: number;
  productLines: ProductLine[];
}

export interface StoreFilters {
  province?: string;
  district?: string;
  line?: ProductLine;
}

// 1 province, ~10 districts. Centers are approximate HCMC coordinates.
export const PROVINCES: Province[] = [
  {
    code: 'hcm',
    name: 'Hồ Chí Minh',
    districts: [
      { code: 'q1', name: 'Quận 1', lat: 10.7769, lng: 106.7009 },
      { code: 'q3', name: 'Quận 3', lat: 10.7756, lng: 106.6903 },
      { code: 'q4', name: 'Quận 4', lat: 10.7578, lng: 106.705 },
      { code: 'q5', name: 'Quận 5', lat: 10.754, lng: 106.6634 },
      { code: 'q7', name: 'Quận 7', lat: 10.734, lng: 106.7215 },
      { code: 'q8', name: 'Quận 8', lat: 10.724, lng: 106.6286 },
      { code: 'binh-thanh', name: 'Quận Bình Thạnh', lat: 10.8106, lng: 106.7091 },
      { code: 'go-vap', name: 'Quận Gò Vấp', lat: 10.8386, lng: 106.6656 },
      { code: 'tan-binh', name: 'Quận Tân Bình', lat: 10.8014, lng: 106.6527 },
      { code: 'thu-duc', name: 'Thành phố Thủ Đức', lat: 10.8494, lng: 106.7537 },
    ],
  },
];

export function getDistricts(provinceCode: string): District[] {
  return PROVINCES.find((p) => p.code === provinceCode)?.districts ?? [];
}

// Deterministic PRNG so the 200 stores are stable across server/client renders
// (no hydration mismatch) and reproducible without committing a 200-row file.
function seeded(n: number): number {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x); // [0,1)
}

const STREETS = ['Nguyễn Trãi', 'Lê Lợi', 'Trần Hưng Đạo', 'Cách Mạng Tháng 8', 'Hai Bà Trưng', 'Điện Biên Phủ', 'Nguyễn Thị Minh Khai', 'Võ Văn Kiệt'];
const BRANDS = ['Mingo Mart', 'G-Kitchen', 'Circle K', 'Bách Hóa Xanh', 'WinMart', 'FamilyMart', 'Co.op Food'];
const LINES: ProductLine[] = ['bars', 'boxes', 'cones'];

function buildStores(): Store[] {
  const stores: Store[] = [];
  for (const province of PROVINCES) {
    province.districts.forEach((district, di) => {
      for (let i = 0; i < 20; i++) {
        const s = di * 20 + i;
        const brand = BRANDS[s % BRANDS.length]!;
        const street = STREETS[Math.floor(seeded(s * 3) * STREETS.length)]!;
        const houseNo = 1 + Math.floor(seeded(s * 7) * 300);
        const lineCount = 1 + Math.floor(seeded(s * 11) * LINES.length);
        stores.push({
          id: `${district.code}-${i + 1}`,
          name: `${brand} ${district.name} #${i + 1}`,
          address: `${houseNo} ${street}, ${district.name}, ${province.name}`,
          province: province.code,
          district: district.code,
          lat: district.lat + (seeded(s * 13) - 0.5) * 0.02, // ±0.01
          lng: district.lng + (seeded(s * 17) - 0.5) * 0.02,
          productLines: LINES.slice(0, lineCount),
        });
      }
    });
  }
  return stores;
}

const ALL_STORES = buildStores();

export async function getStores(filters: StoreFilters = {}): Promise<Store[]> {
  return ALL_STORES.filter(
    (s) =>
      (!filters.province || s.province === filters.province) &&
      (!filters.district || s.district === filters.district) &&
      (!filters.line || s.productLines.includes(filters.line)),
  );
}
