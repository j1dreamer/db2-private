# Kiểm tra server cũ bằng iPhone + iSH

Cài **iSH Shell** từ App Store và bật Tailscale trên iPhone, cùng tailnet hoặc được
chia sẻ quyền truy cập máy chạy server. Không cần laptop hoặc cài IPA để chạy công cụ.

Trong iSH:

```sh
apk update && apk add python3 py3-aiohttp curl
curl -fL https://raw.githubusercontent.com/j1dreamer/db2-private/eng-sp-sss/tools/legacy_client_probe.py -o gm-test.py
python3 gm-test.py --server http://IP-TAILSCALE:20003 --check-only
```

Thay `IP-TAILSCALE` bằng IP server thật. `HEALTH OK`, hoặc HTTP 404 cho biết có HTTP
endpoint phản hồi, mới chuyển sang bước đăng ký. Kiểm tra này không tạo tài khoản
và không gửi lệnh GM. Nếu timeout/connection error/HTTP 503, kiểm tra Tailscale,
ACL và server đang chạy trước; công cụ không thể tự thêm iPhone vào tailnet.

Chạy kiểm tra đầy đủ:

```sh
python3 gm-test.py --server http://IP-TAILSCALE:20003
```

- Nhập mã mời hợp lệ nếu server yêu cầu; nếu không cần thì Enter. Khi nhập mã,
  màn hình không hiện ký tự. Công cụ không đoán mã mời hoặc tự cấp quyền GM.
- Công cụ tạo tài khoản bình thường với mật khẩu ngẫu nhiên, đăng nhập, tạo nhân vật,
  đọc kho rồi gửi đúng một `logic.gmHandler.addItem` cho **100 vé thường, ID 119**.
  Sau đó đăng nhập lại để kiểm tra kho có tăng đúng 100 không. Không thay EXP/VIP.
- `PASS` chỉ khi kiểm tra kho bền vững thành công; server từ chối GM thì dừng và báo
  lỗi. Nếu GM timeout, không chạy lại vội vì lệnh cũ có thể đã được server xử lý.
- Mỗi lượt chạy đầy đủ tạo tài khoản mới. Giữ iSH ở trước màn hình cho đến khi xong.

Đọc báo cáo để gửi lại trong chat:

```sh
cat gm-test-*/REPORT.json
```

Không gửi `ACCOUNT-PRIVATE.json`: file này chứa mật khẩu tài khoản mới. Mã mời và
session token không được ghi vào báo cáo chia sẻ.

Bản đã chỉnh dùng Python 3.8 trở lên, tránh API chỉ có ở Python 3.11; iSH cài aiohttp
bằng gói Alpine để không cần biên dịch thư viện qua pip. Đã kiểm tra tên gói trong
catalog Alpine v3.14 x86 và chạy thử luồng đầy đủ trên backend Linux cục bộ cả hai
trường hợp cho phép/từ chối GM. **Chưa thử native trên iPhone và chưa kiểm tra server
Tailscale cũ.** Nếu apk không tìm thấy gói hoặc lỗi phụ thuộc, gửi nguyên lỗi để
kiểm tra phiên bản repository iSH; không tự đổi repository hệ thống theo suy đoán.

Phiên bản công cụ mới gửi `cver=6` nhất quán trên các POST `/user/`, lấy từ phiên bản login đọc được trong APK. APK cũ chỉ gửi trường này lúc login, không gửi lúc đăng ký. Thay đổi này kiểm tra trường hợp backend đòi phiên bản ở cả đăng ký/serverInfo; chưa chứng minh server cũ chấp nhận phiên bản 6. Nếu vẫn báo client cũ, cần bản client được server hỗ trợ hoặc source backend để đối chiếu, không đoán tăng số phiên bản.

Đối chiếu bổ sung bytecode `classes4.dex`: lớp `org.cocos2dx.javascript.DevId` tham chiếu `Settings.Secure.getString` với khóa `android_id`. Bản công cụ đầu gửi `device` rỗng; bản mới tạo một mã cài đặt riêng, lưu tại `.legacy-gm-installation-id`, dùng nhất quán cho đăng ký/login/relogin. Đây không phải Android ID native và không mạo nhận thiết bị đang có trên server. Nếu có Android ID thật của chính bạn, `--device` vẫn nhận giá trị đó. Mã cài đặt công cụ có thể không được backend chấp nhận; chưa xác minh đây là nguyên nhân thông báo client cũ. Không xóa mã này giữa các lần chạy để giả làm thiết bị mới.

## Tìm dịch vụ để khôi phục máy chủ

Công cụ `tools/check_legacy_host.py` dùng thư viện chuẩn Python, kiểm tra đúng một
IPv4 và 11 cổng cố định: 22, 80, 443, 3000, 3389, 5000, 8000, 8022, 8080,
8443, 20003. Chạy trên iPhone đang vào tailnet:

```sh
python3 check-host.py --host IP-TAILSCALE
```

Công cụ chỉ nối TCP, đọc banner ở 22/8022, và GET `/` trên các cổng web để đọc mã
HTTP/tiêu đề/header. Không thử đăng nhập, không theo redirect, không bỏ kiểm tra
chứng chỉ TLS, không gọi API quản trị hoặc GM. Kết quả cổng mở không chứng minh
đó là trang quản trị hay cấp quyền truy cập. Cổng không tới được cũng có thể do
ACL/firewall, không đủ để kết luận dịch vụ đã tắt.

Nếu nhận diện được SSH/web quản trị, dùng khóa/tài khoản hoặc quy trình khôi phục
chính thức của dịch vụ. Với VPS, có thể cần console/tài khoản nhà cung cấp; với
Android/Windows, cần quyền trên máy chạy server hoặc bản sao lưu. Có mặt trong
Tailscale không tự cấp quyền quản trị hệ điều hành hoặc game.
