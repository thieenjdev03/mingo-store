# Mingo Store — Hướng dẫn sử dụng & Biên bản bàn giao

| | |
|---|---|
| **Phiên bản tài liệu** | 08/09/2026 |
| **Đối tượng** | Quản trị viên và nhân viên vận hành phía khách hàng |
| **Phạm vi** | Toàn bộ chức năng đang chạy trên storefront và trang Admin |
| **Cách đọc** | **Phần A** — tour nhanh cho người mới · **Phần B** — chi tiết từng module · **Phần C** — checklist, giới hạn và điểm cần biết khi tiếp nhận |

---

# PHẦN A — TOUR NHANH CHO NGƯỜI MỚI

## A.1 Hệ thống gồm hai khu vực

| Khu vực | Ai dùng | Đường dẫn |
|---|---|---|
| **Storefront** | Khách hàng cuối | `https://kemmingo.com` |
| **Admin** | Nhân viên vận hành | `https://kemmingo.com/admin` |

Storefront song ngữ:

- Tiếng Việt: URL **không** có prefix — `/products`, `/about`…
- English: URL có prefix `/en` — `/en/products`, `/en/about`…

Admin chỉ có tiếng Việt và **không** dùng prefix ngôn ngữ.

## A.2 Tour 8 bước — làm một vòng để hiểu hệ thống

Làm lần lượt 8 bước dưới đây trên môi trường thật (hoặc dữ liệu thử) là đủ để
nắm toàn bộ luồng vận hành.

**Bước 1 — Đăng nhập Admin.**
Mở `/admin/login`, đăng nhập bằng tài khoản có vai trò **Quản trị**. Sau khi vào,
`/admin` là **Bảng điều khiển**: một lưới lối tắt tới tất cả module. Menu trái là
nơi điều hướng chính, chia 5 nhóm: Tổng quan / Sản phẩm / Vận hành / Nội dung /
Hệ thống.

**Bước 2 — Dựng dữ liệu nền trước khi tạo sản phẩm.**
Thứ tự bắt buộc để không phải sửa lại:

```text
Danh mục  →  Thương hiệu  →  Quy cách  →  Sản phẩm  →  Bộ sưu tập
```

Lý do: sản phẩm cần chọn danh mục/thương hiệu; biến thể sản phẩm cần quy cách
có sẵn; bộ sưu tập cần có sản phẩm để gán.

**Bước 3 — Tạo một sản phẩm hoàn chỉnh.**
`/admin/products` → **Thêm**. Nhập nội dung tiếng Việt, chuyển tab **English**
dịch lại, tải ảnh, chọn danh mục/thương hiệu, nhập giá + tồn + SKU, thêm biến
thể nếu có, chọn trạng thái **Đăng bán**, bấm **Lưu**. Mở
`/products/<slug>` trên storefront để đối chiếu.

**Bước 4 — Đưa sản phẩm lên trang chủ.**
`/admin/collections` → tạo bộ sưu tập → bật **Hiển thị trên trang chủ** + **Kích
hoạt** → bấm icon **Sản phẩm** để gán sản phẩm vào. Mở `/` kiểm tra khối mới
xuất hiện.

**Bước 5 — Đặt thử một đơn hàng.**
Trên storefront: thêm sản phẩm vào giỏ → `/cart` → **Thanh toán** → nhập địa chỉ
→ **Kiểm tra khu vực và phí giao hàng** → chọn **COD** hoặc **Chuyển khoản
VietQR** → đặt hàng. Ghi lại **mã đơn** hiện ra.

**Bước 6 — Xử lý đơn vừa tạo.**
`/admin/orders` → tìm theo mã đơn → mở chi tiết → chuyển trạng thái theo đúng
bước kế tiếp → lưu mã vận đơn. Đây là màn hình dùng nhiều nhất hằng ngày.

**Bước 7 — Cập nhật nội dung.**
Thử mỗi module một lần: `/admin/homepage-banners` (banner trang chủ),
`/admin/policies` (chính sách), `/admin/distributors` (điểm bán + bản đồ),
`/admin/careers` (tin tuyển dụng), `/admin/settings` (link PDF hồ sơ hợp tác).

**Bước 8 — Kiểm tra dấu vết.**
`/admin/audit-logs` sẽ liệt kê đúng những thao tác vừa làm ở bước 2–7, kèm giá
trị cũ/mới và người thực hiện. Đây là công cụ truy vết khi có sự cố dữ liệu.

## A.3 Ba luồng nghiệp vụ chính

```text
LUỒNG BÁN HÀNG
Khách xem sản phẩm → thêm giỏ → checkout → chọn COD/VietQR → đơn được tạo
   → Admin xác nhận thanh toán → đóng gói → vận chuyển → giao thành công

LUỒNG NỘI DUNG
Admin tạo/sửa dữ liệu (sản phẩm, banner, chính sách, điểm bán, tuyển dụng)
   → bật trạng thái hiển thị → kiểm tra lại trên storefront

LUỒNG TUYỂN DỤNG
Admin đăng tin (/admin/careers) → khách nộp hồ sơ (/careers/<slug>)
   → hồ sơ về /admin/career-applications → cập nhật trạng thái hồ sơ
```

## A.4 Ba quy tắc an toàn phải nhớ

1. **Ưu tiên ẩn, hạn chế xóa.** Hầu hết module có trạng thái *Ẩn / Nháp / Đã
   đóng*. Xóa dữ liệu đang được tham chiếu (thương hiệu đang gán sản phẩm, quy
   cách đang dùng trong biến thể) sẽ làm hỏng liên kết.
2. **Trạng thái thanh toán ≠ trạng thái đơn.** Không đánh dấu đơn đã thanh toán
   chỉ dựa vào ảnh chụp màn hình của khách. VietQR **không có webhook ngân
   hàng**, mọi xác nhận đều là thủ công.
3. **Không đổi slug sau khi đã công bố.** Slug là đường dẫn công khai; đổi slug
   làm chết link cũ đã chia sẻ và các liên kết nội bộ trỏ tới nó.

---

# PHẦN B — CHI TIẾT CHỨC NĂNG

## 1. Phạm vi bàn giao

Khách hàng sở hữu dịch vụ và thực hiện vận hành hằng ngày qua trang Admin.
Source code, hạ tầng, bảo trì kỹ thuật và thay đổi hệ thống do bên cung cấp
kiểm soát.

Tài liệu này hướng dẫn:

- quản lý nội dung và dữ liệu trên Admin;
- theo dõi và xử lý đơn hàng;
- các chức năng khách hàng dùng được trên storefront;
- kết quả của mỗi thao tác trên giao diện;
- các giới hạn và phụ thuộc cấu hình cần biết khi vận hành.

Không bao gồm hướng dẫn về source code, database, API, máy chủ hay quy trình
deploy.

## 2. Đường dẫn truy cập

| Khu vực | Đường dẫn |
|---|---|
| Storefront | `https://kemmingo.com` |
| Admin | `/admin` |
| Đăng nhập Admin | `/admin/login` |
| Đăng nhập khách hàng | `/login` |
| Đăng ký khách hàng | `/register` |
| Quên mật khẩu | `/forgot-password` |
| Tra cứu đơn (khách vãng lai) | `/orders/track/<mã đơn>#token=<mã tra cứu>` |

## 3. Vai trò sử dụng

| Vai trò | Quyền sử dụng |
|---|---|
| Khách truy cập (chưa đăng nhập) | Xem sản phẩm, thương hiệu, điểm bán, chính sách, tuyển dụng; dùng giỏ hàng; **đặt hàng không cần đăng nhập**; gửi hồ sơ ứng tuyển; gửi form liên hệ |
| Khách hàng đăng nhập | Toàn bộ quyền trên, cộng thêm: hồ sơ cá nhân, lịch sử đơn hàng, điểm thưởng, địa chỉ giao hàng đã lưu |
| Quản trị viên | Toàn bộ module Admin |

Chỉ tài khoản vai trò **Quản trị** mới vào được `/admin`.

## 4. Bản đồ chức năng

### 4.1 Storefront

| Trang | URL | Ghi chú |
|---|---|---|
| Trang chủ | `/` | Banner + thương hiệu + các khối bộ sưu tập |
| Dòng sản phẩm | `/products` | Kèm tìm kiếm qua `?q=` |
| Trang danh mục | `/categories/<slug>` | |
| Thương hiệu | `/brands`, `/brands/<slug>` | |
| Chi tiết sản phẩm | `/products/<slug>` | |
| Bộ sưu tập | `/collections`, `/collections/<slug>` | |
| Giỏ hàng | `/cart` | |
| Thanh toán | `/checkout` | |
| Tài khoản | `/account` | Cần đăng nhập |
| Đơn hàng của tôi | `/orders`, `/orders/<mã đơn>` | Cần đăng nhập |
| Tra cứu đơn khách vãng lai | `/orders/track/<mã đơn>` | Cần mã tra cứu trong link |
| Về Mingo + Hệ thống phân phối | `/about`, `/about#distribution` | |
| Điểm bán | `/stores` | **Tự chuyển hướng** về `/about#distribution` |
| Hợp tác | `/partnership` | |
| Liên hệ | `/contact` | |
| Chính sách | `/policies` | |
| Tuyển dụng | `/careers`, `/careers/<slug>` | |
| Câu hỏi thường gặp | `/faqs` | **Chưa có trong menu**, chỉ vào bằng URL trực tiếp |

**Menu chính (header):** Dòng sản phẩm · Thương hiệu · Hợp tác · Về Mingo, kèm
ô tìm kiếm, giỏ hàng, tài khoản và nút chuyển VI/EN.
**Menu chân trang (footer):** Về Mingo · Liên hệ · Chính sách · Tuyển dụng, kèm
liên kết Facebook / Instagram / TikTok.

### 4.2 Admin

| Nhóm | Module | URL |
|---|---|---|
| Tổng quan | Bảng điều khiển | `/admin` |
| Sản phẩm | Sản phẩm | `/admin/products` |
| Sản phẩm | Thương hiệu | `/admin/brands` |
| Sản phẩm | Danh mục | `/admin/categories` |
| Sản phẩm | Bộ sưu tập | `/admin/collections` |
| Sản phẩm | Quy cách | `/admin/sizes` |
| Vận hành | Đơn hàng | `/admin/orders` |
| Vận hành | Nhà phân phối | `/admin/distributors` |
| Vận hành | Tuyển dụng | `/admin/careers` |
| Vận hành | Đơn ứng tuyển | `/admin/career-applications` |
| Nội dung | Banner trang chủ | `/admin/homepage-banners` |
| Nội dung | Chính sách | `/admin/policies` |
| Nội dung | Liên kết hợp tác | `/admin/settings` |
| Hệ thống | Người dùng | `/admin/users` |
| Hệ thống | Nhật ký hệ thống | `/admin/audit-logs` |

Module **Màu sắc** (`/admin/colors`) tồn tại trong hệ thống nhưng **không nằm
trong menu** và không dùng cho vận hành.

## 5. Quy tắc thao tác chung trên Admin

- **Thêm**: mở form tạo dữ liệu mới.
- **Sửa**: icon bút chì ở dòng tương ứng.
- **Xóa**: icon thùng rác, có bước xác nhận.
- **Tìm kiếm**: ô tìm kiếm riêng của từng module.
- **Lọc**: theo trạng thái hoặc nhóm dữ liệu của module đó.
- **Phân trang**: điều hướng ở cuối bảng.
- **Lưu**: chờ thông báo (toast) thành công rồi mới đóng form hoặc chuyển màn.

Không bấm **Lưu** nhiều lần khi nút đang ở trạng thái *Đang lưu…*.

Khi phân vân giữa xóa và ẩn: chọn **Ẩn / Nháp / Đã đóng** nếu module hỗ trợ.

## 6. Quản lý sản phẩm — `/admin/products`

### 6.1 Danh sách

Cho phép: tìm theo tên; lọc theo trạng thái, danh mục, thương hiệu; xem giá,
tồn kho, danh mục, thương hiệu, trạng thái; sửa; xóa.

### 6.2 Trạng thái sản phẩm

| Trạng thái | Ý nghĩa |
|---|---|
| Đăng bán | Hiển thị công khai và mua được nếu còn hàng |
| Nháp | Chưa công bố |
| Ẩn | Tạm ngừng hiển thị |

Sản phẩm chỉ mua được khi **Đăng bán** và còn tồn kho. Với sản phẩm nhiều biến
thể, chỉ cần một biến thể còn hàng là sản phẩm vẫn hiển thị; biến thể hết hàng
vẫn hiện nhưng không chọn được.

### 6.3 Cấu trúc form sản phẩm

| Nhóm | Trường |
|---|---|
| Nội dung tiếng Việt | Tên, slug, mô tả, thành phần & chất gây dị ứng, hướng dẫn sử dụng, chú ý |
| Nội dung English | Product name, slug, description, ingredients & allergen information, usage instructions, notes |
| Catalog | Danh mục, thương hiệu |
| Bán hàng | Giá, giá khuyến mãi, tồn kho, SKU |
| Hiển thị | Trạng thái, `LH Báo Giá`, nhãn giảm giá |
| Hình ảnh | Ảnh sản phẩm (tối đa 5) |
| Quy cách | Danh sách biến thể |

Quy trình đề xuất:

1. Nhập nội dung tiếng Việt.
2. Mở tab **English**, thay bằng bản dịch thật.
3. Tải ảnh.
4. Chọn danh mục và thương hiệu.
5. Nhập giá, tồn kho, SKU.
6. Chọn trạng thái.
7. Bật tùy chọn hiển thị nếu cần.
8. Thêm biến thể nếu sản phẩm nhiều quy cách.
9. Dùng khối **Bản xem trước** ở đầu form để đối chiếu.
10. **Lưu**.

### 6.4 Nội dung song ngữ

Tên tiếng Việt là thông tin gốc. Tên English có thể được điền sẵn theo tiếng
Việt nhưng **phải** thay bằng bản dịch trước khi công bố.

Các trường nội dung dài hỗ trợ HTML cơ bản (đoạn văn, in đậm, danh sách). Không
chèn `<script>` hay nội dung nhúng ngoài yêu cầu — hệ thống sẽ loại bỏ thẻ
`<iframe>` trong nội dung sản phẩm.

### 6.5 Giá, tồn kho và SKU

- Nhập giá bằng số thuần, không dấu chấm/phẩy. Ví dụ: `120000`.
- **Giá** = giá bán thông thường; **Giá KM** = giá khuyến mãi.
- **Tồn kho** = số lượng bán được; **SKU** = mã quản lý.
- Có biến thể → quản lý giá và tồn ở từng biến thể; giá gốc ở cấp sản phẩm trở
  thành tùy chọn và tổng tồn được tính từ các biến thể.

### 6.6 `LH Báo Giá`

Bật khi sản phẩm không công bố giá. Storefront sẽ **ẩn giá** và hiển thị “Liên
hệ để nhận báo giá” thay cho nút mua.

Khi bật, giá và tồn kho **không bắt buộc** nhập (kể cả ở biến thể). Không bật
nếu khách cần mua trực tiếp trên web.

### 6.7 Biến thể theo quy cách

Mỗi biến thể gồm: tên biến thể, quy cách, SKU, giá, tồn kho, ảnh riêng (tùy chọn).

Trên storefront khách chọn quy cách → chọn số lượng → thêm vào giỏ.

Tạo quy cách ở `/admin/sizes` **trước** khi thêm biến thể.

### 6.8 Hình ảnh

- Tối đa **5 ảnh** / sản phẩm; vượt quá sẽ báo “Tối đa 5 ảnh”.
- Mỗi ảnh tối đa **5 MB**; định dạng ảnh phổ biến (PNG, JPG/JPEG, WebP).
- Ảnh **đầu tiên** là ảnh đại diện.
- Nên dùng ảnh cùng tỷ lệ và nén trước khi tải lên.

## 7. Quản lý thương hiệu — `/admin/brands`

Chức năng: tạo, sửa, xóa; tìm theo tên/slug/mô tả; lọc **Đang hiển thị** /
**Đang ẩn**; sắp thứ tự hiển thị.

| Trường | Cách dùng |
|---|---|
| Tên thương hiệu | Tên hiển thị trên storefront |
| Slug | Đường dẫn; bỏ trống để tự sinh |
| Logo | Logo thương hiệu |
| Mô tả | Mô tả ngắn |
| Thứ tự hiển thị | Số nhỏ hiện trước |
| Trạng thái | Đang hiển thị / Đang ẩn |

Thương hiệu đang gán cho sản phẩm: chuyển **Đang ẩn** thay vì xóa.

## 8. Quản lý danh mục — `/admin/categories`

Trường: tên, slug, mô tả, ảnh, danh mục cha (khi tạo mới), thứ tự hiển thị,
trạng thái kích hoạt. Hỗ trợ cấu trúc cha/con.

Danh mục được dùng để: nhóm sản phẩm; dựng menu Dòng sản phẩm; tạo trang
`/categories/<slug>`; lọc sản phẩm; **giới hạn phạm vi áp dụng của quy cách**;
**lọc điểm bán** trong phần Hệ thống phân phối.

Không đổi slug sau khi công bố.

## 9. Quản lý bộ sưu tập — `/admin/collections`

| Trường | Cách dùng |
|---|---|
| Tên | Tên bộ sưu tập |
| Slug | Đường dẫn; bỏ trống để tự sinh |
| Mô tả | Nội dung giới thiệu |
| Hiển thị trên trang chủ | Bật để tạo một khối sản phẩm ở trang chủ |
| Kích hoạt | Bật để công bố |

**Gán sản phẩm:** tại dòng bộ sưu tập → icon **Sản phẩm** → tìm → thêm; gỡ khi
cần.

Khối bộ sưu tập chỉ xuất hiện trên trang chủ khi hội đủ **cả ba**: đang kích
hoạt + bật hiển thị trang chủ + có ít nhất một sản phẩm đang hiển thị.

Trên trang chủ, các khối bộ sưu tập nằm sau banner và khối thương hiệu.

## 10. Quản lý quy cách — `/admin/sizes`

Quy cách là nhãn đóng gói/kích cỡ dùng cho biến thể: `Cây 65gr`, `Hộp 250ml`,
`24 cây / thùng`…

| Trường | Cách dùng |
|---|---|
| Nhãn quy cách | Hiển thị nguyên văn trên sản phẩm |
| Phạm vi danh mục | Chọn nhiều danh mục; **để trống = dùng chung toàn hệ thống** |

Thứ tự: tạo danh mục → tạo quy cách → gán phạm vi → thêm biến thể trong sản
phẩm. Không xóa quy cách đang được biến thể sử dụng.

## 11. Banner trang chủ — `/admin/homepage-banners`

| Trường | Cách dùng |
|---|---|
| Ảnh banner | Bắt buộc; cũng là ảnh dự phòng cho video |
| Video nền | Tùy chọn; MP4, tự phát, tắt tiếng, lặp lại |
| Alt text | Mô tả ảnh cho SEO/accessibility |
| Link khi click | Đường dẫn nội bộ (`/products`) hoặc URL đầy đủ |
| Thứ tự hiển thị | Số nhỏ hiện trước |
| Hiển thị trên trang chủ | Bật/tắt banner |

Trang chủ **luôn có sẵn một banner campaign mặc định của Mingo** ở slide đầu.
Banner do Admin tạo nối tiếp phía sau theo thứ tự đã đặt.

Sau khi lưu, kiểm tra: banner xuất hiện đúng; link click đúng; ảnh đẹp trên cả
desktop và mobile; video có ảnh poster dự phòng phù hợp.

## 12. Chính sách — `/admin/policies` → hiển thị tại `/policies`

Trường: tiêu đề, slug, nội dung, thứ tự hiển thị, trạng thái kích hoạt. Nội
dung hỗ trợ HTML cơ bản. Chỉ hiển thị công khai khi **Kích hoạt**.

Sau khi cập nhật: lưu → mở `/policies` → chọn chính sách → kiểm tra nội dung và
thứ tự.

Chính sách được liên kết trong luồng thanh toán (khách phải tick đồng ý) — kiểm
tra lại các liên kết trước khi đổi slug.

## 13. Nhà phân phối / điểm bán — `/admin/distributors`

Hiển thị ở phần **Hệ thống phân phối** trong `/about` (và `/stores` tự chuyển
hướng về đây).

### 13.1 Trường dữ liệu

| Trường | Cách dùng |
|---|---|
| Tên | Tên điểm bán / nhà phân phối |
| Địa chỉ | Địa chỉ hiển thị |
| Tỉnh / Thành | Chọn từ danh sách |
| Phường / Xã | Chọn sau khi đã chọn Tỉnh/Thành |
| Khu vực | Thông tin bổ sung, tùy chọn |
| Mô tả | Nội dung giới thiệu, tùy chọn |
| Mã nhúng Google Maps | Thẻ `<iframe>` hoặc URL embed |
| Danh mục | Dòng sản phẩm có tại điểm bán |
| Bộ sưu tập | Bộ sưu tập liên quan, tùy chọn |
| Đang hoạt động | Bật để hiển thị công khai |

### 13.2 Cách lấy mã nhúng Google Maps

1. Mở địa điểm trên Google Maps.
2. **Chia sẻ** → **Nhúng bản đồ**.
3. Sao chép thẻ `<iframe>` (hoặc chỉ URL bên trong `src`).
4. Dán vào trường **Mã nhúng Google Maps**.

> **Chỉ chấp nhận link dạng `https://www.google.com/maps/embed…`.** Link chia sẻ
> thông thường (`goo.gl/maps/…`, `google.com/maps/place/…`) sẽ bị từ chối và bản
> đồ không hiển thị. Phải lấy từ đúng tab **Nhúng bản đồ**.

### 13.3 Khách tìm điểm bán

Bộ lọc hoạt động: **dòng sản phẩm/danh mục**, **tỉnh/thành**, **phường/xã**.
Danh sách tự tải lại ngay khi đổi bộ lọc.

Bản đồ bên phải hiển thị theo điểm bán đang được chọn trong danh sách.

## 14. Tuyển dụng — `/admin/careers` → hiển thị tại `/careers`

### 14.1 Trạng thái tin

| Trạng thái | Ý nghĩa |
|---|---|
| Nháp | Chưa hiển thị công khai |
| Đã đăng | Hiển thị và nhận hồ sơ |
| Đã đóng | Ngừng nhận hồ sơ |

### 14.2 Trường dữ liệu

Tiêu đề · Slug (bỏ trống để tự sinh) · Bộ phận · Địa điểm · Cấp bậc · Nội dung
(mô tả công việc, yêu cầu, quyền lợi) · Ảnh bìa · Trạng thái · Ghim (tin nổi bật).

Nên lưu **Nháp** trước, kiểm tra nội dung, rồi mới chuyển **Đã đăng**.

### 14.3 Form ứng tuyển của khách

Họ và chữ lót · Tên · Email · Số điện thoại · Thư giới thiệu (tùy chọn) · **CV
(bắt buộc)** · Link portfolio/mạng xã hội (tùy chọn) · Tick đồng ý chính sách
bảo mật (bắt buộc mới bấm gửi được).

CV: `.pdf`, `.doc`, `.docx`, tối đa **5 MB**.

## 15. Đơn ứng tuyển — `/admin/career-applications`

Chức năng: tìm theo tên/email; lọc theo trạng thái; lọc theo tin tuyển dụng;
xem chi tiết hồ sơ; mở CV; đổi trạng thái ngay trên danh sách.

| Trạng thái | Ý nghĩa |
|---|---|
| Mới | Hồ sơ vừa nhận |
| Đang xem xét | Đang đánh giá |
| Đã tuyển | Đã chọn ứng viên |
| Từ chối | Không tiếp tục |

Quy trình đề xuất: **Mới → Đang xem xét → Đã tuyển / Từ chối**.

## 16. Đơn hàng — `/admin/orders`

Đây là module dùng nhiều nhất. Đọc kỹ phần này.

### 16.1 Danh sách và thống kê

Tìm theo mã đơn / tên / số điện thoại người nhận. Lọc theo trạng thái đơn,
trạng thái thanh toán và khoảng thời gian. Phía trên hiển thị: số đơn khớp bộ
lọc, số đơn chờ thanh toán, doanh thu đã thu trong khoảng thời gian đang lọc.

### 16.2 Trạng thái thanh toán

| Trạng thái | Ý nghĩa |
|---|---|
| Chờ xử lý | Chưa có xác nhận thanh toán |
| Chờ duyệt thủ công | Khách báo đã chuyển khoản, chờ đội ngũ đối chiếu sao kê |
| Thanh toán thành công | Đã xác nhận nhận được tiền |
| Thanh toán thất bại | Không thành công |

> **Quan trọng:** trạng thái thanh toán và trạng thái đơn hàng là hai thông tin
> **độc lập**. Hệ thống VietQR **không** nhận thông báo tự động từ ngân hàng —
> mọi xác nhận đều do người vận hành đối chiếu sao kê rồi bấm tay. Không xác
> nhận chỉ dựa trên ảnh chụp màn hình khách gửi.

### 16.3 Trạng thái đơn hàng và luồng chuyển

Luồng chính:

```text
Chờ thanh toán  →  Đã thanh toán / xác nhận  →  Đã đóng gói & sẵn sàng
      →  Đang vận chuyển  →  Giao thành công
```

Bảng chuyển trạng thái hợp lệ (hệ thống chỉ cho chọn các bước trong cột phải):

| Trạng thái hiện tại | Được chuyển sang |
|---|---|
| Chờ thanh toán | Đã thanh toán / xác nhận · Đã hủy |
| Đã thanh toán / xác nhận | Đã đóng gói & sẵn sàng · Đã hủy |
| Đã đóng gói & sẵn sàng | Đang vận chuyển |
| Đang vận chuyển | Giao thành công · Chuyển hoàn |
| Chuyển hoàn | Kho QC / kiểm tra · Đã hoàn tiền |
| Kho QC / kiểm tra | Đã đóng gói & sẵn sàng |
| Đã hủy | Đã hoàn tiền |
| Giao thành công / Đã hoàn tiền | (kết thúc) |

Một số nhãn trạng thái cũ (*Đã đóng gói (trạng thái cũ)*, *Đã xác nhận (trạng
thái cũ)*, *Tại kho vận chuyển*, *Đang giao đến bạn*…) chỉ còn để đọc lịch sử
đơn cũ, không phải lựa chọn trong luồng mới.

Không chuyển trạng thái để nhảy qua một bước nghiệp vụ chưa thực sự hoàn tất.

### 16.4 Chi tiết đơn hàng

Gồm: mã đơn và ngày tạo · thông tin người nhận và địa chỉ · ghi chú của khách ·
tài khoản đặt hàng (nếu có) · phương thức và trạng thái thanh toán · danh sách
sản phẩm/biến thể/số lượng/đơn giá · tạm tính, giảm giá, phí vận chuyển, tổng
tiền · lịch sử trạng thái · mã vận đơn và đơn vị vận chuyển · ghi chú nội bộ.

### 16.5 Cập nhật đơn

1. Mở chi tiết đơn.
2. Chọn trạng thái kế tiếp.
3. Nhập ghi chú nếu cần.
4. Bấm **Áp dụng**.
5. Đối chiếu lại lịch sử trạng thái.

Mã vận đơn, đơn vị vận chuyển và ghi chú nội bộ lưu bằng nút **Lưu thông tin**
riêng — nhớ bấm cả hai nếu vừa đổi trạng thái vừa nhập vận đơn.

### 16.6 Cảnh báo tồn kho

Đơn chờ thanh toán có thể hiện cảnh báo **chưa giữ tồn kho**. Khi gặp:

1. kiểm tra tồn kho thực tế;
2. chưa cam kết hàng với khách khi chưa xác nhận thanh toán;
3. xử lý thanh toán hoặc liên hệ khách sớm;
4. **không** đổi trạng thái chỉ để cảnh báo biến mất.

## 17. Người dùng — `/admin/users`

Chức năng: tìm theo email; lọc theo vai trò; tạo; sửa; đổi mật khẩu; đổi vai
trò; xóa.

| Trường | Ghi chú |
|---|---|
| Email | Tùy chọn |
| Số điện thoại | Bắt buộc |
| Mật khẩu | Bắt buộc khi tạo; khi sửa là "Mật khẩu mới", để trống nếu không đổi |
| Vai trò | **Khách hàng** hoặc **Quản trị** |
| Ghi chú hồ sơ | Tùy chọn |

Chỉ cấp **Quản trị** cho người thực sự cần quyền vận hành. Không xóa tài khoản
còn gắn với lịch sử đơn hàng cần lưu.

## 18. Nhật ký hệ thống — `/admin/audit-logs`

Ghi lại các thao tác **Tạo mới / Cập nhật / Xóa** trên các module quản trị.

Lọc theo: từ ngày – đến ngày · module · loại thao tác · người thực hiện · đối
tượng hoặc ID đối tượng.

Mở chi tiết một dòng để xem **giá trị cũ**, **giá trị mới** và thông tin
request. Đây là công cụ chính để truy vết khi dữ liệu bị thay đổi ngoài ý muốn.

## 19. Liên kết hợp tác — `/admin/settings`

Module lưu **link ngoài** do khách hàng cung cấp. Chỉ lưu link, **không upload
file**.

| Trường | Tác dụng |
|---|---|
| Link PDF hồ sơ hợp tác | Nút **“Liên hệ đội ngũ”** ở trang `/partnership` sẽ mở link này |

Để trống → nút quay về trang `/contact`. Chỉ nhận link `http`/`https`. Sau khi
dán link, dùng icon mở link bên cạnh ô nhập để kiểm tra trước khi lưu.

## 20. Chức năng trên storefront

### 20.1 Trang chủ

Banner campaign mặc định → banner do Admin quản lý → khối thương hiệu → các
khối bộ sưu tập được bật hiển thị trang chủ.

### 20.2 Duyệt và tìm sản phẩm

Mở **Dòng sản phẩm** để xem catalog; lọc theo danh mục từ menu hoặc trang danh
mục; mở **Thương hiệu**; tìm sản phẩm bằng icon kính lúp (dẫn tới
`/products?q=…`).

### 20.3 Chi tiết sản phẩm

Hiển thị: ảnh · tên và thương hiệu · danh mục và bộ sưu tập · giá **hoặc** nhãn
“Liên hệ để nhận báo giá” · biến thể/quy cách · mô tả · thành phần & chất gây
dị ứng · hướng dẫn sử dụng · chú ý · mã vạch (nếu có) · sản phẩm gợi ý.

Sản phẩm nhiều biến thể: chọn biến thể → chọn số lượng → thêm vào giỏ.

### 20.4 Giỏ hàng — `/cart`

Tăng/giảm số lượng · xóa một sản phẩm · xóa toàn bộ giỏ · xem tạm tính · tiếp
tục mua sắm · chuyển sang thanh toán.

Giá và tồn kho được kiểm tra lại khi cập nhật giỏ và khi thanh toán. Nếu dữ
liệu đã đổi, giỏ hiện cảnh báo và tạm khóa nút thanh toán.

### 20.5 Đăng ký, đăng nhập, quên mật khẩu

**Đăng ký** (`/register`) cần: tên và họ · email · số điện thoại · mật khẩu tối
thiểu **8 ký tự** · nhập lại mật khẩu. Sau khi gửi form, hệ thống gửi **mã OTP
qua email**; nhập OTP để hoàn tất. Nút gửi lại mã có thời gian chờ **60 giây**.

**Đăng nhập** (`/login`): email + mật khẩu.

**Quên mật khẩu** (`/forgot-password`): nhập email → nhận OTP → nhập OTP kèm
mật khẩu mới → quay lại đăng nhập.

### 20.6 Tài khoản — `/account`

Xem và sửa thông tin cá nhân (tên, email, số điện thoại, quốc gia, giới thiệu) ·
lưu địa chỉ giao hàng mặc định · xem đơn hàng gần đây và mở lịch sử đầy đủ ·
xem điểm thưởng · đăng xuất.

### 20.7 Điểm thưởng

Hiển thị số điểm hiện có, tiến độ tới mốc nhận thưởng (nếu chương trình đang
chạy) và lịch sử tích/hoàn điểm có phân trang.

Điểm do hệ thống tính theo các đơn đủ điều kiện. Không có chức năng chỉnh điểm
thủ công từ storefront.

### 20.8 Thanh toán — `/checkout`

Khách **không bắt buộc đăng nhập**. Đăng nhập giúp lưu địa chỉ, xem lịch sử đơn
và tích điểm.

Thông tin cần nhập: người đặt · người nhận · tỉnh/thành và khu vực · địa chỉ cụ
thể · ghi chú · yêu cầu hóa đơn điện tử + email nhận hóa đơn (nếu cần) ·
phương thức giao hàng · phương thức thanh toán.

Quy trình:

1. `/cart` → **Thanh toán**.
2. Nhập hoặc chọn địa chỉ giao hàng.
3. **Kiểm tra khu vực và phí giao hàng**.
4. Đối chiếu tạm tính / phí vận chuyển / tổng tiền.
5. Chọn phương thức thanh toán.
6. Tick đồng ý chính sách bảo mật và điều khoản.
7. Bấm nút đặt hàng tương ứng.

**Phương thức thanh toán hiện có:**

| Phương thức | Hoạt động |
|---|---|
| **Chuyển khoản VietQR** (mặc định) | Sau khi đặt, hệ thống hiện mã QR kèm đúng số tiền và **nội dung chuyển khoản là mã đơn**. Đội ngũ đối chiếu sao kê và xác nhận **thủ công**. |
| **Thanh toán khi nhận hàng (COD)** | Đơn được tạo ngay, khách trả tiền cho nhân viên giao hàng. |

Nếu đổi địa chỉ sau khi đã kiểm tra phí, phải bấm kiểm tra lại để tạo báo giá
mới.

### 20.9 Theo dõi đơn hàng

**Khách có tài khoản:** `/orders` và `/orders/<mã đơn>` — xem trạng thái thanh
toán, trạng thái đơn, sản phẩm/biến thể, địa chỉ, phí vận chuyển, tổng tiền,
phương thức giao hàng.

**Khách vãng lai (không đăng nhập):** dùng link tra cứu dạng
`/orders/track/<mã đơn>#token=<mã tra cứu>` được cấp khi đặt hàng. Trang này tự
làm mới **mỗi 30 giây**, nên khách thấy trạng thái cập nhật gần như tức thì sau
khi Admin đổi trạng thái. Link không có (hoặc sai) mã tra cứu sẽ báo lỗi — đây
là cơ chế bảo vệ, không phải sự cố.

**Đơn VietQR chưa thanh toán:** trang chi tiết đơn hiện lại mã QR để khách thanh
toán tiếp nếu đã lỡ đóng tab. Khách **không nên** chuyển khoản lặp lại; nhắc
khách chờ đội ngũ xác nhận.

### 20.10 Các trang nội dung khác

Về Mingo (`/about`) · Hệ thống phân phối (`/about#distribution`) · Hợp tác
(`/partnership`) · Liên hệ (`/contact`) · Chính sách (`/policies`) · Tuyển dụng
(`/careers`) · Câu hỏi thường gặp (`/faqs`, chưa có trong menu).

**Form liên hệ** (`/contact`) yêu cầu: họ tên · email · số điện thoại (định
dạng `0xxxxxxxxx` hoặc `+84xxxxxxxxx`) · bộ phận tiếp nhận (Chăm sóc khách
hàng / Hợp tác kinh doanh / Khiếu nại đơn hàng / Khác) · tiêu đề · nội dung tối
thiểu 10 ký tự. Form gửi thật về hệ thống; chỉ báo thành công khi gửi thành
công.

---

# PHẦN C — VẬN HÀNH, GIỚI HẠN VÀ BÀN GIAO

## 21. Checklist vận hành

### Catalog

- [ ] Sản phẩm có tên và nội dung đúng ngôn ngữ (đã dịch tab English).
- [ ] Danh mục / thương hiệu phù hợp.
- [ ] Giá, tồn kho, SKU chính xác.
- [ ] Biến thể đủ quy cách, giá, tồn, SKU.
- [ ] Ảnh hiển thị đúng, ảnh đầu tiên là ảnh đại diện.
- [ ] Trạng thái đúng trước khi công bố.
- [ ] Đã kiểm tra trang chi tiết và thử thêm vào giỏ.

### Nội dung

- [ ] Banner có ảnh, alt text và link đúng; đã bật hiển thị.
- [ ] Bộ sưu tập đã gán sản phẩm và đủ 3 điều kiện lên trang chủ.
- [ ] Chính sách đã kích hoạt.
- [ ] Tin tuyển dụng chỉ chuyển **Đã đăng** khi nội dung hoàn chỉnh.
- [ ] Nhà phân phối có địa chỉ và **link `maps/embed` hợp lệ**.
- [ ] Link PDF hồ sơ hợp tác còn mở được.

### Đơn hàng (hằng ngày)

- [ ] Rà đơn **Chờ thanh toán** — đối chiếu sao kê ngân hàng cho đơn VietQR.
- [ ] Kiểm tra cảnh báo tồn kho trước khi cam kết với khách.
- [ ] Xác nhận lại địa chỉ và số điện thoại người nhận.
- [ ] Chuyển đúng bước trạng thái kế tiếp.
- [ ] Lưu mã vận đơn và đơn vị vận chuyển.
- [ ] Ghi chú nội bộ cho các đơn hủy / chuyển hoàn / hoàn tiền.

## 22. Giới hạn hiện tại cần biết

1. **Phí vận chuyển đang cố định 0đ (miễn phí)** cho mọi đơn. Bước “Kiểm tra
   khu vực và phí giao hàng” dùng để xác định khu vực phục vụ, nhưng số tiền
   phí hiển thị luôn là 0. Muốn thu phí ship phải yêu cầu bên kỹ thuật chỉnh.
2. **VietQR không có webhook ngân hàng** — xác nhận thanh toán hoàn toàn thủ
   công. Thông tin tài khoản nhận tiền được cấu hình phía hệ thống; nếu chưa
   cấu hình, khu vực QR sẽ không hiện mã.
3. **Bộ lọc “sản phẩm cụ thể”** trong phần điểm bán đang bị vô hiệu hóa (chỉ là
   giao diện). Nút kính lúp bên cạnh cũng chỉ để trang trí — danh sách tự lọc
   lại khi đổi dòng sản phẩm / tỉnh thành / phường xã.
4. **Trang Câu hỏi thường gặp `/faqs`** chưa được đưa vào menu header/footer;
   chỉ truy cập được bằng URL trực tiếp.
5. **Module Màu sắc** (`/admin/colors`) không có trong menu và không dùng cho
   vận hành.
6. **Mã nhúng Google Maps** chỉ chấp nhận `https://www.google.com/maps/embed…`.
   Dán link chia sẻ thường sẽ bị từ chối.
7. **Banner campaign mặc định** trên trang chủ luôn tồn tại và không tắt được
   từ Admin; banner Admin hiển thị nối tiếp phía sau.
8. **Chương trình điểm thưởng** phụ thuộc cấu hình triển khai; thông tin đang
   hiển thị trong tài khoản khách là thông tin áp dụng.
9. Còn tồn tại trang `/checkout/vnpay-return` từ phương án thanh toán VNPay
   trước đây, nhưng **VNPay không còn là lựa chọn** trong màn thanh toán.

## 23. Ghi chú bàn giao kỹ thuật

Phần này để bên tiếp nhận kỹ thuật nắm, không cần thiết cho vận hành hằng ngày.

| Hạng mục | Tình trạng |
|---|---|
| Thông tin tài khoản VietQR | Đặt qua biến môi trường `NEXT_PUBLIC_VIETQR_BANK_ID`, `NEXT_PUBLIC_VIETQR_ACCOUNT_NO`, `NEXT_PUBLIC_VIETQR_ACCOUNT_NAME`. Chưa điền → mã QR không render. Các biến này **chưa có trong `.env.example`**. |
| Phí vận chuyển | Cố định trong `src/config/shipping.ts` (`feeVnd: 0`). Biến `NEXT_PUBLIC_SHIPPING_FEE` có trong `.env` nhưng **không được code đọc**. |
| Bản đồ điểm bán | iframe `https://www.google.com/maps/embed…`. Header CSP trong `src/middleware.ts` phải whitelist `https://www.google.com` ở `frame-src`, nếu không trình duyệt chặn iframe và hiện “This content is blocked”. |
| Whitelist link bản đồ | `src/lib/maps-embed.ts` (frontend) phải đồng bộ với `ecom-website/src/modules/distributors/utils/maps-embed.util.ts` (backend). |
| Link hợp tác | Lưu ở API `/settings`, field `partnership_pdf_url`. |
| Tra cứu đơn khách vãng lai | Token 64 ký tự hex, truyền qua **hash** của URL (`#token=…`) nên không lọt vào server log; trang tự poll 30 giây. |

## 24. Khi cần hỗ trợ

Khi báo lỗi, gửi kèm:

- module hoặc URL đang thao tác;
- thời điểm xảy ra lỗi;
- tài khoản / vai trò đang đăng nhập;
- mã đơn, mã sản phẩm hoặc ID dữ liệu liên quan;
- ảnh chụp màn hình thông báo lỗi;
- các bước đã làm ngay trước khi lỗi xảy ra.

**Không** gửi mật khẩu, mã OTP hoặc thông tin thanh toán nhạy cảm qua kênh hỗ trợ.
