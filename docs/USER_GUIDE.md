# Mingo Store — User Guide

> Phiên bản tài liệu: 29/07/2026  
> Phạm vi đối chiếu: storefront và admin trong `mingo-store`, API/backend trong `ecom-website`  
> Đối tượng sử dụng: khách hàng, nhân viên nội dung, nhân viên vận hành đơn hàng và quản trị viên

## 1. Mục đích tài liệu

Tài liệu này hướng dẫn cách sử dụng hệ thống Mingo Store theo đúng trạng thái code hiện tại, bao gồm:

- trải nghiệm mua hàng trên storefront;
- quản trị sản phẩm, danh mục, bộ sưu tập và quy cách;
- quản trị nội dung trang chủ, chính sách và tuyển dụng;
- quản trị nhà phân phối, người dùng và đơn hàng;
- mối liên hệ giữa dữ liệu admin, backend và nội dung khách hàng nhìn thấy;
- các giới hạn hiện tại cần biết trước khi vận hành.

Đây là user guide dành cho người dùng nghiệp vụ. Tên API hoặc chi tiết kỹ thuật chỉ được nhắc tới khi cần giải thích hành vi của hệ thống.

## Mục lục

1. [Mục đích tài liệu](#1-mục-đích-tài-liệu)
2. [Vai trò và quyền sử dụng](#2-vai-trò-và-quyền-sử-dụng)
3. [Đường dẫn chính](#3-đường-dẫn-chính)
4. [Bản đồ chức năng hiện tại](#4-bản-đồ-chức-năng-hiện-tại)
5. [Đăng nhập và sử dụng admin](#5-đăng-nhập-và-sử-dụng-admin)
6. [Trình tự chuẩn để tạo catalog](#6-trình-tự-chuẩn-để-tạo-catalog)
7. [Quản lý danh mục](#7-quản-lý-danh-mục)
8. [Quản lý quy cách/kích cỡ](#8-quản-lý-quy-cáchkích-cỡ)
9. [Quản lý sản phẩm](#9-quản-lý-sản-phẩm)
10. [Quản lý bộ sưu tập](#10-quản-lý-bộ-sưu-tập)
11. [Quản lý màu sắc](#11-quản-lý-màu-sắc)
12. [Quản lý nội dung trang chủ](#12-quản-lý-nội-dung-trang-chủ)
13. [Quản lý chính sách](#13-quản-lý-chính-sách)
14. [Quản lý nhà phân phối](#14-quản-lý-nhà-phân-phối)
15. [Quản lý tuyển dụng](#15-quản-lý-tuyển-dụng)
16. [Quản lý đơn ứng tuyển](#16-quản-lý-đơn-ứng-tuyển)
17. [Quản lý đơn hàng](#17-quản-lý-đơn-hàng)
18. [Quản lý người dùng](#18-quản-lý-người-dùng)
19. [Hướng dẫn khách hàng trên storefront](#19-hướng-dẫn-khách-hàng-trên-storefront)
20. [Quan hệ dữ liệu admin → storefront](#20-quan-hệ-dữ-liệu-admin--storefront)
21. [Checklist xuất bản nội dung](#21-checklist-xuất-bản-nội-dung)
22. [Xử lý sự cố](#22-xử-lý-sự-cố)
23. [Các giới hạn đã biết](#23-các-giới-hạn-đã-biết)
24. [Quy tắc vận hành khuyến nghị](#24-quy-tắc-vận-hành-khuyến-nghị)
25. [Kịch bản nghiệm thu nhanh](#25-kịch-bản-nghiệm-thu-nhanh)

## 2. Vai trò và quyền sử dụng

| Vai trò | Có thể thực hiện |
|---|---|
| Khách chưa đăng nhập | Xem trang chủ, sản phẩm, thương hiệu, chính sách, điểm bán, việc làm; tạo giỏ hàng; gửi đơn ứng tuyển |
| Khách hàng đã đăng nhập | Có toàn bộ quyền của khách; thanh toán; xem tài khoản, lịch sử và chi tiết đơn hàng |
| Quản trị viên | Đăng nhập `/admin`; quản lý danh mục, bộ sưu tập, sản phẩm, quy cách, đơn hàng, nhà phân phối, tuyển dụng, ứng viên, chính sách, banner và người dùng |

Backend kiểm tra token và role cho các thao tác quản trị. Việc biết URL admin không đủ để truy cập nếu tài khoản không có role `admin`.

## 3. Đường dẫn chính

Trong môi trường local mặc định:

- Storefront: `http://localhost:3001`
- Admin: `http://localhost:3001/admin`
- Đăng nhập admin: `http://localhost:3001/admin/login`
- Backend: giá trị được cấu hình trong `NEXT_PUBLIC_API_URL`, thường là `http://localhost:3000`

Storefront hỗ trợ hai ngôn ngữ:

- Tiếng Việt: không có prefix, ví dụ `/products`
- Tiếng Anh: có prefix `/en`, ví dụ `/en/products`

Admin hiện chỉ sử dụng tiếng Việt và không có prefix ngôn ngữ.

## 4. Bản đồ chức năng hiện tại

| Nhóm | Chức năng | Trạng thái | Ảnh hưởng storefront |
|---|---|---|---|
| Sản phẩm | Sản phẩm | Hoạt động | Danh sách, chi tiết, giỏ hàng |
| Sản phẩm | Danh mục | Hoạt động | Nhóm sản phẩm theo dòng |
| Sản phẩm | Bộ sưu tập | Hoạt động | Trang bộ sưu tập, hero và khối Must try |
| Sản phẩm | Quy cách/Kích cỡ | Hoạt động | Metadata và biến thể sản phẩm |
| Sản phẩm | Màu sắc | Chưa sử dụng được ở admin mới | Chưa có luồng storefront hoàn chỉnh |
| Vận hành | Đơn hàng | Hoạt động | Trạng thái và chi tiết đơn của khách |
| Vận hành | Nhà phân phối | Hoạt động | Mục Hệ thống phân phối |
| Vận hành | Tuyển dụng | Hoạt động | Danh sách và chi tiết việc làm |
| Vận hành | Đơn ứng tuyển | Hoạt động | Không hiển thị công khai; dùng nội bộ |
| Nội dung | Chính sách | Hoạt động | Trang Chính sách và hỗ trợ |
| Nội dung | Banner trang chủ | CRUD hoạt động, nhưng không phải nguồn hero chính của storefront mới | Xem lưu ý tại mục 12 |
| Hệ thống | Người dùng | Hoạt động | Tài khoản khách và quyền admin |
| Storefront | Quên mật khẩu | Chỉ có giao diện thông báo | Chưa gửi email thực tế |
| Storefront | Liên hệ | Chỉ có giao diện/mô phỏng gửi | Chưa có API lưu hoặc gửi liên hệ |

## 5. Đăng nhập và sử dụng admin

### 5.1 Đăng nhập

1. Mở `/admin/login`.
2. Nhập email và mật khẩu.
3. Chọn **Đăng nhập**.
4. Nếu tài khoản có role `admin`, hệ thống chuyển tới **Bảng điều khiển**.

Các thông báo thường gặp:

- **Email hoặc mật khẩu không đúng**: backend trả về lỗi xác thực.
- **Tài khoản này không có quyền quản trị**: tài khoản hợp lệ nhưng role không phải `admin`.
- **Đăng nhập thất bại. Vui lòng thử lại**: lỗi kết nối hoặc lỗi backend khác.

Phiên admin hiện được giữ bằng access token và thông tin người dùng trong trình duyệt. Không dùng máy công cộng để đăng nhập. Luôn chọn **Đăng xuất** sau khi hoàn tất công việc.

### 5.2 Điều hướng

Sidebar admin được chia thành:

- **Tổng quan**: Bảng điều khiển
- **Sản phẩm**: Sản phẩm, Danh mục, Bộ sưu tập, Màu sắc, Quy cách
- **Vận hành**: Đơn hàng, Nhà phân phối, Tuyển dụng, Đơn ứng tuyển
- **Nội dung**: Banner trang chủ, Chính sách
- **Hệ thống**: Người dùng

Trên màn hình nhỏ, chọn biểu tượng menu để mở sidebar.

### 5.3 Quy ước thao tác chung

- **Thêm**: mở form tạo mới.
- **Sửa**: biểu tượng bút chì.
- **Xoá**: biểu tượng thùng rác; cần xác nhận trước khi gửi yêu cầu.
- **Tìm kiếm/Bộ lọc**: danh sách tự tải lại theo điều kiện.
- **Phân trang**: đổi trang ở cuối bảng.
- **Lưu**: chỉ đóng form khi backend trả về thành công.
- Thông báo màu xanh biểu thị thành công; thông báo màu đỏ biểu thị lỗi.

Không tải lại trang hoặc đóng form khi nút đang hiển thị **Đang lưu…**.

## 6. Trình tự chuẩn để tạo catalog

Để tránh thiếu dữ liệu tham chiếu, nên thiết lập theo thứ tự:

1. Tạo **Danh mục**.
2. Tạo **Quy cách/Kích cỡ** và gán phạm vi danh mục nếu cần.
3. Tạo **Sản phẩm**, giá, tồn kho, ảnh và biến thể.
4. Tạo **Bộ sưu tập**.
5. Gán sản phẩm vào bộ sưu tập.
6. Chọn cách bộ sưu tập xuất hiện trên trang chủ.
7. Kiểm tra storefront bằng cả tiếng Việt và tiếng Anh.

## 7. Quản lý danh mục

Đường dẫn: `/admin/categories`

Danh sách hiển thị tên, slug, danh mục cha, thứ tự, trạng thái và thao tác.

### 7.1 Tạo danh mục

1. Chọn **Thêm danh mục**.
2. Điền các trường:

| Trường | Bắt buộc | Hướng dẫn |
|---|---|---|
| Tên | Có | Tên hiển thị của danh mục |
| Slug | Có về mặt dữ liệu | Có thể bỏ trống lúc nhập để hệ thống tự sinh từ tên |
| Mô tả | Không | Nội dung mô tả danh mục |
| Ảnh | Không | Ảnh đại diện |
| Danh mục cha | Không | Bỏ trống để tạo danh mục cấp gốc |
| Thứ tự | Không | Số nhỏ hiển thị trước |
| Kích hoạt | Không | Bật để danh mục được sử dụng như dữ liệu active |

3. Chọn **Lưu**.

Ví dụ:

- Tên: `Kem que`
- Slug: `kem-que`
- Danh mục cha: không có
- Thứ tự: `1`
- Kích hoạt: bật

### 7.2 Danh mục cha/con

Chọn một danh mục trong trường **Danh mục cha** để tạo cây phân cấp. Không chọn chính danh mục đang sửa làm cha.

Khi xoá danh mục có sản phẩm hoặc danh mục con, backend có thể từ chối để bảo toàn liên kết. Nên chuyển dữ liệu phụ thuộc trước khi xoá.

### 7.3 Tác động tới storefront

Danh mục được dùng để:

- nhóm sản phẩm trên trang `/products`;
- tạo trang `/categories/{slug}`;
- lọc sản phẩm và nhà phân phối;
- giới hạn phạm vi áp dụng của quy cách.

Sau khi đổi slug, URL cũ có thể không còn truy cập được. Chỉ đổi slug khi thật sự cần.

## 8. Quản lý quy cách/kích cỡ

Đường dẫn: `/admin/sizes`

Quy cách đại diện cho kiểu đóng gói hoặc kích cỡ, ví dụ:

- `24 cây / thùng`
- `Hộp 250ml`
- `12 hộp / thùng`

Danh sách hiển thị nhãn quy cách, đơn vị, số lượng/thùng, dung tích, thứ tự và phạm vi danh mục.

### 8.1 Tạo quy cách

1. Chọn **Thêm quy cách**.
2. Điền:

| Trường | Bắt buộc | Hướng dẫn |
|---|---|---|
| Nhãn hiển thị | Có, hoặc để hệ thống tự tạo | Ví dụ `24 cây / thùng` |
| Đơn vị | Không | `cây`, `hộp`, `lít`... |
| SL/thùng | Không | Số lượng đơn vị trong một thùng |
| Dung tích (ml) | Không | Dung tích của đơn vị bán |
| Thứ tự | Không | Số nhỏ hiển thị trước |
| Phạm vi danh mục | Không | Có thể chọn nhiều danh mục; bỏ trống nghĩa là dùng chung |

3. Chọn **Lưu**.

Nếu để trống nhãn, cần nhập đủ metadata để hệ thống tạo nhãn hợp lệ. Nếu không, form báo:

> Nhập nhãn hiển thị (hoặc điền đơn vị + SL/thùng / dung tích để tự tạo).

### 8.2 Phạm vi danh mục

- Không chọn danh mục: quy cách dùng chung toàn hệ thống.
- Chọn một hoặc nhiều danh mục: quy cách được gắn với các nhóm sản phẩm tương ứng.

Backend hiện hỗ trợ quan hệ nhiều-nhiều giữa quy cách và danh mục.

### 8.3 Trước khi xoá

Quy cách có thể đang được biến thể sản phẩm tham chiếu. Nên mở các sản phẩm liên quan, gỡ hoặc đổi quy cách trước khi xoá.

## 9. Quản lý sản phẩm

Đường dẫn: `/admin/products`

Danh sách hiển thị:

- ảnh và tên sản phẩm;
- danh mục;
- giá đang áp dụng;
- tồn kho;
- trạng thái;
- thao tác sửa hoặc xoá.

Có thể tìm theo tên, lọc theo danh mục, trạng thái và chuyển trang.

### 9.1 Trạng thái sản phẩm

| Trạng thái | Ý nghĩa vận hành |
|---|---|
| Đang bán (`active`) | Có thể xuất hiện và mua nếu tồn kho lớn hơn 0 |
| Nháp (`draft`) | Chưa sẵn sàng công bố |
| Ẩn (`inactive`) | Tạm ngừng hiển thị/bán |
| Hết hàng (`out_of_stock`) | Không thể mua |

Để sản phẩm có thể mua trên storefront, cần đồng thời:

- trạng thái là **Đang bán**;
- tồn kho sản phẩm lớn hơn 0;
- giá hợp lệ.

### 9.2 Tạo sản phẩm

1. Chọn **Thêm sản phẩm**.
2. Nhập nội dung tiếng Việt.
3. Mở tab **English** để kiểm tra hoặc sửa bản dịch.
4. Tải ảnh.
5. Nhập giá, tồn kho, SKU và danh mục.
6. Chọn trạng thái.
7. Bật/tắt các cờ **Nổi bật** và **Hiện nhãn giảm giá**.
8. Thêm biến thể theo quy cách nếu sản phẩm có nhiều kiểu đóng gói.
9. Chọn **Lưu**.

### 9.3 Nội dung song ngữ

| Tab tiếng Việt | Tab English |
|---|---|
| Tên sản phẩm | Product name |
| Slug | Slug |
| Mô tả ngắn | Short description |
| Mô tả | Description |

Tên tiếng Anh ban đầu được điền theo tên tiếng Việt cho tới khi người dùng sửa tab English. Nên thay bằng bản dịch thật trước khi công bố.

Ít nhất một ngôn ngữ phải có tên sản phẩm. Nếu không, form báo:

> Cần nhập tên sản phẩm (ít nhất một ngôn ngữ).

### 9.4 Giá và tồn kho

| Trường | Cách dùng |
|---|---|
| Giá (VND) | Giá gốc; phải lớn hơn 0 |
| Giá KM | Giá bán khuyến mãi nếu có |
| Tồn kho | Tồn chung của sản phẩm |
| SKU | Mã quản lý sản phẩm |

Quy tắc hiển thị giá catalog hiện tại:

1. giá biến thể nếu ngữ cảnh có biến thể;
2. nếu không, dùng giá khuyến mãi;
3. nếu không có giá khuyến mãi, dùng giá gốc.

Không nhập dấu phân cách hàng nghìn vào ô số. Ví dụ nhập `120000`, không nhập `120.000`.

### 9.5 Ảnh sản phẩm

- Tối đa 5 ảnh.
- Mỗi ảnh tối đa 5 MB.
- Chấp nhận định dạng ảnh như PNG, JPG/JPEG hoặc WebP.
- Ảnh đầu tiên được dùng làm ảnh đại diện trong catalog.
- Có thể xoá từng ảnh khỏi danh sách trước khi lưu.

Nên dùng ảnh cùng tỷ lệ và tối ưu dung lượng để giao diện ổn định.

### 9.6 Biến thể theo quy cách

Mỗi dòng biến thể gồm:

- Quy cách;
- SKU;
- Giá;
- Tồn kho.

Mỗi biến thể bắt buộc phải chọn quy cách và nhập SKU. Giá/tồn của biến thể có thể khác sản phẩm gốc.

Nếu không có biến thể, sản phẩm dùng giá và tồn chung.

Lưu ý hiện tại: backend và admin đã lưu biến thể, nhưng panel mua hàng storefront chưa có bộ chọn biến thể và API giỏ hàng hiện thêm theo `productId`. Vì vậy không nên dựa vào biến thể như lựa chọn mua bắt buộc cho tới khi storefront/cart hoàn thiện luồng này.

### 9.7 Sửa và xoá

- Khi sửa, form tải dữ liệu chi tiết trước khi cho lưu.
- Khi xoá, kiểm tra sản phẩm có nằm trong bộ sưu tập hoặc đơn hàng hay không.
- Dữ liệu sản phẩm đã được chụp vào đơn hàng cũ không nên bị hiểu là sẽ thay đổi theo catalog mới.

## 10. Quản lý bộ sưu tập

Đường dẫn: `/admin/collections`

Bộ sưu tập dùng để nhóm sản phẩm và điều khiển một phần nội dung trang chủ.

Danh sách hiển thị tên, slug, trạng thái và các thao tác:

- quản lý sản phẩm trong bộ sưu tập;
- sửa;
- xoá.

### 10.1 Tạo bộ sưu tập

| Trường | Bắt buộc | Hướng dẫn |
|---|---|---|
| Tên | Có | Tên bộ sưu tập |
| Slug | Không khi nhập | Tự sinh từ tên nếu bỏ trống |
| Mô tả | Không | Mô tả hiển thị |
| Ảnh banner | Tuỳ placement | Bắt buộc nếu dùng Hero |
| Hiển thị trang chủ | Không | Chọn Normal, Hero hoặc Home section |
| Khối trang chủ | Khi dùng Home section | Hiện hỗ trợ `Must try` |
| Ảnh banner mobile | Không | Nếu trống sẽ dùng banner desktop |
| Nhãn nút CTA | Không | Mặc định là “Xem sản phẩm” |
| Thứ tự | Với Hero/Home section | Số nhỏ hiển thị trước |
| SEO title | Không | Tiêu đề SEO |
| SEO description | Không | Mô tả SEO |
| Kích hoạt | Không | Chỉ dữ liệu active mới nên được công bố |

### 10.2 Placement trên trang chủ

| Lựa chọn | Kết quả |
|---|---|
| Không hiện trang chủ (`NORMAL`) | Chỉ là bộ sưu tập thông thường |
| Banner đầu trang (`HERO`) | Xuất hiện trong carousel hero; bắt buộc có ảnh banner |
| Khối sản phẩm trang chủ (`HOME_SECTION`) | Xuất hiện thành section; phải chọn `Must try` và gán sản phẩm |

Storefront mới lấy hero và section từ endpoint tổng hợp `/storefront/home`. Dữ liệu nguồn là bộ sưu tập có placement tương ứng.

### 10.3 Gán sản phẩm

1. Tại dòng bộ sưu tập, chọn biểu tượng **Sản phẩm**.
2. Xem danh sách sản phẩm đã gán.
3. Để thêm:
   - nhập tên vào ô tìm kiếm;
   - chọn **Tìm**;
   - chọn biểu tượng thêm ở sản phẩm phù hợp.
4. Để gỡ, chọn biểu tượng gỡ ở danh sách hiện tại.
5. Đóng hộp thoại khi hoàn tất.

Một bộ sưu tập dạng `Must try` không có sản phẩm sẽ không tạo section hữu ích trên storefront.

### 10.4 Quy trình tạo hero

1. Tạo hoặc sửa bộ sưu tập.
2. Chọn **Banner đầu trang (Hero)**.
3. Tải ảnh banner desktop.
4. Tải ảnh mobile nếu có.
5. Nhập nhãn CTA nếu muốn.
6. Đặt thứ tự.
7. Bật **Kích hoạt**.
8. Lưu và kiểm tra trang chủ.

Nếu API trang chủ lỗi hoặc không trả về hero, storefront hiển thị banner local dự phòng.

## 11. Quản lý màu sắc

Đường dẫn: `/admin/colors`

Màn hình hiện là placeholder. Backend có module `/colors`, nhưng OpenAPI chưa mô tả đầy đủ DTO/response để admin mới sinh client an toàn.

Không dùng màn hình này cho vận hành production. Muốn kích hoạt cần:

1. hoàn thiện Swagger/OpenAPI cho colors ở backend;
2. export OpenAPI;
3. chạy lại `npm run api:gen` ở storefront;
4. hoàn thiện trang CRUD màu sắc;
5. kiểm tra tích hợp với sản phẩm/biến thể.

## 12. Quản lý nội dung trang chủ

Hiện có hai nguồn dữ liệu dễ bị nhầm:

### 12.1 Hero và Must try của storefront mới

Nguồn chính là **Bộ sưu tập**:

- `HERO` → carousel đầu trang;
- `HOME_SECTION` + `must_try` → khối Must try.

Đây là luồng nên dùng để vận hành storefront hiện tại.

### 12.2 Module Banner trang chủ

Đường dẫn: `/admin/homepage-banners`

Form hỗ trợ:

- ảnh banner, bắt buộc;
- alt text;
- link khi click;
- thứ tự hiển thị;
- bật/tắt hiển thị trên trang chủ.

Danh sách hỗ trợ thêm, sửa và xoá.

Tuy nhiên, code storefront mới đang đọc hero từ `heroCollections` của `/storefront/home`, không đọc trực tiếp danh sách `/homepage/banners`. Vì vậy dữ liệu tạo tại màn hình **Banner trang chủ** có thể không xuất hiện trong hero hiện tại nếu backend aggregator chưa ghép nguồn này.

Quy tắc vận hành:

- dùng **Bộ sưu tập → HERO** cho hero của storefront mới;
- chỉ dùng **Banner trang chủ** nếu môi trường triển khai đã xác nhận endpoint tổng hợp đọc module này;
- sau mỗi thay đổi, kiểm tra trực tiếp trang chủ ở cả desktop và mobile.

## 13. Quản lý chính sách

Đường dẫn admin: `/admin/policies`  
Đường dẫn storefront: `/policies`

Danh sách admin hiển thị tiêu đề, slug, thứ tự, trạng thái và thao tác.

### 13.1 Tạo chính sách

| Trường | Bắt buộc | Hướng dẫn |
|---|---|---|
| Tiêu đề | Có | Tên hiển thị trong sidebar |
| Slug | Không khi nhập | Tự sinh từ tiêu đề nếu bỏ trống |
| Nội dung (HTML) | Có | Nội dung chính sách |
| Thứ tự hiển thị | Không | Số nguyên từ 0; số nhỏ đứng trước |
| Kích hoạt | Không | Bật để endpoint public trả về |

Backend làm sạch HTML khi lưu. Có thể dùng các thẻ nội dung cơ bản như:

```html
<h2>Phạm vi áp dụng</h2>
<p>Nội dung chính sách...</p>
<ul>
  <li>Điều khoản thứ nhất</li>
  <li>Điều khoản thứ hai</li>
</ul>
```

Không chèn script, iframe không cần thiết hoặc mã theo dõi vào nội dung.

### 13.2 Cách storefront hiển thị

- Sidebar lấy danh sách chính sách active và sắp theo thứ tự.
- Mặc định mở chính sách đầu tiên.
- Khi người dùng chọn mục khác, URL có dạng `/policies?policy={slug}`.
- Nội dung chi tiết được lấy theo slug.

Sau khi đổi slug, liên kết cũ sẽ không còn trỏ đúng chính sách.

## 14. Quản lý nhà phân phối

Đường dẫn: `/admin/distributors`

Danh sách hiển thị:

- tên;
- địa chỉ;
- tỉnh/thành;
- số danh mục liên kết;
- số bộ sưu tập liên kết;
- trạng thái.

Có thể tìm theo tên/địa chỉ và lọc theo tỉnh/thành hoặc trạng thái.

### 14.1 Tạo nhà phân phối

| Trường | Bắt buộc | Hướng dẫn |
|---|---|---|
| Tên | Có | Tên điểm bán/nhà phân phối |
| Địa chỉ | Có | Số nhà và tên đường |
| Tỉnh/Thành | Có | Chọn từ danh sách |
| Phường/Xã | Có | Danh sách phụ thuộc tỉnh/thành |
| Khu vực | Không | Thông tin bổ sung |
| Mô tả | Không | Ghi chú công khai |
| Mã nhúng Google Maps | Có | Dán iframe hoặc URL embed |
| Danh mục | Không | Có thể chọn nhiều |
| Bộ sưu tập | Không | Có thể chọn nhiều |
| Hoạt động | Không | Bật để endpoint public trả về |

Khi đổi tỉnh/thành, cần chọn lại phường/xã.

### 14.2 Lấy mã Google Maps

1. Mở địa điểm trên Google Maps.
2. Chọn **Chia sẻ**.
3. Chọn **Nhúng bản đồ**.
4. Sao chép thẻ `<iframe ...>` hoặc URL `https://www.google.com/maps/embed?...`.
5. Dán vào trường **Mã nhúng Google Maps**.

Backend chuẩn hoá dữ liệu nhúng trước khi lưu. Không dùng URL tìm kiếm thông thường nếu có thể lấy URL embed.

### 14.3 Tác động tới storefront

Trang `/stores` chuyển tới mục **Hệ thống phân phối** trong `/about#distribution`.

Người dùng có thể lọc theo:

- dòng sản phẩm/danh mục;
- tỉnh/thành;
- phường/xã.

Danh sách điểm bán và bản đồ đổi theo bộ lọc. Bộ lọc sản phẩm cụ thể hiện đang bị vô hiệu hoá vì chưa có dữ liệu hỗ trợ. Nút tìm kiếm chỉ mang tính giao diện; việc tải lại diễn ra tự động khi thay đổi bộ lọc.

## 15. Quản lý tuyển dụng

Đường dẫn: `/admin/careers`

Danh sách hiển thị:

- tiêu đề;
- bộ phận;
- địa điểm;
- cấp bậc;
- trạng thái;
- thao tác xem ứng viên, sửa, xoá.

Có thể lọc theo từ khoá, trạng thái, bộ phận, địa điểm và cấp bậc.

### 15.1 Trạng thái tin

| Trạng thái | Ý nghĩa |
|---|---|
| Nháp (`draft`) | Chưa công bố |
| Đã đăng (`published`) | Có thể hiển thị trên storefront |
| Đã đóng (`closed`) | Ngừng nhận hồ sơ |

### 15.2 Tạo tin tuyển dụng

| Trường | Bắt buộc | Hướng dẫn |
|---|---|---|
| Tiêu đề | Có | Tên vị trí |
| Slug | Không khi nhập | Tự sinh từ tiêu đề |
| Bộ phận | Không | Ví dụ `Sản xuất` |
| Địa điểm | Không | Ví dụ `TP.HCM` |
| Cấp bậc | Không | Ví dụ `Nhân viên` |
| Nội dung (HTML) | Có | Mô tả công việc |
| Ảnh bìa | Không | Ảnh cho trang chi tiết |
| Trạng thái | Không | Nháp, Đã đăng, Đã đóng |
| Ghim | Không | Đánh dấu tin nổi bật |

Nên tạo ở trạng thái **Nháp**, kiểm tra nội dung và chỉ chuyển sang **Đã đăng** khi hoàn tất.

### 15.3 Nội dung HTML gợi ý

```html
<h2>Mô tả công việc</h2>
<ul>
  <li>Thực hiện...</li>
</ul>
<h2>Yêu cầu</h2>
<ul>
  <li>Kinh nghiệm...</li>
</ul>
<h2>Quyền lợi</h2>
<p>...</p>
```

### 15.4 Xem ứng viên theo tin

Tại dòng tin tuyển dụng, chọn biểu tượng **Ứng viên** để mở danh sách hồ sơ gắn với vị trí đó.

## 16. Quản lý đơn ứng tuyển

Đường dẫn: `/admin/career-applications`

Danh sách hiển thị:

- họ tên, email và số điện thoại;
- vị trí ứng tuyển;
- ngày nộp;
- trạng thái;
- liên kết mở CV.

Có thể:

- tìm theo tên hoặc email;
- lọc theo trạng thái;
- lọc theo vị trí;
- đổi trạng thái ngay tại bảng;
- chọn tên ứng viên để xem chi tiết;
- mở CV trong tab mới.

### 16.1 Trạng thái hồ sơ

| Trạng thái | Cách dùng |
|---|---|
| Mới (`new`) | Hồ sơ vừa nhận |
| Đang xem xét (`reviewing`) | Đã bắt đầu đánh giá |
| Đã tuyển (`hired`) | Ứng viên được chọn |
| Từ chối (`rejected`) | Không tiếp tục quy trình |

Quy trình gợi ý:

1. Hồ sơ mới vào trạng thái **Mới**.
2. Người phụ trách mở CV và thư giới thiệu.
3. Chuyển sang **Đang xem xét**.
4. Sau quyết định, chuyển sang **Đã tuyển** hoặc **Từ chối**.

Chi tiết hồ sơ gồm trạng thái, email, điện thoại, ngày nộp, CV và thư giới thiệu.

### 16.2 Luồng ứng tuyển trên storefront

1. Người dùng mở `/careers`.
2. Tìm hoặc lọc việc làm.
3. Mở trang chi tiết.
4. Nhập họ tên, số điện thoại, email.
5. Có thể nhập thư giới thiệu.
6. Đính kèm CV `.pdf`, `.doc` hoặc `.docx`, tối đa 5 MB.
7. Chọn **Gửi đơn ứng tuyển**.

Hồ sơ thành công sẽ xuất hiện ở admin.

## 17. Quản lý đơn hàng

Đường dẫn: `/admin/orders`

Danh sách hiển thị:

- mã đơn và thời gian tạo;
- người nhận và số điện thoại;
- số sản phẩm;
- tổng tiền;
- trạng thái thanh toán;
- trạng thái đơn;
- cảnh báo giữ tồn;
- thao tác xem chi tiết.

Có thể tìm theo mã đơn, tên hoặc số điện thoại người nhận; lọc theo trạng thái đơn và trạng thái thanh toán.

### 17.1 Hai loại trạng thái riêng biệt

Không đồng nhất **trạng thái đơn** với **trạng thái thanh toán**.

Trạng thái thanh toán:

| Trạng thái | Ý nghĩa |
|---|---|
| `PENDING` | Chưa có xác nhận thanh toán cuối cùng |
| `PAID` | Backend đã xác nhận thanh toán |
| `FAILED` | Thanh toán thất bại |

Trạng thái đơn:

| Trạng thái | Nhãn admin |
|---|---|
| `PENDING_PAYMENT` | Chờ thanh toán |
| `PAID` | Đã thanh toán |
| `CONFIRMED` | Đã xác nhận đơn hàng |
| `PACKED` | Đã đóng gói và sẵn sàng giao hàng |
| `IN_TRANSIT` | Đang vận chuyển |
| `DELIVERED` | Đã giao |
| `CANCELLED` | Đã huỷ |
| `FAILED` | Thất bại |
| `REFUNDED` | Đã hoàn tiền |

### 17.2 Luồng chuẩn

```text
Chờ thanh toán
→ Đã thanh toán
→ Đã xác nhận đơn hàng
→ Đã đóng gói và sẵn sàng giao hàng
→ Đang vận chuyển
→ Đã giao
```

Ở mỗi bước chưa kết thúc, admin cũng có thể chuyển sang **Đã huỷ** hoặc **Thất bại**. Trạng thái kết thúc không đi tiếp trong luồng thông thường; các trạng thái phù hợp có thể chuyển sang **Đã hoàn tiền**.

Dropdown chỉ hiển thị các trạng thái tiếp theo được UI xem là hợp lệ.

### 17.3 Xem chi tiết đơn

Chọn biểu tượng xem chi tiết để kiểm tra:

- trạng thái đơn;
- trạng thái và phương thức thanh toán;
- ngày tạo;
- địa chỉ và ghi chú giao hàng;
- tài khoản đặt;
- thời gian thanh toán và mã giao dịch VNPay nếu có;
- danh sách sản phẩm, biến thể, số lượng, đơn giá, thành tiền;
- tạm tính, vận chuyển, giảm giá, thuế và tổng;
- lịch sử thay đổi trạng thái;
- thông tin vận chuyển nội bộ.

### 17.4 Cập nhật trạng thái

1. Mở chi tiết đơn.
2. Tại **Cập nhật trạng thái**, chọn trạng thái kế tiếp.
3. Nhập ghi chú nếu cần.
4. Chọn **Áp dụng**.
5. Kiểm tra mục **Lịch sử trạng thái**.

Nên ghi chú cho các trường hợp:

- huỷ theo yêu cầu khách;
- thanh toán lỗi;
- giao hàng thất bại;
- hoàn tiền;
- thay đổi đặc biệt cần truy vết.

### 17.5 Vận chuyển và ghi chú nội bộ

Có thể lưu:

- mã vận đơn;
- đơn vị vận chuyển;
- ghi chú nội bộ.

Chọn **Lưu thông tin** sau khi chỉnh sửa. Đây là thao tác riêng với đổi trạng thái.

### 17.6 Cảnh báo chưa giữ tồn kho

Nếu đơn đang **Chờ thanh toán** và `stockReserved = false`, admin thấy cảnh báo:

> Đơn chờ thanh toán nhưng chưa giữ tồn kho — hàng có thể bị bán cho đơn khác.

Khi thấy cảnh báo:

1. không hứa chắc tồn kho với khách nếu chưa kiểm tra;
2. kiểm tra số lượng hiện tại;
3. xử lý thanh toán hoặc liên hệ khách sớm;
4. không tự đổi trạng thái để che cảnh báo.

## 18. Quản lý người dùng

Đường dẫn: `/admin/users`

Danh sách hiển thị email, điện thoại, vai trò, ngày tạo và thao tác.

Có thể tìm theo email và lọc theo:

- Khách hàng (`user`);
- Quản trị (`admin`).

### 18.1 Tạo người dùng

| Trường | Bắt buộc | Hướng dẫn |
|---|---|---|
| Email | Không theo form admin | Nên nhập cho tài khoản đăng nhập bằng email |
| Số điện thoại | Có khi tạo | Số điện thoại tài khoản |
| Mật khẩu | Có khi tạo | Tối thiểu 6 ký tự ở form admin |
| Vai trò | Không | Mặc định là khách hàng |
| Ghi chú hồ sơ | Không | Ghi chú dạng text |

Lưu ý: form đăng ký storefront yêu cầu mật khẩu tối thiểu 8 ký tự, trong khi form admin hiện kiểm tra tối thiểu 6 ký tự. Nên dùng chuẩn nội bộ tối thiểu 8 ký tự để thống nhất.

### 18.2 Sửa người dùng

- Có thể đổi số điện thoại, vai trò và ghi chú.
- Mật khẩu mới có thể bỏ trống nếu không muốn đổi.
- Chỉ cấp role `admin` cho người thực sự cần quyền quản trị.

### 18.3 Trước khi xoá

Người dùng có thể liên quan tới đơn hàng và địa chỉ. Không xoá tài khoản chỉ để ngăn đăng nhập nếu nghiệp vụ cần giữ lịch sử. Cần kiểm tra chính sách lưu trữ dữ liệu trước khi xoá.

## 19. Hướng dẫn khách hàng trên storefront

### 19.1 Trang chủ

Trang chủ có:

- carousel hero;
- các khối sản phẩm như Must try;
- header, footer và liên kết nội dung.

Nếu dữ liệu hero từ API không có hoặc API lỗi, hệ thống dùng banner local dự phòng.

### 19.2 Xem sản phẩm

1. Chọn **Dòng sản phẩm** trên menu.
2. Chọn sản phẩm trong nhóm danh mục.
3. Mở trang chi tiết để xem:
   - ảnh;
   - giá;
   - mô tả;
   - thành phần và dinh dưỡng nếu có;
   - hướng dẫn sử dụng;
   - cảnh báo/chất gây dị ứng nếu có;
   - sản phẩm gợi ý.

Sản phẩm trạng thái không active hoặc hết tồn kho không thể thêm vào giỏ.

### 19.3 Thêm vào giỏ

1. Mở chi tiết sản phẩm.
2. Dùng nút `-` hoặc `+` để chọn số lượng.
3. Số lượng không thể thấp hơn 1 hoặc cao hơn tồn kho.
4. Chọn **Thêm vào giỏ hàng**.

Giỏ hàng khách được nhận diện bằng token riêng trong trình duyệt. Sau khi đăng nhập hoặc đăng ký, hệ thống cố gắng gộp giỏ khách vào tài khoản.

### 19.4 Quản lý giỏ hàng

Trong drawer hoặc trang `/cart`, người dùng có thể:

- tăng/giảm số lượng;
- xoá một sản phẩm;
- xoá toàn bộ giỏ;
- xem tạm tính;
- tiếp tục mua sắm;
- chuyển tới thanh toán.

Backend là nguồn dữ liệu cuối cùng cho giá, tồn kho, thành tiền và tính hợp lệ. Nếu giá/tồn đã thay đổi, giỏ hiển thị cảnh báo và nút thanh toán có thể bị vô hiệu hoá.

### 19.5 Đăng ký

Trang `/register` yêu cầu:

- tên;
- họ;
- email;
- số điện thoại;
- quốc gia;
- mật khẩu tối thiểu 8 ký tự;
- xác nhận mật khẩu.

Sau khi đăng ký, storefront tự đăng nhập lại và gộp giỏ hàng.

### 19.6 Đăng nhập

1. Mở `/login`.
2. Nhập email và mật khẩu.
3. Chọn **Đăng nhập**.
4. Sau thành công, hệ thống chuyển tới `/account`.

### 19.7 Quên mật khẩu

Trang `/forgot-password` hiện chỉ hiển thị thông báo thành công giả lập. Backend chưa có endpoint khôi phục mật khẩu được nối với form này. Người dùng chưa nhận email thực tế.

Khi vận hành production, cần cung cấp kênh hỗ trợ thay thế cho tới khi tính năng hoàn thiện.

### 19.8 Thanh toán

Điều kiện:

- đã đăng nhập;
- giỏ hàng có sản phẩm hợp lệ;
- khu vực giao hàng được hỗ trợ.

Quy trình:

1. Mở `/checkout`.
2. Nhập họ tên và số điện thoại người nhận.
3. Chọn tỉnh/thành.
4. Chọn quận/huyện/khu vực.
5. Nhập địa chỉ cụ thể.
6. Nhập ghi chú nếu cần.
7. Chọn **Kiểm tra khu vực và phí giao hàng**.
8. Hệ thống:
   - kiểm tra khu vực;
   - xác định giao trực tiếp hoặc qua đại lý;
   - lưu/cập nhật địa chỉ giao hàng;
   - tính tạm tính, phí giao hàng và tổng.
9. Nếu hợp lệ, chọn **Thanh toán với VNPay**.
10. Hoàn tất trên cổng VNPay.

Không sửa địa chỉ sau khi đã có báo giá mà không bấm kiểm tra lại. Bất kỳ thay đổi nào trong form đều làm báo giá cũ mất hiệu lực.

### 19.9 Xác nhận VNPay

Sau khi VNPay đưa người dùng trở lại, trang `/checkout/vnpay-return` không tin trực tiếp các tham số trên trình duyệt. Trang gọi backend để đọc trạng thái đơn thực tế.

Kết quả có thể là:

- thanh toán thành công;
- thanh toán thất bại;
- đang chờ xác nhận;
- không thể xác minh.

Nếu đang chờ, người dùng nên mở lại đơn trong mục **Đơn hàng** sau một khoảng thời gian, không thanh toán lặp lại ngay.

### 19.10 Tài khoản và đơn hàng

Trang `/account` hiển thị:

- thông tin cá nhân;
- địa chỉ;
- đơn gần đây;
- liên kết xem toàn bộ đơn;
- đăng xuất.

Trang `/orders` hiển thị lịch sử đơn. Chọn một đơn để mở `/orders/{orderCode}` và xem:

- trạng thái thanh toán;
- trạng thái đơn;
- sản phẩm;
- địa chỉ;
- tạm tính;
- phí giao hàng;
- tổng tiền;
- hình thức giao trực tiếp hoặc qua đại lý.

Nếu phiên hết hạn, hệ thống yêu cầu đăng nhập lại.

### 19.11 Chính sách

Mở `/policies`, chọn tên chính sách ở sidebar để xem nội dung. Chỉ các chính sách đang active mới được trả về công khai.

### 19.12 Điểm bán

Chọn **Điểm bán** để tới phần Hệ thống phân phối. Có thể lọc theo danh mục, tỉnh/thành và phường/xã; chọn một điểm bán để đổi bản đồ.

### 19.13 Liên hệ

Form `/contact` kiểm tra họ tên, email, số điện thoại, bộ phận, tiêu đề và nội dung.

Hiện form chỉ mô phỏng gửi thành công ở frontend và ghi payload vào console; chưa có endpoint `/contact`. Không xem thông báo thành công này là bằng chứng backend đã nhận yêu cầu.

## 20. Quan hệ dữ liệu admin → storefront

| Thao tác admin | Điều kiện để khách nhìn thấy | Vị trí storefront |
|---|---|---|
| Tạo sản phẩm | Status active, tồn kho hợp lệ, dữ liệu API trả về | `/products`, category, collection, PDP |
| Tạo danh mục | Active và có sản phẩm phù hợp | `/products`, `/categories/{slug}` |
| Tạo collection thường | Active | `/collections/{slug}` |
| Collection placement HERO | Active, có banner | Carousel trang chủ |
| Collection placement HOME_SECTION | Active, section `must_try`, có sản phẩm | Must try trang chủ |
| Tạo policy | Active | `/policies` |
| Tạo distributor | Active, địa chỉ và map hợp lệ | `/about#distribution` |
| Tạo career | Published | `/careers` và trang chi tiết |
| Đổi trạng thái application | Luồng nội bộ | Chỉ admin |
| Đổi trạng thái order | Backend cập nhật thành công | Tài khoản/chi tiết đơn của khách |
| Tạo homepage banner | Phụ thuộc aggregator của môi trường | Không phải nguồn hero chính trong code storefront hiện tại |

## 21. Checklist xuất bản nội dung

### 21.1 Sản phẩm

- [ ] Tên tiếng Việt đúng chính tả.
- [ ] Nội dung English đã được kiểm tra.
- [ ] Slug ngắn, không dấu, không trùng.
- [ ] Có ảnh đại diện.
- [ ] Giá lớn hơn 0.
- [ ] Giá khuyến mãi hợp lý.
- [ ] Tồn kho đúng.
- [ ] SKU không trùng theo quy ước nội bộ.
- [ ] Danh mục đúng.
- [ ] Biến thể có đủ quy cách và SKU.
- [ ] Status là Đang bán khi sẵn sàng.
- [ ] Kiểm tra PDP và giỏ hàng.

### 21.2 Hero/Must try

- [ ] Collection active.
- [ ] Placement đúng.
- [ ] Hero có ảnh desktop.
- [ ] Có ảnh mobile hoặc chấp nhận dùng ảnh desktop.
- [ ] CTA hợp lý.
- [ ] Must try đã gán sản phẩm.
- [ ] Thứ tự không xung đột.
- [ ] Kiểm tra trang chủ trên desktop và mobile.

### 21.3 Chính sách

- [ ] Tiêu đề và slug đúng.
- [ ] HTML không chứa mã không an toàn.
- [ ] Thứ tự đúng.
- [ ] Active.
- [ ] Mở thử từ sidebar storefront.

### 21.4 Tuyển dụng

- [ ] Tiêu đề, bộ phận, địa điểm và cấp bậc rõ ràng.
- [ ] Nội dung có mô tả, yêu cầu và quyền lợi.
- [ ] Ảnh bìa phù hợp.
- [ ] Chuyển từ Nháp sang Đã đăng.
- [ ] Thử gửi một hồ sơ kiểm tra.
- [ ] Hồ sơ xuất hiện trong Đơn ứng tuyển.

### 21.5 Đơn hàng

- [ ] Kiểm tra thanh toán độc lập với trạng thái đơn.
- [ ] Kiểm tra cảnh báo giữ tồn.
- [ ] Xác nhận địa chỉ và số điện thoại.
- [ ] Cập nhật đúng bước kế tiếp.
- [ ] Ghi chú lý do cho trạng thái ngoại lệ.
- [ ] Lưu mã vận đơn và đơn vị vận chuyển.

## 22. Xử lý sự cố

### 22.1 Admin bị chuyển về trang đăng nhập

Nguyên nhân có thể:

- access token hết hạn hoặc không tồn tại;
- local storage bị xoá;
- tài khoản không còn role admin;
- backend trả về 401/403.

Cách xử lý:

1. đăng xuất nếu còn phiên;
2. đăng nhập lại;
3. kiểm tra role người dùng;
4. kiểm tra backend và `NEXT_PUBLIC_API_URL`.

### 22.2 Lưu thất bại

1. Đọc thông báo lỗi trong form/toast.
2. Kiểm tra trường bắt buộc.
3. Kiểm tra dữ liệu số không âm và slug không trùng.
4. Kiểm tra token.
5. Không bấm lưu nhiều lần liên tiếp.

### 22.3 Upload ảnh thất bại

- Chỉ dùng file ảnh.
- Mỗi file không quá 5 MB.
- Kiểm tra cấu hình dịch vụ lưu trữ ảnh ở backend.
- Kiểm tra token admin.
- Thử lại với file JPG/WebP đã tối ưu.

### 22.4 Dữ liệu đã lưu nhưng không thấy trên storefront

Kiểm tra theo thứ tự:

1. Trạng thái active/published.
2. Tồn kho sản phẩm.
3. Slug và URL.
4. Placement của collection.
5. Sản phẩm đã được gán vào collection.
6. Đúng nguồn dữ liệu: collection HERO hay module Banner.
7. API public có trả dữ liệu không.
8. Thử tải lại trang và kiểm tra cả locale VI/EN.

### 22.5 Không có phí giao hàng

- Chọn đủ tỉnh/thành và khu vực.
- Nhập địa chỉ bắt buộc.
- Bấm kiểm tra lại sau mỗi thay đổi.
- Khu vực có thể chưa được hỗ trợ.
- Kiểm tra cấu hình shipping hoặc mapping đại lý ở backend.

### 22.6 Thanh toán VNPay trở về trạng thái chờ

- Không lấy query string trên trình duyệt làm kết luận.
- Mở lại chi tiết đơn sau một khoảng thời gian.
- Admin kiểm tra trạng thái thanh toán và mã giao dịch.
- Chỉ xử lý đơn là đã thanh toán khi backend xác nhận `PAID`.

## 23. Các giới hạn đã biết

1. Màn hình **Màu sắc** trong admin mới chưa có CRUD sử dụng được.
2. **Quên mật khẩu** chưa gọi backend và chưa gửi email.
3. **Liên hệ** đang dùng submit giả lập, chưa lưu/gửi dữ liệu thật.
4. Storefront hiện chưa cho khách chọn **biến thể/quy cách** khi thêm vào giỏ.
5. **Banner trang chủ** là module riêng, trong khi hero storefront mới lấy từ collection `HERO`.
6. Bộ lọc **sản phẩm cụ thể** tại Hệ thống phân phối đang bị vô hiệu hoá.
7. Nút tìm điểm bán không phải trigger chính; bộ lọc tự tải lại khi thay đổi.
8. Phiên đăng nhập hiện dùng token phía trình duyệt; chiến lược refresh token/cookie chưa hoàn thiện.
9. Backend trong workspace hiện có thể chưa chứa đầy đủ các module `/storefront/home`, cart, checkout và VNPay tương ứng với OpenAPI/generated client mới; cần xác nhận đúng backend deployment trước khi nghiệm thu end-to-end.

## 24. Quy tắc vận hành khuyến nghị

- Không xoá dữ liệu đã có liên kết nếu có thể dùng trạng thái Ẩn/Nháp/Đóng.
- Không đổi slug thường xuyên.
- Dùng số thứ tự cách nhau, ví dụ `10`, `20`, `30`, để dễ chèn nội dung sau này.
- Luôn kiểm tra storefront sau khi công bố.
- Không đánh dấu đơn đã thanh toán dựa trên ảnh chụp hoặc URL return; dùng trạng thái backend.
- Không cấp role admin cho tài khoản khách.
- Không nhập dữ liệu nhạy cảm vào ghi chú nội bộ hoặc HTML công khai.
- Ghi chú rõ lý do khi huỷ, thất bại hoặc hoàn tiền.
- Tối ưu ảnh trước khi tải lên.
- Kiểm tra cả tiếng Việt và tiếng Anh với nội dung song ngữ.

## 25. Kịch bản nghiệm thu nhanh

### 25.1 Catalog và mua hàng

1. Tạo danh mục active.
2. Tạo quy cách.
3. Tạo sản phẩm active, giá và tồn hợp lệ.
4. Mở storefront và tìm sản phẩm.
5. Mở PDP, thêm vào giỏ.
6. Tăng/giảm số lượng.
7. Đăng nhập.
8. Kiểm tra giỏ được gộp.
9. Nhập địa chỉ, lấy báo giá.
10. Tạo thanh toán VNPay.
11. Kiểm tra đơn xuất hiện ở admin và tài khoản khách.

### 25.2 Trang chủ

1. Tạo collection `HERO`, tải banner và bật active.
2. Tạo collection `HOME_SECTION`, chọn `Must try`.
3. Gán sản phẩm.
4. Mở trang chủ.
5. Kiểm tra hero, CTA, section và link collection.

### 25.3 Tuyển dụng

1. Tạo tin ở trạng thái Nháp.
2. Chuyển sang Đã đăng.
3. Mở storefront và tìm tin.
4. Gửi CV kiểm tra.
5. Mở Đơn ứng tuyển.
6. Chuyển trạng thái từ Mới → Đang xem xét.

### 25.4 Chính sách và điểm bán

1. Tạo policy active và kiểm tra `/policies`.
2. Tạo distributor active với map embed.
3. Mở `/about#distribution`.
4. Lọc theo tỉnh/thành và chọn điểm bán.
