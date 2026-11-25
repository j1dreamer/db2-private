# IPA private thử nghiệm và server Cloud

Đã tạo IPA **chưa ký**, dùng gameplay chuẩn Android và các bản vá private đã có. Chưa xác minh chạy native trên iPhone. Đây không phải IPA đã ký cài trực tiếp từ trình duyệt.

## Tải và cài trên Mac

**Trạng thái phân phối:** IPA đã build và kiểm tra trong workspace. GitHub release đang ở dạng draft, chưa có payload; thao tác tải payload lên bị automatic approval review từ chối vì chưa có ủy quyền rõ ràng cho công khai IPA dẫn xuất trên repo public. Chờ chủ dự án cho phép trước khi tiếp tục upload. Lệnh tải dưới đây chỉ hoạt động sau khi release được hoàn tất.

Tải source nhánh `route-342`, mở Terminal trong thư mục đó:

```sh
python3 Download-iOS.py
```

Công cụ tải 21 phần từ [bản phát hành iOS thử nghiệm](https://github.com/j1dreamer/db2-private/releases/tag/ios-private-dev-20261125), kiểm SHA-256 từng phần rồi ghép thành `DB2-Private-unsigned.ipa` (510.997.150 byte). Chạy lại sẽ dùng các phần đã tải đúng. Không ghép thủ công hoặc đổi đuôi ZIP thành IPA.

SHA-256 toàn IPA: `8653b63259b17b1645d290a4de304a4d4e45f5df66a2cc26f121b4290cf809e1`.

Mac cắm cáp có thể ký/cài IPA với công cụ như Sideloadly, dùng tài khoản Apple của chính bạn trên Mac:

1. Cắm iPhone, mở khóa và chọn tin cậy Mac khi được hỏi.
2. Mở công cụ ký trên Mac, chọn iPhone và IPA vừa tải; đăng nhập tài khoản Apple ngay trong công cụ đó rồi ký/cài. Không gửi mật khẩu, khóa riêng hoặc chứng chỉ ký lên repo/chat.
3. Làm theo yêu cầu Trust Developer/Developer Mode của iOS nếu xuất hiện.
4. Mở **DB2 Private Dev**. Lần đầu có bảng nhập server; lưu địa chỉ thực và khởi động lại. Tài khoản game tạo trên server riêng.

Chỉ cắm dây không tự tạo chữ ký. Nếu dùng Xcode/chứng chỉ riêng, cần provisioning profile hợp lệ cho bundle `com.j1dreamer.db2.private` và ký cả các dylib/framework liên quan. Profile và chữ ký tài nguyên cũ đã được gỡ khỏi gói thử nghiệm.

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

## Những gì đã thay đổi và kiểm tra

- Hai mục sửa trong IPA: `Info.plist` và `assets/main/index.jsc`. 17.261 mục còn lại được đọc lại và so byte với IPA gốc; native không đổi.
- 317 module gameplay dùng chuẩn Android đã chọn, hai module `resource`/`language` giữ bản iOS. Cùng danh mục 319 module, UUID script và cấu trúc thuộc tính Cocos đều được kiểm tra; 4.011 khóa tài nguyên Android có cùng ánh xạ ở iOS.
- Có chọn server HTTP/HTTPS, đăng nhập nội bộ, bản vá transport private, bỏ hướng dẫn và Speed 1–10. Khi chưa cấu hình endpoint thật, đi tới bảng chọn server mà không gọi địa chỉ mẫu `.invalid`.
- [Báo cáo build](analysis/ios/private-client-build.json), [kiểm tra khởi động JS](analysis/ios/private-client-setup-tests.json), [model thực từ IPA mới](analysis/ios/private-client-model-tests.json), [server đang chạy trên VM](analysis/ios/private-live-server-tests.json).
- Cần ký và kiểm thử trên iPhone để xác nhận hiển thị, cảm ứng, mạng native và toàn bộ gameplay. Chưa tuyên bố chơi hoàn chỉnh trên thiết bị.

Tái lập IPA từ archive gốc của chủ dự án:

```sh
python3 -m tools.build_ios_client ORIGINAL_IOS.ipa artifacts/DB2-Private-unsigned.ipa
```

Quá trình build dùng Node.js/Acorn, Cocos bundle Android trong repo và các bảng chuẩn; không cần khóa ký Apple.
