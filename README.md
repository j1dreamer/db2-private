# Long Chi Đảo VI — bộ cài mới

Nhánh **`long-chi-dao`** là bộ tải mới riêng. Không cần APK fixed, bản vá ZIP hoặc dữ liệu của nhánh cũ.

**Tải qua chat hiện không dùng được với APK/IPA lớn.** Dùng [Download-Clients.zip](Download-Clients.zip): giải nén vào thư mục mới, cài Python 3.10+ rồi mở `Download-Clients.bat`. Công cụ tự tải và tạo APK/IPA nguyên tệp, kiểm SHA-256, không cần APK cũ hoặc ghép tay. File kết quả nằm cạnh BAT. Cần khoảng 2,2 GB trống gồm cache; chạy lại sẽ dùng phần đã tải đúng.

GitHub release hiện vẫn là **draft**, chưa có APK/IPA đính kèm: upload từ Cloud trả HTTP 401 và GitHub Actions báo khóa Billing. Bộ tải tự động ở trên dùng các byte đã được chủ dự án cho phép công khai, hoạt động độc lập với Actions. Chủ dự án có thể upload hai file kết quả lên Google Drive rồi bổ sung link vào release.

**Source server tải ngay:** [ZIP nhánh long-chi-dao](https://github.com/j1dreamer/db2-private/archive/refs/heads/long-chi-dao.zip). Release `longzhidao-v1.0.0-dev` đang chờ hoàn tất tải tệp lên.

| Tệp kết quả / dự kiến trên release | Cách dùng |
| --- | --- |
| `LongChiDao-Server.zip` | Source server + web quản trị + công cụ cài Android, không có tài khoản/data/token cũ |
| `LongChiDao-VI-Android.apk` | APK đầy đủ đã ký phát triển, cài trực tiếp, không ghép file |
| `LongChiDao-VI-iOS-unsigned.ipa` | IPA đầy đủ **chưa ký**, cần ký hợp lệ trên Mac |
| `SHA256SUMS.txt` | Checksum của từng tệp tải |

## Chạy mới trên Windows + BlueStacks

1. Cài **Python 3.10+** và **Node.js LTS**. Nếu server cũ đang chạy, dừng bằng Ctrl+C để tránh trùng cổng 20003.
2. Giải nén `LongChiDao-Server.zip` hoặc ZIP source GitHub ở trên vào thư mục mới, ví dụ `D:\Games\LongChiDao`. **Không chép thư mục `data` cũ sang.**
3. Trong thư mục chứa source vừa giải nén, mở `start.bat`. Lần đầu cần mạng để cài aiohttp. Server tự tạo database trắng và token quản trị riêng tại `data/`.
4. Đặt `LongChiDao-VI-Android.apk` vừa tải cạnh `Install-Android.bat`. Mở BlueStacks, bật Android Debug Bridge rồi chạy `Install-Android.bat`.
5. Công cụ hỏi địa chỉ ADB, mặc định `127.0.0.1:6610`; dùng đúng địa chỉ BlueStacks đang hiện. Sau khi cài, công cụ nối cổng game vào server trên laptop.
6. Mở game, chọn server `http://127.0.0.1:20003`, **đăng ký tài khoản mới** rồi chơi thử. Nếu game còn lưu tài khoản/server từ lần cài trước, đăng xuất và nhập lại thông tin mới.

Web quản trị: **http://127.0.0.1:20003**. Token nằm ở `data/admin-token`, nhập trong web. Không có tài khoản hoặc mật khẩu quản trị mặc định được đóng gói. Hướng dẫn quản trị và sự kiện: [ADMIN.md](ADMIN.md).

APK dùng cùng package/chữ ký phát triển trước, nên Android có thể cài đè ứng dụng đang có. Bộ server tải mới không mang dữ liệu người chơi cũ; công cụ không xóa ứng dụng hoặc xóa database cũ của bạn.

## iPhone / Mac

Tạo `LongChiDao-VI-iOS-unsigned.ipa` bằng bộ tải tự động ở trên (Mac: `python3 Download-Clients.py --only ipa`), ký bằng công cụ/chứng chỉ hợp lệ của bạn trên Mac rồi cài qua cáp. Không thể cài IPA chưa ký chỉ bằng cách mở trong Safari. [Hướng dẫn ký và kết nối](IOS-PRIVATE.md).

Server laptop và iPhone có thể dùng Tailscale cùng tailnet. Ví dụ chạy server với IP Tailscale thật của laptop:

```sh
python start.py --bind IP_TAILSCALE_LAPTOP --public-host IP_TAILSCALE_LAPTOP
```

Trong game nhập `http://IP_TAILSCALE_LAPTOP:20003`. Không dùng `127.0.0.1` trên iPhone để trỏ tới laptop. Tailscale không có sẵn trong gói, cần cấu hình trên hai máy.

Linux/macOS/Termux chạy `python3 start.py` (Termux: `pkg install python nodejs`).

## Nội dung và nguồn

- Bộ 34 bảng, 22 cờ khởi động, 13 đường dẫn cấu hình và 20 module gameplay khác biệt từ **龙之岛-1W免费版, X7 #17327**; giữ khung/tài nguyên ENG/iOS.
- Tướng theo dữ liệu **S / SS / SSS / SP**. Có Speed 1–10× toàn game và bỏ hướng dẫn.
- Dùng lại **8.466 mục Việt ENG**, 498 mục dịch bổ sung gồm 6 mục sửa, tổng 8.958 khóa. Chữ dựng sẵn trong một số ảnh ENG vẫn giữ.
- Web quản trị 9 khu vực, 2.905 item/role, 17 bộ chỉnh event và mục **Nguồn và bản dịch**. Mỗi item có nhãn nguồn dữ liệu/tên/mô tả.
- **Backend Python là mã dự án viết**, không phải source server gốc. Phần không có luật gốc được ghi là luật riêng.

[Chi tiết nguồn](LONG-CHI-DAO.md) · [Luật riêng](tables/privateRules.json) · [Báo cáo kiểm thử](analysis/longzhidao-validation.json) · [Manifest bản phát hành](release.json).

Đã qua **260 kiểm thử**, **22 luồng web**, đối chiếu 34 bảng/hằng và 8 kết quả chiến đấu. Bản này vẫn là **development**: chưa xác minh chơi đầy đủ trên BlueStacks/iPhone. Các báo cáo cũ trong `analysis/ios/` ghi lịch sử kiểm tra, báo cáo bản hiện tại mang tiền tố `longzhidao-`.

## Tái lập và kiểm tra source

Runtime cần Python + aiohttp và Node.js. Chỉ khi tái lập công cụ phân tích/build client mới cần thêm Acorn/eslint-scope:

```sh
npm ci --prefix tools/js-parser
python -m unittest discover -s tests
```

Source không kèm archive client gốc hoặc khóa ký Apple. Các bản vá của nhánh cũ vẫn nằm trong lịch sử/nhánh `route-342`; luồng tải mới này dùng APK/IPA nguyên tệp.
