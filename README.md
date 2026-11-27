# DB2 ENG · SSS/SP + GM — v6 sự kiện tiêu Gem / cày nhận quà

Bản này **giữ gameplay/data client ENG** và hệ tướng gốc **S / SS / SSS / SP**. Không trộn startup override hoặc module gameplay Long Chi Đảo. Backend Python vẫn là mã tương thích của dự án; luật kín server gốc không có trong client vẫn dùng luật riêng có ghi nguồn.

## Tải đúng bộ mới

**[Download-Clients.zip](Download-Clients.zip)** → giải nén → mở **Download-Clients.bat** (cần Python 3.10+). Công cụ tự tải, tạo và kiểm SHA-256 hai file nguyên vẹn:

- `DB2-ENG-SPSSS-BoxInfo.apk`: đã ký phát triển, cài đè cùng package/chứng thư, có Speed 1–10×.
- `DB2-ENG-SPSSS-AutoPlans-unsigned.ipa`: có cùng sửa lỗi/GM/speed và bản sửa plugin tự thoát lúc khởi động; **chưa ký**, cần ký hợp lệ trên Mac.

**Chỉ tải IPA:** [Download-IPA.zip](Download-IPA.zip) → giải nén → mở `Download-IPA.bat` trên Windows; trên Mac chạy `bash Download-IPA.command`. Xem [ký/cài IPA và nhập IP Tailscale](IPA-INSTALL.md). BAT tải file, không tự ký/cài.

Không cần APK cũ, Java, Git hoặc ghép tay. Cần khoảng 2,2 GB trống gồm cache; chạy lại sẽ dùng các phần đã tải đúng. Có thể tải riêng: `python Download-Clients.py --only apk` hoặc `python3 Download-Clients.py --only ipa`.

**Source server:** tải [ZIP nhánh eng-sp-sss](https://github.com/j1dreamer/db2-private/archive/refs/heads/eng-sp-sss.zip). Không tải nhánh `main` hoặc dùng chung server Long Chi Đảo cũ.

## Chạy trên Windows + BlueStacks

1. Dừng server cũ bằng Ctrl+C. Giải nén source mới vào thư mục riêng. Cần Python 3.10+ và Node.js LTS.
2. Chạy `start.bat`. Thư mục mới tự tạo `data/game.sqlite3` và `data/admin-token`, không kèm tài khoản hoặc token của ai. Nếu cần dữ liệu cũ, tự giữ bản sao trước khi chuyển; server có snapshot SQLite trước đổi baseline.
3. Đặt APK mới cạnh `Install-Android.bat`, bật BlueStacks → Android Debug Bridge rồi chạy BAT. Nhập đúng cổng ADB (thường `127.0.0.1:6610`). Không cần gỡ app hoặc xóa data Android.
4. Trong game dùng server `http://127.0.0.1:20003`. Với database trắng, đăng ký tài khoản mới.
5. Kiểm `/health`: **build `eng-sp-sss-sp-events-v7`, schema 30**. Dùng client ENG BoxInfo tương thích; nếu đã cài BoxInfo thì bản web này chỉ cần cập nhật server.

Web quản trị: **http://127.0.0.1:20003**; token nằm ở `data/admin-token` trong đúng thư mục server đang chạy.

## Sự kiện và ảnh vật phẩm trong quản trị

- Event tùy chỉnh và 17 event hệ thống xem trước ảnh, tên, ID và số lượng phần thưởng. Thưởng được chia theo mốc, lựa chọn và từng ô quay, không cộng gộp các điều kiện thành một gói.
- Chỉnh thưởng có ảnh món đang chọn, tìm theo tên/ID, danh sách có hình, số lượng và sao tướng. Dùng phím ↑/↓ và Enter để chọn; Escape đóng gợi ý và giữ form đang sửa. Bố cục dành cho màn hình điện thoại.
- Tìm sự kiện theo tên, ID sự kiện hoặc tên/ID phần thưởng; lọc trạng thái. Lịch UTC+7, bật/tắt và lịch sử nhận thưởng tiếp tục dùng cùng dữ liệu/RPC của game.
- Những thay đổi này chỉ cần cập nhật source server và làm mới web. **APK/IPA BoxInfo hiện có vẫn dùng được**; không cần cài lại client cho phần quản trị mới. Giữ thư mục `data` khi cập nhật.
- Kiểm tra tại [analysis/event-admin-validation.json](analysis/event-admin-validation.json). Các nhóm thưởng và giao diện quản trị bổ sung là mã dự án viết, không được nhận là web quản trị server gốc.

Ảnh quản trị: [desktop](docs/admin-events-desktop.png) · [form điện thoại](docs/admin-event-editor-mobile.png).

## Event tiêu phí / cày nhận quà — v6

Web → Sự kiện → Tạo/Sửa → chọn **Điều kiện** và **Mốc nhận quà**: tiêu Gem, thắng màn (gồm quét màn), hoặc số lượt quay thường/cao cấp. Chọn phần thưởng từ danh sách có ảnh, ID, số lượng; đặt lịch, cấp tối thiểu và chu kỳ. Tiến độ hiện trong màn sự kiện hiện có của game. Ví dụ: tiêu 300 Gem → nhận 60 mảnh, thắng 10 màn → nhận vé quay.

- Mỗi ID sự kiện có một mốc và một nhóm quà, nhận một lần mỗi kỳ. Muốn 3 mốc thì tạo 3 ID. Cùng một hoạt động có thể tính cho nhiều event đang có lịch phù hợp.
- Server ghi tiến độ trong SQLite, kiểm tra trước khi phát thưởng và chống nhận lặp. Client không gửi số tiến độ hay số quà để server tin theo. Quay SP dùng hệ riêng, không tính vào điều kiện quay thường/cao cấp.
- Chỉ tính giao dịch sau khi nâng cấp server, nằm trong thời gian kỳ hiện tại; không hồi tố lịch sử. Cấp Gem qua quản trị không tính là tiêu Gem; tiêu số Gem đã cấp vẫn tính bình thường. Thua/bỏ trận không cộng thắng.
- Tạm tắt event chặn nhận quà, không xóa tiến độ. Sổ giao dịch vẫn ghi khi tạm tắt; bật lại tính những giao dịch nằm trong lịch đó. Sửa ngưỡng không xóa lịch sử đã nhận; sau khi có người nhận không được đổi loại điều kiện/chu kỳ trên cùng ID.
- **Chỉ cập nhật server + web; giữ APK/IPA BoxInfo đang dùng.** Giữ thư mục `data`, sao lưu trước khi cập nhật và khởi động lại server. Server tự tạo bảng `event_metrics`, schema profile vẫn 30.
- Đây là luật event dự án viết thêm, không phải source backend ENG gốc. Xem [kiểm chứng](analysis/event-objectives-validation.json) và [ảnh form điện thoại](docs/admin-event-objective-mobile.png). Chưa kiểm chơi native Android/iPhone cho bản này.

## VPS Ubuntu

Ubuntu 24.04 LTS **1 vCPU / 2 GB RAM** dùng được để thử nghiệm hoặc nhóm nhỏ; chưa có benchmark để cam kết số người chơi đồng thời. Cần Python 3.10+, Node.js LTS để chạy engine trận, ổ đĩa cho source/dữ liệu/backup và Tailscale nếu chơi qua mạng riêng. Client APK/IPA không cần nằm trên VPS. Xem [UBUNTU.md](UBUNTU.md) và mẫu systemd trong `deploy/`.

## Chữ giao diện iOS · TextFix

Sửa cách khởi tạo nhãn mới bị trống trong ảnh iPhone: cấu hình Label trước khi bật node, khung chữ cố định và đường vẽ Canvas của engine. Áp dụng cho bảng server/tốc độ/auto/ghi và ô nhập. Các tính năng Controls giữ nguyên. [Kiểm chứng](analysis/ios-text-fix-validation.json); render trên iPhone vẫn cần người dùng xác nhận sau ký/cài TextFix.

## Điều khiển iOS · Controls

IPA hiện tại sửa vòng popup mất mạng, thu gọn hộp server, thay Speed bằng nút tròn giữ 2 giây mở slider 1–10×. Chạm nhanh mở auto một điểm/nhiều điểm hoặc ghi/phát lại thao tác. Có nút Dừng riêng, tự ngắt lúc chuyển cảnh/mất mạng/xuống nền. [Hướng dẫn](CLIENT-CONTROLS.md) · [Kiểm chứng](analysis/ios-controls-validation.json). Bản này cập nhật IPA, không thay APK/server; cần ký lại và thử native trên iPhone.

## Đăng nhập iOS · LoginFix

IPA mới khôi phục form tài khoản/mật khẩu khi chưa đặt IP, bỏ nút “Nguồn và luật”, thêm fallback font hệ thống cho chữ Việt. Kiểm tra kết nối lúc mở chỉ chờ tối đa 8 giây, sau lỗi mạng/timeout/sai dịch vụ sẽ về màn đăng nhập và mở lại ô sửa server. Không thay đổi backend cho bản sửa này. Xem [analysis/ios-login-fix-validation.json](analysis/ios-login-fix-validation.json). Bản native/render iPhone cần người dùng xác nhận.

## Sửa khởi động iOS · LaunchFix

Log iPhone đã xác nhận `CombinedPlugin.dylib` ghi `[sjcode] disabled/not-found; kill now`, rồi app tự thoát (`voluntary`) sau khi chữ ký được chấp nhận. IPA mới bỏ hai plugin khởi động và mục nạp tương ứng, kiểm không có import phụ thuộc; phần mã lệnh sau load commands và JSC giữ nguyên. Không gọi dịch vụ kiểm tra riêng của plugin. Đây là thay đổi native load commands được dự án thực hiện, cần ký lại; chưa kiểm mở native trên iPhone. APK/server không cần đổi cho lỗi này.

Tải lại [Download-IPA.zip](Download-IPA.zip), giải nén vào thư mục riêng, chọn file **LaunchFix** khi ký bằng Sideloadly. Có thể dùng `--ipa-source` với BoxInfo gốc chưa ký để tránh tải lại toàn bộ. Hướng dẫn trong [IPA-INSTALL.md](IPA-INSTALL.md), kiểm chứng ở [analysis/ios-launch-fix-validation.json](analysis/ios-launch-fix-validation.json).

## Rương SP và Speed lần này

- Mọi rương có mô tả bổ sung theo cấu hình: chọn mấy loại, nhận toàn bộ hay ngẫu nhiên. Mô tả gốc vẫn được giữ bên dưới; số lượng đọc từ cấu hình thưởng, không gán cứng ×60.
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

Android chạy server: xem [hướng dẫn Termux + Tailscale](TERMUX.md). Trong thư mục source ở home Termux, chạy `bash Setup-Termux.sh`, sau đó `bash Start-Termux.sh`. Script lắng nghe cổng 20003 và quảng bá host theo địa chỉ client dùng. Cài/bật ứng dụng Tailscale riêng trên Android chạy server và các máy chơi; chưa có tunnel được cấu hình sẵn trong gói.

## Kiểm tra và nguồn

Nguồn từng bảng và bản dịch: [canonical-policy](tables/canonical-policy.json), [privateRules](tables/privateRules.json), mục **Nguồn và bản dịch** trong quản trị. Tiếng Việt ENG gốc được giữ riêng; các phần bổ sung ghi nguồn từng khóa. Chữ vẽ sẵn trong ảnh có thể vẫn là ENG/Trung.

Báo cáo web hiện tại: [analysis/event-admin-validation.json](analysis/event-admin-validation.json). Bản client: [analysis/box-info-validation.json](analysis/box-info-validation.json); kiểm chứng bản trước ở `analysis/eng-gm-validation.json`. Các báo cáo Long Chi Đảo là lịch sử. Các kiểm tra model/UI adapter/headless không thay thế chơi thực tế đầy đủ trên Android/iPhone.

Nhánh có đủ 342 handler hợp đồng gốc, cộng 3 RPC GM riêng (`catalog`, `setPlayer`, `setRole`). Chưa tuyên bố mọi tính năng gốc hoặc toàn bộ gameplay native đã được kiểm chứng. Github release upload từ Cloud và Actions vẫn bị chặn; bộ tải GitHub ở trên hoạt động độc lập, không cần đăng nhập.

## Công cụ kiểm tra server APK cũ

[Legacy-GM-Test.zip](Legacy-GM-Test.zip) là client chẩn đoán riêng, không thay server đang chạy. Chạy từ máy có Tailscale tới server cũ; cần Python 3.8+. Trên iPhone xem [iSH](IPHONE-GM.md). Công cụ đăng ký theo luồng bình thường, chỉ thử một lệnh cấp 100 vé thường (119), đăng nhập lại và kiểm số lượng bền vững. Không tự cấp quyền GM; nếu bị từ chối quyền/mã mời thì dừng. Tài khoản/mật khẩu sinh trên máy chạy tool, không được đóng gói trong ZIP. Kết quả kiểm thử hiện tại chỉ trên backend cục bộ: [báo cáo](analysis/legacy-gm-client-validation.json).

## AutoPlans · cập nhật iOS

Thư viện kịch bản có tên, điểm kéo được và thời gian chờ/giữ từng điểm; ghi–lưu–phát riêng, Pause/Resume và bản nháp không ghi đè bản lưu. [Cách dùng](CLIENT-CONTROLS.md). Dựng theo mô hình SDK X7 đã kiểm tĩnh; chưa xác minh tương đương hoàn toàn trên iPhone. APK/server không đổi.

## Lịch SP, vé và thưởng · v7

[Sự kiện → Lịch SP & vé](SP-EVENTS.md): xếp đợt theo ngày, chọn tướng/vé từ client, chỉnh pool/bảo hiểm, đăng nhập, chiến lệnh, mốc nạp riêng, gói vé và thưởng BXH qua thư. Sửa DTO gây lỗi `needMap` khi mở Hoạt động. APK/IPA không đổi trong bản server này.
