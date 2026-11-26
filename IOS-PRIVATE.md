# IPA Long Chi Đảo VI — giữ riêng, chưa ký

Bản hiện tại **DB2-LongChiDao-VI-unsigned.ipa** dùng dữ liệu Long Chi Đảo #17327, 20 module gameplay chuyển vào khung ENG/iOS, tiếng Việt ENG + phần bổ sung và Speed 1–10×. Backend phải cập nhật cùng bộ luật. Xem [nguồn và phạm vi chuyển bản](LONG-CHI-DAO.md).

## Tệp và cách cài

Theo yêu cầu chủ dự án, **không có payload IPA trong repo public**. Tệp riêng nằm tại `/workspace/ios-private/DB2-LongChiDao-VI-unsigned.ipa`.

- Dung lượng: 511256922 byte.
- SHA-256: `30220eec7bd79567e81e356d554398833f3aa83eca6b634e40e5b351f85b13bd`.
- Bundle ID: `com.j1dreamer.db2.private`.
- Chưa ký, chưa kiểm chạy native iPhone. Các phần IPA cũ trong `/workspace/ios-private/release/` thuộc bản trước, không ghép chúng để lấy bản Long Chi Đảo này.

Tải qua đường riêng được hỗ trợ của workspace. Nếu chat không tải được tệp lớn, cần một nơi nhận riêng có quyền truy cập đã cấu hình; không có URL public thay thế được tạo. Việc tạo repo private qua connector ở lượt trước bị từ chối quyền 403; chủ tài khoản có thể tự tạo và cấp quyền nếu muốn dùng phương án đó.

Trên Mac, dùng công cụ ký như Sideloadly với tài khoản Apple của chính bạn:

1. Cắm iPhone, mở khóa và chọn tin cậy Mac.
2. Chọn IPA mới trong công cụ ký, đăng nhập Apple ngay trên Mac rồi ký/cài. Không gửi mật khẩu hoặc chứng chỉ lên chat/repo.
3. Bật Trust Developer/Developer Mode khi iOS yêu cầu.
4. Mở game, nhập endpoint server có thể truy cập thực sự rồi khởi động lại.

Chỉ cắm cáp không tạo chữ ký. Nếu dùng chứng chỉ riêng, provisioning phải hợp lệ cho bundle mới và ký cả framework/dylib liên quan. Gói thử nghiệm đã gỡ profile và chữ ký tài nguyên cũ.

## Kiểm tra bản dựng

Chỉ sửa `Info.plist` và `assets/main/index.jsc`; 17.261 mục giữ lại đã so byte với nguồn. Native Mach-O và thư viện giữ nguyên. Bộ 34 bảng/hằng đã đối chiếu với server; 8 ca chiến đấu headless cho cùng kết quả. Các kiểm tra này không xác nhận hiển thị, cảm ứng hoặc mạng native trên iPhone.

Báo cáo hiện tại: [build IPA](analysis/longzhidao-ios-build.json), [dữ liệu và chiến đấu](analysis/longzhidao-canonical-validation.json), [tổng kiểm thử](analysis/longzhidao-validation.json). Các báo cáo trong `analysis/ios/` mô tả giai đoạn kiểm tra/bản dựng trước.

Tái lập từ IPA gốc riêng của chủ dự án, cần Python + Node/Acorn:

```sh
python3 -m tools.build_ios_client ORIGINAL_IOS.ipa artifacts/DB2-LongChiDao-VI-unsigned.ipa
```

## Server trên máy ảo của cuộc chat

Server đã khởi chạy ở cổng **20003**, dữ liệu riêng ở `/workspace/db2-live`, có `/health`, HTTP tài khoản và Pomelo WebSocket. Token quản trị nằm ở `/workspace/db2-live/admin-token`, không đưa vào repo. Địa chỉ `127.0.0.1` ở đây chỉ dùng bên trong máy ảo.

Lệnh chạy lại trên cùng máy ảo nếu tiến trình đã dừng:

```sh
python3 -m server.app --bind 0.0.0.0 --public-host auto --port 20003 --data /workspace/db2-live
```

Không chạy thêm bản thứ hai khi cổng đang được server này sử dụng. `auto` trả host/port mà client thực sự dùng, phù hợp cầu nối SSH/Tailscale; HTTPS reverse proxy cần giữ Host và gửi `X-Forwarded-Proto: https` khi không có port trong Host. Cấu hình mặc định khác của server vẫn giữ nguyên.

Máy ảo phiên chat không có cam kết chạy liên tục sau khi phiên/runtime dừng. Dữ liệu SQLite phải được sao lưu riêng nếu cần giữ lâu dài.

## Kết nối từ iPhone: phần còn cần cấu hình

Môi trường hiện chỉ khai báo portal SSH, chưa có đường SSH đã xác minh hoặc inbound Tailscale hoạt động. Hướng dẫn nền tảng mô tả VPN của môi trường là đường **đi ra**, không cung cấp inbound trực tiếp cho game. Không có IP Tailscale máy ảo được tạo/xác minh ở lượt này.

Để tiếp tục giữ server trên Cloud:

1. Mở cùng cuộc chat bằng ứng dụng Codex trên Mac, nếu tài khoản có hỗ trợ kết nối máy ảo.
2. Trong **Edit Environment**, bật **SSH access** và chọn **Apply to this chat** khi có tùy chọn đó.
3. Kiểm tra lại SSH/khóa máy chủ hoặc công cụ forwarding mà ứng dụng cung cấp trước khi lập lệnh kết nối. Hiện chưa có fingerprint máy chủ được xác minh để ghi một lệnh SSH dùng ngay.
4. Mac và iPhone tham gia cùng Tailscale. Chuyển tiếp một cổng trên IP Tailscale của Mac vào cổng `20003` của server Cloud qua SSH. Mac phải giữ kết nối này khi chơi.
5. Khi đường truyền đã kiểm tra thành công, nhập `http://IP-TAILSCALE-CUA-MAC:CONG-CHUYEN-TIEP` trong bảng server của game.

**HTTP Previews** ở cổng `20003` có thể giúp mở web quản trị cho chủ môi trường; URL có đăng nhập của preview không thay thế kết nối mạng của native game. Chưa xác minh iPhone kết nối tới server này qua mạng ngoài máy ảo.
