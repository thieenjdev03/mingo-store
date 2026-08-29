# Mingo Store — Hướng dẫn sử dụng và quản trị dịch vụ

> Phiên bản tài liệu: 28/08/2026
> Đối tượng: quản trị viên và nhân viên vận hành phía khách hàng
> Phạm vi: các chức năng hiển thị trên storefront và trang Admin

## 1. Phạm vi bàn giao

Khách hàng có quyền sở hữu dịch vụ và thực hiện các thao tác vận hành hằng ngày
qua trang Admin. Source code, bảo trì kỹ thuật và các thay đổi hệ thống do bên
cung cấp kiểm soát.

Tài liệu này chỉ hướng dẫn:

- quản lý nội dung và dữ liệu trên Admin;
- theo dõi và xử lý đơn hàng;
- các chức năng khách hàng có thể sử dụng trên storefront;
- kết quả của mỗi thao tác trên giao diện;
- các giới hạn cần biết khi vận hành.

Không bao gồm source code, database, API, máy chủ, deploy hoặc cấu hình nội bộ.

## 2. Truy cập dịch vụ

| Khu vực | Đường dẫn |
|---|---|
| Storefront | URL triển khai do bên bàn giao cung cấp |
| Admin | `URL storefront/admin` |
| Đăng nhập Admin | `URL storefront/admin/login` |

Storefront hỗ trợ hai ngôn ngữ:

- Tiếng Việt: URL không có prefix ngôn ngữ.
- English: URL có prefix `/en`.

Admin hiện dùng tiếng Việt và không có prefix ngôn ngữ.

## 3. Vai trò sử dụng

| Vai trò | Quyền sử dụng |
|---|---|
| Khách truy cập | Xem sản phẩm, thương hiệu, điểm bán, chính sách, tuyển dụng; dùng giỏ hàng và gửi đơn ứng tuyển |
| Khách hàng đăng nhập | Các quyền của khách truy cập; xem tài khoản, đơn hàng, điểm thưởng và địa chỉ giao hàng |
| Quản trị viên | Sử dụng toàn bộ module Admin, quản lý dữ liệu và vận hành đơn hàng |

Chỉ tài khoản có vai trò **Quản trị** mới truy cập được Admin.

## 4. Sơ đồ chức năng

### 4.1 Storefront

- Trang chủ
- Dòng sản phẩm
- Thương hiệu
- Tìm kiếm sản phẩm
- Chi tiết sản phẩm và biến thể
- Giỏ hàng
- Thanh toán
- Tài khoản và lịch sử đơn hàng
- Điểm thưởng
- Về Mingo và hệ thống phân phối
- Hợp tác
- Câu hỏi thường gặp
- Chính sách
- Tuyển dụng và ứng tuyển
- Liên hệ

### 4.2 Admin

| Nhóm | Module |
|---|---|
| Tổng quan | Bảng điều khiển |
| Sản phẩm | Sản phẩm, Thương hiệu, Danh mục, Bộ sưu tập, Quy cách |
| Vận hành | Đơn hàng, Nhà phân phối, Tuyển dụng, Đơn ứng tuyển |
| Nội dung | Banner trang chủ, Chính sách |
| Hệ thống | Người dùng, Nhật ký hệ thống |

Module **Màu sắc** hiện chưa nằm trong menu Admin và chưa dùng cho vận hành.

## 5. Quy tắc thao tác chung trên Admin

- **Thêm**: mở form tạo dữ liệu mới.
- **Sửa**: chọn biểu tượng bút chì ở dòng tương ứng.
- **Xóa**: chọn biểu tượng thùng rác và xác nhận.
- **Tìm kiếm**: nhập từ khóa vào ô tìm kiếm của module.
- **Lọc**: chọn trạng thái hoặc nhóm dữ liệu tương ứng.
- **Phân trang**: dùng điều hướng ở cuối bảng khi danh sách có nhiều dữ liệu.
- **Lưu**: chờ thông báo thành công trước khi đóng form hoặc chuyển màn hình.

Không bấm **Lưu** nhiều lần liên tiếp khi form đang hiển thị trạng thái đang xử lý.

Khi không chắc có nên xóa dữ liệu hay không, ưu tiên dùng trạng thái **Ẩn**,
**Nháp** hoặc **Đã đóng** nếu module có hỗ trợ.

## 6. Quản lý sản phẩm

Đường dẫn: `/admin/products`

### 6.1 Danh sách sản phẩm

Có thể:

- tìm theo tên;
- lọc theo trạng thái;
- lọc theo danh mục;
- lọc theo thương hiệu;
- xem giá, tồn kho, danh mục, thương hiệu và trạng thái;
- sửa hoặc xóa sản phẩm.

### 6.2 Trạng thái sản phẩm

| Trạng thái | Ý nghĩa |
|---|---|
| Đăng bán | Có thể hiển thị và mua nếu còn hàng |
| Nháp | Chưa công bố |
| Ẩn | Tạm ngừng hiển thị |

Sản phẩm chỉ được mua khi đang **Đăng bán** và còn tồn kho. Nếu sản phẩm có
biến thể, chỉ cần một biến thể còn hàng để sản phẩm có thể hiển thị; biến thể
hết hàng sẽ không thể chọn mua.

### 6.3 Tạo hoặc sửa sản phẩm

Form sản phẩm gồm các nhóm thông tin sau:

| Nhóm | Trường |
|---|---|
| Nội dung tiếng Việt | Tên, slug, mô tả, thành phần & chất gây dị ứng, hướng dẫn sử dụng, chú ý |
| Nội dung English | Product name, slug, description, ingredients & allergen information, usage instructions, notes |
| Catalog | Danh mục, thương hiệu |
| Bán hàng | Giá, giá khuyến mãi, tồn kho, SKU |
| Hiển thị | Trạng thái, `LH Báo Giá`, nhãn giảm giá |
| Hình ảnh | Ảnh sản phẩm |
| Quy cách | Các biến thể theo quy cách |

Quy trình đề xuất:

1. Nhập nội dung tiếng Việt.
2. Mở tab **English** và thay nội dung bằng bản dịch thực tế.
3. Tải ảnh sản phẩm.
4. Chọn danh mục và thương hiệu nếu có.
5. Nhập giá, tồn kho và SKU.
6. Chọn trạng thái.
7. Bật các tùy chọn hiển thị nếu cần.
8. Thêm biến thể nếu sản phẩm có nhiều quy cách.
9. Dùng **Bản xem trước** để kiểm tra nội dung.
10. Chọn **Lưu**.

### 6.4 Nội dung song ngữ

Tên sản phẩm tiếng Việt là thông tin chính. Tên English có thể được điền sẵn
theo tiếng Việt nhưng cần được thay bằng bản dịch trước khi công bố.

Các trường nội dung dài hỗ trợ HTML cơ bản như đoạn văn, in đậm, danh sách có
thứ tự và danh sách gạch đầu dòng. Không chèn script hoặc nội dung nhúng không
được yêu cầu.

### 6.5 Giá, tồn kho và SKU

- Nhập giá bằng số, không nhập dấu chấm hoặc dấu phẩy. Ví dụ: `120000`.
- **Giá** là giá bán thông thường.
- **Giá KM** là giá khuyến mãi nếu có.
- **Tồn kho** là số lượng có thể bán.
- **SKU** là mã quản lý sản phẩm.
- Khi có biến thể, giá và tồn kho nên được quản lý ở từng biến thể.
- Khi có biến thể, tổng tồn sản phẩm được tính từ tồn của các biến thể.

### 6.6 `LH Báo Giá`

Bật **LH Báo Giá** khi sản phẩm không hiển thị giá cố định trên storefront.
Khách sẽ thấy nút liên hệ thay cho nút mua và giá bán sẽ được ẩn.

Khi bật tùy chọn này, giá và tồn kho không bắt buộc phải nhập. Không bật tùy
chọn này nếu khách cần mua trực tiếp trên website.

### 6.7 Biến thể theo quy cách

Mỗi biến thể có:

- tên biến thể;
- quy cách;
- SKU;
- giá;
- tồn kho;
- ảnh riêng nếu cần.

Trên storefront, khách có thể chọn quy cách/biến thể trước khi chọn số lượng và
thêm vào giỏ. Biến thể hết hàng được hiển thị nhưng không thể chọn.

Trước khi tạo biến thể, nên tạo quy cách ở module **Quy cách** trước.

### 6.8 Hình ảnh

- Tải tối đa 5 ảnh cho một sản phẩm.
- Mỗi ảnh tối đa 5 MB.
- Hỗ trợ các định dạng ảnh phổ biến như PNG, JPG/JPEG và WebP.
- Ảnh đầu tiên được dùng làm ảnh đại diện.
- Nên dùng ảnh cùng tỷ lệ và tối ưu dung lượng trước khi tải lên.

## 7. Quản lý thương hiệu

Đường dẫn: `/admin/brands`

### 7.1 Chức năng

- tạo thương hiệu;
- sửa thương hiệu;
- xóa thương hiệu;
- tìm theo tên, slug hoặc mô tả;
- lọc **Đang hiển thị** / **Đang ẩn**;
- sắp xếp thứ tự hiển thị.

### 7.2 Thông tin thương hiệu

| Trường | Cách dùng |
|---|---|
| Tên thương hiệu | Tên hiển thị trên storefront |
| Slug | Đường dẫn; bỏ trống để tự sinh |
| Logo | Logo thương hiệu |
| Mô tả | Mô tả ngắn |
| Thứ tự hiển thị | Số nhỏ hiển thị trước |
| Trạng thái | Đang hiển thị hoặc Đang ẩn |

Thương hiệu đang được gán cho sản phẩm không nên xóa nếu vẫn cần giữ liên kết
catalog. Có thể chuyển sang **Đang ẩn**.

## 8. Quản lý danh mục

Đường dẫn: `/admin/categories`

### 8.1 Thông tin danh mục

- tên;
- slug;
- mô tả;
- ảnh;
- danh mục cha khi tạo mới;
- thứ tự hiển thị;
- trạng thái kích hoạt.

Danh mục hỗ trợ cấu trúc cha/con. Khi tạo danh mục cấp con, chọn danh mục cha.

### 8.2 Tác động tới storefront

Danh mục được dùng để:

- nhóm sản phẩm;
- tạo menu dòng sản phẩm;
- tạo trang danh mục;
- lọc sản phẩm;
- giới hạn phạm vi áp dụng của một số quy cách;
- lọc điểm bán.

Không nên đổi slug sau khi đã công bố vì đường dẫn danh mục cũ có thể không còn
truy cập đúng.

## 9. Quản lý bộ sưu tập

Đường dẫn: `/admin/collections`

Bộ sưu tập dùng để nhóm sản phẩm và có thể tạo một khối sản phẩm trên trang
chủ.

### 9.1 Tạo hoặc sửa bộ sưu tập

| Trường | Cách dùng |
|---|---|
| Tên | Tên bộ sưu tập |
| Slug | Đường dẫn; bỏ trống để tự sinh |
| Mô tả | Nội dung giới thiệu |
| Hiển thị trên trang chủ | Bật để tạo khối sản phẩm trên trang chủ |
| Kích hoạt | Bật để công bố |

### 9.2 Gán sản phẩm

1. Tại dòng bộ sưu tập, chọn biểu tượng **Sản phẩm**.
2. Tìm sản phẩm cần thêm.
3. Chọn biểu tượng thêm.
4. Gỡ sản phẩm khỏi bộ sưu tập khi cần.

Một bộ sưu tập chỉ hiển thị thành khối trên trang chủ khi bộ sưu tập đang kích
hoạt, được bật hiển thị trên trang chủ và có sản phẩm đang hiển thị.

### 9.3 Tác động tới storefront

- Bộ sưu tập có thể mở thành trang riêng từ liên kết trên storefront.
- Bộ sưu tập bật hiển thị trang chủ sẽ xuất hiện sau phần banner và thương hiệu.
- Sau khi cập nhật, cần kiểm tra trang chủ và trang bộ sưu tập.

## 10. Quản lý quy cách

Đường dẫn: `/admin/sizes`

Quy cách là nhãn đóng gói/kích cỡ dùng cho biến thể sản phẩm, ví dụ `Cây 65gr`,
`Hộp 250ml` hoặc `24 cây / thùng`.

### 10.1 Thông tin quy cách

| Trường | Cách dùng |
|---|---|
| Nhãn quy cách | Nhãn hiển thị nguyên văn trên sản phẩm |
| Phạm vi danh mục | Có thể chọn nhiều danh mục |

Không chọn danh mục nghĩa là quy cách dùng chung toàn hệ thống. Chọn danh mục
nghĩa là quy cách chỉ xuất hiện khi sản phẩm thuộc danh mục đó.

### 10.2 Thứ tự thao tác

1. Tạo danh mục nếu cần.
2. Tạo quy cách.
3. Gán phạm vi danh mục nếu cần.
4. Mở sản phẩm và thêm biến thể.

Không nên xóa quy cách đang được sử dụng trong biến thể sản phẩm.

## 11. Quản lý banner trang chủ

Đường dẫn: `/admin/homepage-banners`

### 11.1 Thông tin banner

| Trường | Cách dùng |
|---|---|
| Ảnh banner | Bắt buộc; dùng làm ảnh hiển thị hoặc ảnh dự phòng |
| Video nền | Không bắt buộc; hỗ trợ video MP4 tự phát, tắt tiếng và lặp lại |
| Alt text | Mô tả ảnh cho SEO và khả năng tiếp cận |
| Link khi click | Trang khách được chuyển tới khi chọn banner |
| Thứ tự hiển thị | Số nhỏ hiển thị trước |
| Hiển thị trên trang chủ | Bật/tắt banner |

### 11.2 Lưu ý hiển thị

Trang chủ luôn có một banner campaign mặc định của Mingo ở slide đầu. Banner do
Admin tạo sẽ nối tiếp phía sau banner mặc định theo thứ tự đã đặt.

Sau khi lưu, kiểm tra:

- banner có xuất hiện trên trang chủ;
- link click có đúng không;
- ảnh hiển thị tốt trên desktop và mobile;
- video có ảnh poster dự phòng phù hợp.

## 12. Quản lý chính sách

Đường dẫn Admin: `/admin/policies`
Đường dẫn storefront: `/policies`

### 12.1 Thông tin chính sách

- tiêu đề;
- slug;
- nội dung;
- thứ tự hiển thị;
- trạng thái kích hoạt.

Nội dung chính sách hỗ trợ HTML cơ bản. Chính sách chỉ hiển thị công khai khi
đang **Kích hoạt**.

### 12.2 Sau khi cập nhật

1. Lưu chính sách.
2. Mở `/policies`.
3. Chọn chính sách từ danh sách.
4. Kiểm tra nội dung và thứ tự hiển thị.

Không đổi slug nếu chính sách đã được liên kết trong nội dung hoặc luồng thanh
toán, trừ khi đã kiểm tra lại các liên kết liên quan.

## 13. Quản lý nhà phân phối và điểm bán

Đường dẫn Admin: `/admin/distributors`
Đường dẫn storefront: phần **Hệ thống phân phối** trong `/about`

### 13.1 Thông tin điểm bán

| Trường | Cách dùng |
|---|---|
| Tên | Tên điểm bán/nhà phân phối |
| Địa chỉ | Địa chỉ hiển thị |
| Tỉnh/Thành | Chọn từ danh sách |
| Phường/Xã | Chọn sau khi chọn tỉnh/thành |
| Khu vực | Thông tin bổ sung, không bắt buộc |
| Mô tả | Nội dung giới thiệu |
| Mã nhúng Google Maps | Thẻ iframe hoặc URL embed |
| Danh mục | Dòng sản phẩm có tại điểm bán |
| Bộ sưu tập | Bộ sưu tập liên quan nếu có |
| Đang hoạt động | Bật để hiển thị công khai |

### 13.2 Cách nhập Google Maps

1. Mở địa điểm trên Google Maps.
2. Chọn **Chia sẻ**.
3. Chọn **Nhúng bản đồ**.
4. Sao chép thẻ iframe hoặc URL embed.
5. Dán vào trường **Mã nhúng Google Maps**.

### 13.3 Khách tìm điểm bán

Khách có thể lọc theo:

- dòng sản phẩm/danh mục;
- tỉnh/thành;
- phường/xã.

Bộ lọc sản phẩm cụ thể hiện chưa hoạt động. Nút tìm kiếm có trên giao diện,
nhưng dữ liệu tự tải lại khi thay đổi bộ lọc.

## 14. Quản lý tuyển dụng

Đường dẫn Admin: `/admin/careers`
Đường dẫn storefront: `/careers`

### 14.1 Trạng thái tin tuyển dụng

| Trạng thái | Ý nghĩa |
|---|---|
| Nháp | Chưa hiển thị công khai |
| Đã đăng | Hiển thị trên storefront và nhận hồ sơ |
| Đã đóng | Ngừng nhận hồ sơ |

### 14.2 Tạo hoặc sửa tin

| Trường | Cách dùng |
|---|---|
| Tiêu đề | Tên vị trí |
| Slug | Đường dẫn; bỏ trống để tự sinh |
| Bộ phận | Nhóm công việc |
| Địa điểm | Nơi làm việc |
| Cấp bậc | Cấp độ vị trí |
| Nội dung | Mô tả công việc, yêu cầu và quyền lợi |
| Ảnh bìa | Ảnh cho trang chi tiết |
| Trạng thái | Nháp, Đã đăng hoặc Đã đóng |
| Ghim | Đánh dấu tin nổi bật |

Nên lưu ở trạng thái **Nháp**, kiểm tra nội dung và chuyển sang **Đã đăng** khi
đã sẵn sàng.

### 14.3 Nhận hồ sơ

Khách mở tin đã đăng, điền:

- họ và chữ lót;
- tên;
- email;
- số điện thoại;
- thư giới thiệu không bắt buộc;
- CV bắt buộc;
- liên kết portfolio hoặc hồ sơ mạng xã hội không bắt buộc;
- xác nhận đồng ý chính sách bảo mật.

CV hỗ trợ `.pdf`, `.doc`, `.docx`, tối đa 5 MB.

## 15. Quản lý đơn ứng tuyển

Đường dẫn: `/admin/career-applications`

Có thể:

- tìm theo tên hoặc email;
- lọc theo trạng thái;
- lọc theo tin tuyển dụng;
- xem chi tiết hồ sơ;
- mở CV;
- cập nhật trạng thái ngay trên danh sách.

### 15.1 Trạng thái hồ sơ

| Trạng thái | Ý nghĩa |
|---|---|
| Mới | Hồ sơ vừa nhận |
| Đang xem xét | Đang đánh giá hồ sơ |
| Đã tuyển | Đã chọn ứng viên |
| Từ chối | Không tiếp tục quy trình |

Quy trình đề xuất: **Mới → Đang xem xét → Đã tuyển** hoặc **Từ chối**.

## 16. Quản lý đơn hàng

Đường dẫn: `/admin/orders`

### 16.1 Danh sách đơn hàng

Có thể:

- tìm theo mã đơn, tên hoặc số điện thoại người nhận;
- lọc theo trạng thái đơn;
- lọc theo trạng thái thanh toán;
- lọc theo khoảng thời gian;
- xem số đơn khớp bộ lọc;
- xem số đơn chờ thanh toán;
- xem doanh thu đã thu trong khoảng thời gian.

### 16.2 Trạng thái thanh toán

| Trạng thái | Ý nghĩa |
|---|---|
| Chờ xử lý | Chưa có xác nhận thanh toán cuối cùng |
| Thanh toán thành công | Đã xác nhận thanh toán |
| Thanh toán thất bại | Thanh toán không thành công |

Trạng thái thanh toán và trạng thái đơn hàng là hai thông tin riêng. Không tự
đánh dấu đơn đã thanh toán chỉ dựa trên ảnh chụp hoặc thông báo phía trình
duyệt.

### 16.3 Trạng thái đơn hàng

Luồng thông thường:

```text
Chờ thanh toán
→ Đã thanh toán / xác nhận
→ Đã đóng gói & sẵn sàng
→ Đang vận chuyển
→ Giao thành công
```

Trạng thái ngoại lệ có thể gồm:

- Kho QC / kiểm tra;
- Đã hủy;
- Chuyển hoàn;
- Đã hoàn tiền.

Chỉ chọn bước tiếp theo được hệ thống cho phép. Không chuyển trạng thái để bỏ
qua một bước nghiệp vụ chưa hoàn tất.

### 16.4 Chi tiết đơn hàng

Chi tiết đơn gồm:

- mã đơn và ngày tạo;
- thông tin người nhận và địa chỉ;
- ghi chú của khách;
- tài khoản đặt hàng nếu có;
- phương thức và trạng thái thanh toán;
- sản phẩm, biến thể, số lượng và đơn giá;
- tạm tính, giảm giá, phí vận chuyển và tổng tiền;
- lịch sử trạng thái;
- mã vận đơn và đơn vị vận chuyển;
- ghi chú nội bộ.

### 16.5 Cập nhật đơn hàng

1. Mở chi tiết đơn.
2. Chọn trạng thái tiếp theo.
3. Nhập ghi chú nếu cần.
4. Chọn **Áp dụng**.
5. Kiểm tra lại lịch sử trạng thái.

Mã vận đơn, đơn vị vận chuyển và ghi chú nội bộ được lưu bằng thao tác **Lưu
thông tin** riêng.

### 16.6 Cảnh báo tồn kho

Đơn chờ thanh toán có thể hiển thị cảnh báo chưa giữ tồn kho. Khi gặp cảnh báo:

1. kiểm tra tồn kho thực tế;
2. không cam kết hàng với khách khi chưa xác nhận;
3. xử lý thanh toán hoặc liên hệ khách sớm;
4. không đổi trạng thái chỉ để ẩn cảnh báo.

## 17. Quản lý người dùng

Đường dẫn: `/admin/users`

### 17.1 Chức năng

- tìm theo email;
- lọc theo vai trò;
- tạo người dùng;
- sửa thông tin người dùng;
- đổi mật khẩu;
- đổi vai trò;
- xóa người dùng.

### 17.2 Vai trò

| Vai trò | Ý nghĩa |
|---|---|
| Khách hàng | Sử dụng storefront và tài khoản mua hàng |
| Quản trị | Truy cập Admin và quản lý dịch vụ |

### 17.3 Tạo người dùng

Khi tạo mới, nhập:

- số điện thoại;
- mật khẩu;
- vai trò;
- ghi chú hồ sơ nếu cần.

Khi sửa, có thể cập nhật email, mật khẩu mới, vai trò và ghi chú hồ sơ. Chỉ cấp
vai trò **Quản trị** cho người thực sự cần quyền vận hành.

Không nên xóa tài khoản đang liên quan tới lịch sử đơn hàng nếu dữ liệu lịch sử
vẫn cần được lưu.

## 18. Nhật ký hệ thống

Đường dẫn: `/admin/audit-logs`

Nhật ký ghi nhận các thao tác **Tạo mới**, **Cập nhật** và **Xóa** trên các
module quản trị.

Có thể lọc theo:

- từ ngày và đến ngày;
- module;
- loại thao tác;
- người thực hiện;
- đối tượng hoặc ID đối tượng.

Mở chi tiết nhật ký để xem giá trị cũ, giá trị mới và thông tin request khi có.
Sử dụng module này để truy vết các thay đổi bất thường hoặc xác định người đã
thực hiện một thao tác.

## 19. Chức năng trên storefront

### 19.1 Trang chủ

Khách có thể:

- xem banner campaign mặc định;
- xem banner do Admin quản lý;
- mở liên kết từ banner;
- xem thương hiệu;
- xem các bộ sưu tập được bật hiển thị trên trang chủ;
- mở trang sản phẩm hoặc bộ sưu tập.

### 19.2 Dòng sản phẩm, thương hiệu và tìm kiếm

Khách có thể:

- mở **Dòng sản phẩm** để xem catalog;
- lọc theo danh mục từ menu hoặc trang danh mục;
- mở **Thương hiệu** để xem các thương hiệu;
- tìm sản phẩm bằng biểu tượng tìm kiếm;
- mở trang chi tiết sản phẩm từ kết quả.

### 19.3 Chi tiết sản phẩm

Trang chi tiết có thể hiển thị:

- ảnh sản phẩm;
- tên và thương hiệu;
- danh mục và bộ sưu tập;
- giá hoặc nhãn liên hệ nhận giá;
- biến thể/quy cách;
- mô tả;
- thành phần và chất gây dị ứng;
- hướng dẫn sử dụng;
- chú ý;
- mã vạch nếu có;
- sản phẩm gợi ý.

Nếu sản phẩm có nhiều biến thể, khách chọn biến thể trước khi chọn số lượng và
thêm vào giỏ.

### 19.4 Giỏ hàng

Khách có thể:

- tăng hoặc giảm số lượng;
- xóa một sản phẩm;
- xóa toàn bộ giỏ hàng;
- xem tạm tính;
- tiếp tục mua sắm;
- chuyển sang thanh toán.

Giá và tồn kho được kiểm tra lại khi cập nhật giỏ hoặc thanh toán. Nếu dữ liệu
đã thay đổi, giỏ có thể hiển thị cảnh báo và tạm khóa nút thanh toán.

### 19.5 Đăng ký, đăng nhập và khôi phục mật khẩu

Đăng ký yêu cầu:

- tên và họ;
- email;
- số điện thoại;
- mật khẩu tối thiểu 8 ký tự;
- xác nhận mật khẩu.

Sau khi nhập form đăng ký, khách nhận OTP qua email và nhập OTP để xác thực
tài khoản.

Đăng nhập dùng email và mật khẩu. Chọn **Quên mật khẩu** để:

1. nhập email;
2. nhận OTP;
3. nhập OTP và mật khẩu mới;
4. quay lại đăng nhập.

### 19.6 Tài khoản

Sau khi đăng nhập, khách có thể:

- xem thông tin cá nhân;
- chỉnh sửa tên, email, số điện thoại, quốc gia và phần giới thiệu;
- lưu địa chỉ giao hàng mặc định;
- xem đơn hàng gần đây;
- mở toàn bộ lịch sử đơn hàng;
- xem điểm thưởng và lịch sử điểm;
- đăng xuất.

### 19.7 Điểm thưởng

Tài khoản hiển thị:

- số điểm hiện có;
- tiến độ tới mốc nhận thưởng nếu chương trình đang hoạt động;
- lịch sử tích điểm và hoàn điểm;
- phân trang lịch sử khi có nhiều giao dịch.

Điểm được tính theo dữ liệu hệ thống và chỉ được cập nhật theo các đơn đủ điều
kiện. Không chỉnh điểm trực tiếp từ storefront.

### 19.8 Thanh toán

Khách có thể thanh toán với hoặc không cần đăng nhập. Đăng nhập giúp khách xem
lịch sử đơn hàng và điểm thưởng trong tài khoản.

Thông tin thanh toán gồm:

- thông tin người đặt;
- thông tin người nhận;
- tỉnh/thành và khu vực;
- địa chỉ cụ thể;
- ghi chú;
- yêu cầu xuất hóa đơn điện tử và email nhận hóa đơn nếu cần;
- phương thức giao hàng;
- phương thức thanh toán.

Quy trình:

1. Mở giỏ hàng và chọn **Thanh toán**.
2. Nhập hoặc chọn địa chỉ giao hàng.
3. Chọn **Kiểm tra khu vực và phí giao hàng**.
4. Kiểm tra tạm tính, phí vận chuyển và tổng tiền.
5. Chọn phương thức thanh toán.
6. Đồng ý với chính sách bảo mật và điều khoản sử dụng.
7. Chọn nút đặt hàng tương ứng.

Các phương thức hiện có:

- **Thanh toán khi nhận hàng (COD)**: thanh toán cho nhân viên giao hàng.
- **Chuyển khoản qua VietQR**: quét mã QR và chuyển đúng số tiền, đúng nội dung
  chuyển khoản. Đơn chờ đội ngũ xác nhận thủ công.

Nếu thay đổi địa chỉ sau khi đã kiểm tra phí, cần bấm kiểm tra lại để tạo báo giá
mới.

### 19.9 Theo dõi đơn hàng

Trong **Tài khoản → Lịch sử đơn hàng**, khách xem được:

- trạng thái thanh toán;
- trạng thái đơn;
- sản phẩm và biến thể;
- địa chỉ;
- phí vận chuyển;
- tổng tiền;
- phương thức giao hàng.

Với đơn VietQR đang chờ xác nhận, khách không nên chuyển khoản lặp lại ngay.
Hãy kiểm tra lại chi tiết đơn sau khi đội ngũ Mingo xác nhận thanh toán.

### 19.10 Điểm bán và các trang nội dung

Khách có thể:

- tìm điểm bán theo dòng sản phẩm, tỉnh/thành và phường/xã;
- xem bản đồ của điểm bán;
- xem thông tin Về Mingo;
- xem Hợp tác;
- xem Câu hỏi thường gặp;
- xem Chính sách;
- xem các tin tuyển dụng;
- gửi hồ sơ ứng tuyển;
- gửi form liên hệ.

## 20. Checklist vận hành hằng ngày

### Catalog

- [ ] Sản phẩm có tên và nội dung đúng ngôn ngữ.
- [ ] Sản phẩm có danh mục/thương hiệu phù hợp.
- [ ] Giá, tồn kho và SKU chính xác.
- [ ] Biến thể có đủ quy cách, giá, tồn và SKU.
- [ ] Ảnh hiển thị đúng.
- [ ] Trạng thái đúng trước khi công bố.
- [ ] Đã kiểm tra trang chi tiết và giỏ hàng.

### Nội dung

- [ ] Banner có ảnh và link đúng.
- [ ] Banner đã bật hiển thị.
- [ ] Bộ sưu tập đã gán sản phẩm.
- [ ] Chính sách đã bật hiển thị.
- [ ] Tin tuyển dụng chỉ chuyển sang Đã đăng khi nội dung hoàn chỉnh.
- [ ] Nhà phân phối có địa chỉ và bản đồ hợp lệ.

### Đơn hàng

- [ ] Kiểm tra trạng thái thanh toán riêng với trạng thái đơn.
- [ ] Kiểm tra cảnh báo tồn kho.
- [ ] Xác nhận địa chỉ và số điện thoại.
- [ ] Chuyển đúng trạng thái tiếp theo.
- [ ] Ghi chú các trường hợp hủy, chuyển hoàn hoặc hoàn tiền.
- [ ] Lưu mã vận đơn và đơn vị vận chuyển.

## 21. Giới hạn hiện tại cần biết

1. Module **Màu sắc** chưa có trong menu Admin và không dùng cho vận hành.
2. Form **Liên hệ** hiện hiển thị xác nhận gửi ở giao diện nhưng chưa có luồng
   lưu/gửi yêu cầu thật phía hệ thống.
3. Bộ lọc **sản phẩm cụ thể** trong phần điểm bán đang bị vô hiệu hóa; chỉ lọc
   theo dòng sản phẩm/danh mục, tỉnh/thành và phường/xã.
4. Chương trình điểm thưởng và mốc nhận thưởng phụ thuộc cấu hình triển khai;
   chỉ xem thông tin đang hiển thị trong tài khoản là thông tin áp dụng.
5. Banner campaign mặc định trên trang chủ luôn tồn tại; banner Admin được hiển
   thị nối tiếp theo thứ tự.

## 22. Khi cần hỗ trợ

Khi báo lỗi, gửi kèm:

- module hoặc URL đang sử dụng;
- thời điểm xảy ra lỗi;
- tài khoản/role đang đăng nhập;
- mã đơn, mã sản phẩm hoặc ID dữ liệu liên quan nếu có;
- ảnh chụp thông báo lỗi;
- các bước đã thực hiện trước khi lỗi xảy ra.

Không gửi mật khẩu, mã OTP hoặc thông tin thanh toán nhạy cảm qua kênh hỗ trợ.
