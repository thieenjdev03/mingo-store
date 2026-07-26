import { ModulePlaceholder } from '@/components/admin/module-placeholder';

export default function Page() {
  return <ModulePlaceholder title="Màu sắc" note="Backend chưa khai báo OpenAPI cho /colors (DTO + response). Cần thêm Swagger decorator phía backend rồi chạy lại npm run api:gen." />;
}
