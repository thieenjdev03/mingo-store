import { ModulePlaceholder } from '@/components/admin/module-placeholder';

export default function Page() {
  return <ModulePlaceholder title="Kích cỡ" note="Backend chưa khai báo OpenAPI cho /sizes (DTO + response). Cần thêm Swagger decorator phía backend rồi chạy lại npm run api:gen." />;
}
