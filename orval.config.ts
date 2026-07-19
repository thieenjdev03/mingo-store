/**
 * Generate types + SWR hooks từ OpenAPI spec của backend NestJS.
 * Backend: npm run openapi:export -> docs/openapi.json (hoặc chạy backend rồi lấy /docs/json)
 * Storefront: npm run api:gen
 *
 * QUY TẮC: mọi type API đều nằm ở src/lib/api/generated — KHÔNG BAO GIỜ sửa tay,
 * không copy DTO từ repo cũ. Cần đổi shape -> sửa decorator Swagger phía backend rồi gen lại.
 */
export default {
  mingo: {
    input: '../ecom-website/docs/openapi.json',
    output: {
      target: 'src/lib/api/generated',
      mode: 'tags-split',
      client: 'swr',
      clean: true,
      override: {
        mutator: { path: 'src/lib/api/fetcher.ts', name: 'customFetch' },
      },
    },
  },
};
