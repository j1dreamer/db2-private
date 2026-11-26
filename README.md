# DB2 ENG · SSS/SP + GM — v3 rương / Speed

Bản này **giữ gameplay/data client ENG** và hệ tướng gốc **S / SS / SSS / SP**. Không trộn startup override hoặc module gameplay Long Chi Đảo. Backend Python vẫn là mã tương thích của dự án; luật kín server gốc không có trong client vẫn dùng luật riêng có ghi nguồn.

## Tải đúng bộ mới

**[Download-Clients.zip](Download-Clients.zip)** → giải nén → mở **Download-Clients.bat** (cần Python 3.10+). Công cụ tự tải, tạo và kiểm SHA-256 hai file nguyên vẹn:

- `DB2-ENG-SPSSS-BoxSpeed.apk`: đã ký phát triển, cài đè cùng package/chứng thư, có Speed 1–10×.
- `DB2-ENG-SPSSS-BoxSpeed-unsigned.ipa`: có cùng sửa lỗi/GM/speed; **chưa ký**, cần ký hợp lệ trên Mac.

Không cần APK cũ, Java, Git hoặc ghép tay. Cần khoảng 2,2 GB trống gồm cache; chạy lại sẽ dùng các phần đã tải đúng. Có thể tải riêng: `python Download-Clients.py --only apk` hoặc `python3 Download-Clients.py --only ipa`.

**Source server:** tải [ZIP nhánh eng-sp-sss](https://github.com/j1dreamer/db2-private/archive/refs/heads/eng-sp-sss.zip). Không tải nhánh `main` hoặc dùng chung server Long Chi Đảo cũ.

## Chạy trên Windows + BlueStacks

1. Dừng server cũ bằng Ctrl+C. Giải nén source mới vào thư mục riêng. Cần Python 3.10+ và Node.js LTS.
2. Chạy `start.bat`. Thư mục mới tự tạo `data/game.sqlite3` và `data/admin-token`, không kèm tài khoản hoặc token của ai. Nếu cần dữ liệu cũ, tự giữ bản sao trước khi chuyển; server có snapshot SQLite trước đổi baseline.
3. Đặt APK mới cạnh `Install-Android.bat`, bật BlueStacks → Android Debug Bridge rồi chạy BAT. Nhập đúng cổng ADB (thường `127.0.0.1:6610`). Không cần gỡ app hoặc xóa data Android.
4. Trong game dùng server `http://127.0.0.1:20003`. Với database trắng, đăng ký tài khoản mới.
5. Kiểm `/health`: **build `eng-sp-sss-box-speed-v3`, schema 30**. Cần cập nhật **cả server và client** để tránh trộn hai bộ luật.

Web quản trị: **http://127.0.0.1:20003**; token nằm ở `data/admin-token` trong đúng thư mục server đang chạy.

## Rương SP và Speed lần này

- Rương chọn hiện số đang có, số mở và số thưởng mỗi ô theo số rương mở. Có nút 1 / 10 / tất cả, tăng giảm và nút × để hủy màn chọn mà không mở rương.
- Mở nhiều phần thưởng tướng: nhận tướng mới trước, phần trùng đổi hồn theo luật hiện có. Rương cấu hình khác nội dung không bị gộp nhầm; giữ giới hạn stack gốc của từng loại.
- Speed thu gọn 84 × 30, kéo để đổi vị trí và nhớ qua các cảnh. Bấm đổi 1–10× có tác dụng ngay; kéo không đổi tốc độ.
- Cần cài APK/IPA mới để có giao diện này, đồng thời cập nhật server. Schema vẫn 30; giữ database ENG đang chơi, không cần xóa dữ liệu.
- Các nút và bản vá này là mã dự án viết thêm, không phải giao diện trích từ source ENG.

## GM và sửa lỗi trước đó

- Web → Người chơi → chọn nhân vật → **Cấp quyền GM**. Client mới hiện nút **GM** dưới nút Speed; cấp/thu hồi khi online được gửi qua `onSync`. Quyền được kiểm lại trên mọi RPC, không cho client tự cấp quyền.
- GM có danh sách vật phẩm/tướng, ảnh, ID, tìm theo tên/ID, phân loại và phân trang; chọn mục rồi nhập số lượng để cấp.
- Tab **Cấp / VIP** sửa giá trị cấp người chơi, VIP, gem, coin, thể lực, điểm kỹ năng. Tab **Cấp tướng** chỉnh tướng đang sở hữu trong giới hạn ENG. Web cũng chỉnh được cấp/VIP và chọn đồ từ danh sách.
- Sửa màn VIP không vẽ lại sau hiệu ứng mở; đồng bộ luôn đủ catalog dùng cho sảnh/VIP.
- Dùng danh hiệu/khung ảnh không tạo lớp thưởng rỗng “You've obtained…”, thay bằng thông báo mở ngoại hình.
- Không bật các màn thẻ tuần của Long Chi Đảo khi dùng ENG.

GM là chức năng dự án tự viết, không được nhận là source server ENG. Cấp VIP thủ công chỉ thay VIP/kinh nghiệm VIP trong game, không ghi nhận thanh toán thật.

## iPhone / Termux / Tailscale

Ký IPA trên Mac bằng tài khoản/chứng chỉ của bạn rồi cài. Chỉ cắm cáp hoặc mở IPA trong Safari không tạo chữ ký. Địa chỉ server trên iPhone phải là IP LAN/Tailscale thật của máy chạy server; `127.0.0.1` trên iPhone không trỏ tới laptop.

```sh
python3 start.py --bind IP_TAILSCALE --public-host IP_TAILSCALE
```

Termux cần `pkg install python nodejs`. Tailscale phải cấu hình riêng trên các thiết bị; không có tunnel hoạt động sẵn trong gói.

## Kiểm tra và nguồn

Nguồn từng bảng và bản dịch: [canonical-policy](tables/canonical-policy.json), [privateRules](tables/privateRules.json), mục **Nguồn và bản dịch** trong quản trị. Tiếng Việt ENG gốc được giữ riêng; các phần bổ sung ghi nguồn từng khóa. Chữ vẽ sẵn trong ảnh có thể vẫn là ENG/Trung.

Báo cáo hiện tại: [analysis/box-speed-validation.json](analysis/box-speed-validation.json); kiểm chứng bản trước ở `analysis/eng-gm-validation.json`. Các báo cáo Long Chi Đảo là lịch sử. Các kiểm tra model/UI adapter/headless không thay thế chơi thực tế đầy đủ trên Android/iPhone.

Nhánh có đủ 342 handler hợp đồng gốc, cộng 3 RPC GM riêng (`catalog`, `setPlayer`, `setRole`). Chưa tuyên bố mọi tính năng gốc hoặc toàn bộ gameplay native đã được kiểm chứng. Github release upload từ Cloud và Actions vẫn bị chặn; bộ tải GitHub ở trên hoạt động độc lập, không cần đăng nhập.
