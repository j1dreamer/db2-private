# Game public và web quản trị HTTPS · v9

Tên miền đã xác nhận: **db2.teck.io.vn**, DNS A trỏ **103.232.122.74**. Game và web dùng cùng hostname; không cần Tailscale cho người chơi sau khi triển khai HTTPS thành công. Trên APK/IPA nhập `https://db2.teck.io.vn` (không thêm `/admin` hoặc `:20003`). Địa chỉ cũ vẫn được lưu trên thiết bị; cần đổi một lần trong nút Server.

## Cài trên Ubuntu VPS

Tải `Setup-Public.sh` từ commit phát hành rồi chạy `sudo bash Setup-Public.sh db2.teck.io.vn` trong phiên SSH của bạn. Script gọi bộ cài Ubuntu ở chế độ `--loopback`, giữ database và backup. Không cần đăng nhập Tailscale trong chế độ này. Nếu gặp một web server hoặc Caddyfile không do DB2 quản lý, script dừng để tránh ghi đè website khác.

Caddy nghe TCP 80/443. Dịch vụ game chỉ nghe `127.0.0.1:20003`, không công khai cổng backend. Nếu UFW đang bật, script thêm luật TCP 80/443; firewall của nhà cung cấp phải cho hai cổng này. DNS A/AAAA phải trỏ đúng máy; không để AAAA cũ trỏ sang máy khác. Với Cloudflare, dùng DNS only trong lần cấp chứng chỉ đầu.

Script chỉ báo HTTPS đã xác minh sau khi `https://db2.teck.io.vn/health` có chứng chỉ hợp lệ và Node combat sẵn sàng, đồng thời `/admin` chưa đăng nhập trả 401. Nếu chưa đạt thì dừng và in hướng dẫn kiểm DNS/chứng chỉ; không yêu cầu bỏ qua lỗi TLS.

## Đăng nhập web

Mở `https://db2.teck.io.vn/admin`:

1. Trình duyệt hỏi username/password của lớp bảo vệ Caddy. Đọc riêng trên VPS: `sudo cat /etc/db2/public-admin-login.json`.
2. Trong giao diện DB2, nhập token quản trị: `sudo cat /var/lib/db2/admin-token`.

Không gửi hai thông tin này vào chat/repo. Username/password được tạo ngẫu nhiên, lưu file mode 600. Caddy chỉ nhận bcrypt hash; không ghi mật khẩu thô vào Caddyfile. Token vẫn kiểm trên mọi API quản trị. Đây là hai lớp kiểm tra, không gọi là xác thực TOTP/2FA.

Web gửi token qua `X-DB2-Admin-Token` để không đụng header `Authorization: Basic` của lớp Caddy. API script đi qua public HTTPS cũng phải cung cấp Basic login và header token này. Bearer cũ vẫn dùng trực tiếp qua loopback/SSH khi không qua Caddy.

Các endpoint game được liệt kê rõ (đăng ký, đăng nhập, cấu hình, báo lỗi, serverInfo, health, WebSocket `/`). Chỉ các endpoint đó đi qua không cần mật khẩu Caddy. `/admin`, tài nguyên quản trị và các đường không thuộc game đều phải đăng nhập. Header `X-Forwarded-For`/`X-DB2-Client-IP` từ bên ngoài không cấp quyền quản trị; ứng dụng kiểm TCP peer thật. Header IP riêng của proxy chỉ dùng đếm giới hạn thử đăng nhập khi proxy chạy loopback và được bật rõ trong env.

Có giới hạn thử đăng ký/đăng nhập, giới hạn số WebSocket, heartbeat/timeout, CSP, chống iframe, nosniff, no-referrer và no-store. Đây là bảo vệ ở ứng dụng/proxy; không phải cam kết chống mọi tấn công hoặc thay bảo vệ lưu lượng của nhà cung cấp.

## Time Peak

Nút Time Peak nổi là màn thử nghiệm do dự án thêm, không phải màn native có sẵn của client ENG. Luật thử gồm đường đi, máu tạm, mượn tướng và chọn blessing. Bản cũ gắn nút vào cả màn chiến đấu và có thể gây thao tác kẹt. PublicReady ẩn mặc định trên APK và IPA; kể cả khi developer bật thử thì chỉ gắn ở sảnh, không trên cảnh chiến đấu. Không xóa dữ liệu hoặc phần thưởng đã lưu của chế độ đó. Các map gameplay khác giữ nguyên.

## Nguồn, kiểm chứng và giới hạn

- Cấu hình theo tài liệu chính thức [Caddy automatic HTTPS](https://caddyserver.com/docs/automatic-https) và [basic_auth](https://caddyserver.com/docs/caddyfile/directives/basic_auth). Basic Auth chỉ dùng trên HTTPS ở production.
- `analysis/public-proxy-integration.json`: chạy Caddy thật, kiểm game không cần mật khẩu web, quản trị thiếu một trong hai credential bị 401, chặn đường mã hóa/traversal và gate trả host/port bên ngoài đúng.
- Kiểm proxy dùng HTTP trên loopback để test routing. Không coi đó là đã cấp/chạy chứng chỉ ACME thật trên VPS.
- APK giữ nguyên native/resources/manifest và chứng thư debug phát triển cũ, kiểm alignment/signature/CRC. IPA giữ sửa plugin khởi động, cần ký lại hợp lệ. Không bỏ kiểm chứng chỉ TLS; bundle CA Android có ISRG Root X1/X2.
- Cloud chưa SSH được vào VPS; DNS đã kiểm trỏ đúng nhưng HTTPS/triển khai thực tế và thao tác native trên iPhone/Android vẫn cần xác minh sau cài.

## Sửa bộ cài báo combat.available=false sau khi cài Node

Bộ cài cũ dùng `umask 077` rồi `cp -a` thư mục giải nén Node; thao tác này giữ mode 0700 của thư mục gốc vào `/opt/db2/node`. Root chạy được Node nhưng tài khoản dịch vụ `db2` không truy cập được. Bộ cài mới sửa quyền đọc/thực thi cây runtime và thử Node bằng `runuser -u db2` trước khi chuyển bản server. Đường dẫn Node được resolve trước khi kiểm tra để không vô tình dùng symlink tới nvm trong home bị systemd ProtectHome chặn.

Nếu gặp lỗi này, chạy lại **Setup-Public.sh bản đã sửa**; giữ database và backup như trước. Không dùng đường dẫn commit bộ cài cũ vì nó vẫn ghim Setup-Ubuntu.sh cũ. Không cần ký/cài lại APK/IPA cho lỗi Node trên VPS. Sau khi cài thành công kiểm `/health`: `combat.available` phải là `true`. HTTPS chỉ sẵn sàng khi bộ cài xác minh chứng chỉ thành công.

Kiểm hồi quy: `python3 -m unittest tests.test_ubuntu_node_install tests.test_node_runtime -v` (5 test). Test tái hiện mode 0700 bằng `cp -a` thật dưới umask 077 và kiểm quyền sau sửa; không coi kiểm cục bộ là đã xác minh systemd trên VPS người dùng.

## Ubuntu báo Unable to locate package caddy

Một số mirror/cấu hình Ubuntu tối giản không có gói Caddy. Setup-Public.sh mới thêm kho stable chính thức theo https://caddyserver.com/docs/install#debian-ubuntu-raspbian trước khi cài khi chưa có Caddy. Khóa GPG được dearmor vào keyring riêng, repository dùng signed-by; không tắt xác minh APT/TLS. Keyring và file sources được cài mode 0644 để APT đọc được ngay cả dưới umask 077. Nếu đã có Caddy, giữ nguyên cấu hình kho hiện có.

Chạy lại Setup-Public.sh mới, giữ nguyên database. Kiểm hồi quy: `python3 -m unittest tests.test_public_install tests.test_ubuntu_node_install tests.test_node_runtime -v` (7 test). Đã tải khóa và kiểm chữ ký InRelease thật của kho stable trong thư mục tạm; chưa chạy APT hoặc cấp chứng chỉ trên VPS người dùng.

## Safari cứ hỏi lại username/password

`tools/check_admin_login.py db2.teck.io.vn` kiểm tra mật khẩu trong file root-only có khớp bcrypt trong cấu hình DB2 hay không. Thêm `--repair` để đồng bộ hash nếu sai và reload Caddy ngay cả khi hash trên đĩa đúng nhưng cấu hình đang chạy chưa cập nhật. Giữ nguyên password/token/database. Công cụ chỉ chấp nhận entrypoint do DB2 quản lý và đúng một dòng username/bcrypt; backup cấu hình trước khi sửa, validate trước khi thay, không bỏ kiểm TLS.

Chạy bằng sudo trên VPS. Kiểm HTTP qua HTTPS hostname thật nhưng resolve tới loopback 127.0.0.1: không phụ thuộc kết nối hairpin qua IP public. Thành công khi không credential trả 401 và credential trong file trả 200 ở `/admin`; JSON có `edge_login_verified: true`. Credential curl nằm trong file tạm 0600, không xuất hiện trong argv hoặc report. Nếu kiểm thành công mà Safari vẫn hỏi lại, dùng tab Riêng tư và nhập lại đúng giá trị từ `/etc/db2/public-admin-login.json`. Token chỉ nhập sau khi qua lớp username/password. Không gửi file credential vào chat.

Test: `python3 -m unittest tests.test_admin_login_check -v` (5 test, subprocess được giả lập; không coi đây là xác minh đăng nhập thực tế trên VPS).

## v10 · Danh sách SP ENG và tạo lịch hàng loạt

Sau khi cập nhật, /health có build `eng-sp-sss-sp-schedule-v10`. Web → Sự kiện → Lịch SP & vé → Tạo lịch từ danh sách ENG. Không cần thay APK/IPA chỉ để thay lịch/thưởng. Không tự thêm hoặc thay lịch khi chạy bộ cập nhật. Username/password Caddy và token hiện có được giữ nguyên. Xem SP-EVENTS.md cho nguồn và giới hạn lịch gốc.

## Ghi nhớ token trên thiết bị

Ô đăng nhập token hiện có lựa chọn **Lưu token trên thiết bị này (30 ngày)**. Chỉ lưu sau khi server chấp nhận token, trong localStorage của đúng origin HTTPS đang mở. Tab mới/tải lại có thể dùng token đã lưu; hết hạn, token bị server từ chối hoặc bấm Đăng xuất sẽ xóa dữ liệu ghi nhớ (kể cả sessionStorage cũ). Nếu trình duyệt chặn storage, đăng nhập vẫn dùng được trong bộ nhớ tab và có thông báo không lưu được. 30 ngày là hạn lưu trên trình duyệt, không phải thay đổi hạn hoặc quyền của token server. Không chọn sẽ chỉ giữ trong bộ nhớ hiện tại. Dùng trên thiết bị riêng và Safari thường; tab Riêng tư/xóa dữ liệu website không giữ được lâu dài.

Username/password của Caddy không được lưu bằng JavaScript của web. Có thể lưu riêng trong ứng dụng Mật khẩu/Passwords hoặc password manager của trình duyệt cho `https://db2.teck.io.vn`; khả năng tự điền hộp HTTP Basic tùy trình duyệt. Không gộp token vào password Caddy.

Kiểm thực tế Chromium: `python3 -m tools.check_admin_browser --script admin_login.cjs`: 9 luồng, gồm tab mới, tải lại, đăng xuất trên mobile, hết hạn, token sai, dữ liệu JSON lỗi, không chọn ghi nhớ và storage bị chặn. Xem `analysis/admin-login-browser-tests.json`. Chưa kiểm trực tiếp Safari trên iPhone.
