# Chạy DB2 trên Android + Tailscale

Bộ server hiện tại chạy bằng Python, SQLite và Node.js; không cần root hoặc VPS.
APK/IPA **BoxInfo** đều có nút **Server riêng** ở màn đăng nhập. Phần này được
kiểm tra trong mã đóng gói; chưa được thử trực tiếp trên thiết bị Android/iPhone.

## Cài server

1. Cài Termux từ [F-Droid](https://f-droid.org/packages/com.termux/) hoặc bản phát hành
   chính thức của Termux. Cài [Tailscale Android](https://tailscale.com/download/android)
   riêng như một ứng dụng VPN, không cài `tailscaled` trong Termux.
2. Giải nén source nhánh `eng-sp-sss` **vào thư mục home của Termux** (`$HOME`).
   Không chạy source trong `/sdcard` hay thư mục Downloads dùng chung vì môi trường
   Python cần quyền thực thi và liên kết tệp.
3. Trong đúng thư mục source, chạy:

   ```sh
   bash Setup-Termux.sh
   bash Start-Termux.sh
   ```

Setup cài Python, Node.js, công cụ biên dịch và thư viện Python vào `.venv`.
Các phần mở rộng C không bắt buộc của aiohttp được tắt để phù hợp Android.
Không cần `npm install` để chạy server. Lần sau chỉ chạy `bash Start-Termux.sh`.

## Kết nối APK / IPA

1. Bật Tailscale trên Android chạy server. Trong ứng dụng, lấy **IPv4 của chính
   Android đó**, dạng `100.x.x.x` (không lấy IP của iPhone/laptop).
2. Cài và bật Tailscale trên máy chơi: iPhone, Android khác, hoặc Windows nếu dùng
   BlueStacks. Các máy phải cùng tailnet hoặc được chia sẻ quyền truy cập. Nếu có
   ACL tùy chỉnh, cho phép máy chơi truy cập Android qua **TCP 20003**.
3. Thử trên trình duyệt của máy chơi:

   ```text
   http://100.x.x.x:20003/health
   ```

   Thay bằng IP thật. Phải nhận JSON `status: ok` trước khi mở game.
4. Ở màn đăng nhập game, chọn **Server riêng**, nhập:

   ```text
   http://100.x.x.x:20003
   ```

   Bấm **Lưu và khởi động lại**. Cả APK và IPA đều lưu địa chỉ này trên thiết bị.
   Không thêm `/health` vào địa chỉ trong game. IPA cần được ký hợp lệ trước khi cài.

Không cần ADB reverse khi chơi qua Tailscale; không cần mở cổng router hoặc bật
Tailscale Funnel. `Start-Termux.sh` lắng nghe các giao diện Android và trả địa chỉ
gate theo đúng host mà client dùng (`--public-host auto`), không trả nhầm `127.0.0.1`.
Nếu chơi ngay trên Android chạy server, có thể dùng `http://127.0.0.1:20003`.

## Quản trị và dữ liệu

- Trên Android chạy server: mở `http://127.0.0.1:20003`. Trên máy khác: mở địa chỉ
  Tailscale tương tự game bằng trình duyệt.
- Xem token tại Termux: `cat data/admin-token`. Token được tạo khi chạy server lần
  đầu; không có token cố định dùng chung trong source.
- Nhân vật, túi đồ, sự kiện và cấu hình quản trị được lưu trong `data/game.sqlite3`.
  Giữ thư mục `data` khi cập nhật source. Muốn sao lưu đơn giản: Ctrl+C dừng server
  trước, rồi sao chép cả `data` sang nơi riêng.
- Dừng bằng Ctrl+C. Khởi động lại bằng `bash Start-Termux.sh` từ cùng thư mục.

## Giữ server hoạt động

Cho Termux và Tailscale chạy nền, bỏ tối ưu pin cho cả hai và không vuốt tắt ứng dụng.
Script giữ wake lock trong lúc chạy và thả khi kết thúc. Android vẫn có thể dừng ứng
dụng khi thiếu RAM; đây không phải dịch vụ tự khởi động sau reboot hay máy chủ 24/7.
Node.js chạy mô phỏng trận đấu, nên tải thực tế phụ thuộc số người và số trận đồng
thời; chưa có số đo tải trên điện thoại của bạn.

Nếu `/health` chưa mở được: kiểm tra Termux còn chạy, Tailscale hai đầu còn Connected,
đúng IP Android, quyền TCP 20003 và cài đặt chạy nền. Nếu `/health` được mà game lỗi,
đối chiếu log `client_error` trong web quản trị; sửa mạng không thay thế sửa gameplay.
