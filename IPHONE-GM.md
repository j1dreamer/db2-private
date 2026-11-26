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
