# IPA BoxRestore mới nhất · server ENG v8

Bộ tải tạo **DB2-ENG-SPSSS-BoxRestore-unsigned.ipa**, 510.865.940 byte (~487 MiB). Đây là client BoxInfo hiện tại có Speed 1–10×, chọn server, GM có kiểm quyền và giao diện rương mới. Server event v6 không cần một IPA khác. Công cụ tải kiểm SHA-256 toàn file trước khi báo COMPLETE; tải lỗi có thể chạy lại để dùng cache đã kiểm.

## Sửa lỗi mở đen rồi tự thoát

Log thiết bị cho thấy iOS chấp nhận chữ ký, sau đó `CombinedPlugin.dylib` ghi `[sjcode] disabled/not-found; kill now` và app thoát với trạng thái `voluntary`. Bản trước giữ nguyên native nên cũng giữ hai plugin khởi động này. LaunchFix bỏ hai mục nạp plugin ở cuối bảng thư viện và hai file `CombinedPlugin.dylib`, `Frameworks/AppRuntime/ATHelper.dylib`; đã kiểm không có symbol import phụ thuộc chúng. Không đổi mã lệnh gameplay hoặc JSC; IP server vẫn nhập trong game. Bản này cần ký lại hợp lệ, chưa được thử mở native trên iPhone.

## Tài khoản / mất kết nối / font — LoginFix

- Form tài khoản/mật khẩu gốc hoạt động cả khi chưa cấu hình server: đóng hộp “Server riêng” để thấy form. Bản trước iOS bỏ qua nhầm bước mở form nếu địa chỉ mặc định chưa được đặt.
- Thử IP không tới được: chờ tối đa 8 giây rồi quay về màn đăng nhập, tự mở lại “Server riêng” với lỗi. Mạng lỗi/HTTP lỗi/địa chỉ trả HTML hoặc JSON không phải cấu hình DB2 đều trả về để sửa IP, không đứng mãi ở màn tải.
- Bỏ nút “Nguồn và luật” khỏi IPA; thông tin nguồn vẫn nằm trong tài liệu/web quản trị.
- Chữ Việt dùng font hệ thống Arial dự phòng khi font đóng gói thiếu dấu; không sửa font size hoặc ảnh chứa chữ. Cần kiểm hình ảnh thực tế trên iPhone sau cài.
- Vẫn giữ sửa plugin tự thoát của LaunchFix. Ký/cài file **BoxRestore** mới bằng Sideloadly; không chọn lại IPA cũ.

## Điều khiển mới · Controls

Hộp server nhỏ, thoát vòng reconnect khi mất mạng. Nút tròn kéo được; giữ 2 giây mở tốc độ 1–10×; chạm nhanh mở thư viện kịch bản có tên. AutoPlans thêm điểm kéo được, sửa thời gian chờ/giữ từng điểm, ghi–lưu–phát riêng, tạm dừng/tiếp tục và bản nháp tách khỏi bản lưu. Xem [CLIENT-CONTROLS.md](CLIENT-CONTROLS.md). Tiếp tục qua cảnh khi app mở; xuống nền tạm dừng. Được viết theo mô hình X7 đã đọc tĩnh, chưa xác minh tương đương hoàn toàn trên iPhone.

## Sửa chữ bị trống · TextFix

Ảnh iPhone cho thấy khung và nút đã vẽ nhưng nhãn mới bị trống. TextFix tạo Label khi node chưa hiện, cấu hình font/nội dung/kích thước xong rồi mới kích hoạt; bỏ SHRINK trên các ô mới, dùng CLAMP và đường vẽ Canvas như các đoạn RichText trong engine. Áp dụng cho tiêu đề, nút, nhãn nhập liệu và placeholder. Các tính năng Controls vẫn giữ nguyên.

Kiểm tra thêm lifecycle `Label.onEnable` với nhãn ASCII/Việt/URL/số 0; không coi mô phỏng là phép thử render iPhone. Cần ký/cài đúng file TextFix và xác nhận chữ hiển thị trên thiết bị.

## Tải

**Windows:** cài Python 3.10+, giải nén toàn bộ `Download-IPA.zip`, mở `Download-IPA.bat`. Không kéo riêng BAT ra khỏi thư mục. Chương trình chỉ tải IPA, không tải APK. IPA hoàn chỉnh nằm cạnh BAT. **Chọn file có chữ `BoxRestore` để ký, không chọn lại BoxInfo cũ.** Nếu đã có file BoxInfo gốc chưa ký, có thể tránh tải lại 488 MB bằng lệnh trong CMD tại thư mục bộ tải:

```bat
Download-IPA.bat --ipa-source "C:\duong-dan\DB2-ENG-SPSSS-BoxInfo-unsigned.ipa"
```

Thay đường dẫn bằng file thật. Nếu đã sửa/ký file đầu vào, bỏ tùy chọn này để tải tự động. Bộ tải mới vẫn dùng cache các phần từ lần trước nếu nằm cùng thư mục.

**Mac:** cài Python 3.10+, giải nén ZIP. Mở Terminal ở thư mục đó và chạy:

```sh
bash ./Download-IPA.command
```

Có thể dùng `python3 Download-Clients.py --only ipa`. Không cần file game cũ; bộ tải tự ghép các phần. Cần khoảng 1,1 GB dung lượng trống cho IPA và cache. Không cài file `.downloading`.

SHA-256 IPA **trước khi ký**:

```text
01ab9b9af0fa69f60b8ac61439a71caf9e931bd4d436d209856dc85b76439b86
```

## Ký và cài qua máy tính

BAT chỉ tải file, **không tự ký/cài IPA**. IPA này chưa ký. Dùng cách ký hợp lệ của bạn, chẳng hạn Sideloadly trên Mac/Windows: cắm iPhone bằng cáp, chọn Tin cậy trên iPhone, chọn thiết bị và IPA đã tải, rồi ký/cài với tài khoản Apple của bạn trong công cụ đó. Không gửi mật khẩu/chứng chỉ/private key vào chat. Nếu iOS yêu cầu thì bật Developer Mode hoặc tin cậy nhà phát triển trong Cài đặt. Hạn dùng chữ ký và việc phải ký lại phụ thuộc loại tài khoản/chứng chỉ.

Nếu ký bằng công cụ khác, giữ quyền kết nối mạng của ứng dụng. Chỉ cắm cáp hay mở file IPA trong Safari không tự cài được. Việc ký sẽ đổi checksum nên so SHA-256 ở trên **trước bước ký**.

## Nhập IP Tailscale sau khi setup server

1. Cài/bật Tailscale trên iPhone và VPS, cho hai máy vào cùng tailnet (hoặc chia sẻ máy đúng quyền). ACL/firewall phải cho TCP 20003.
2. Trên VPS, dùng hướng dẫn [UBUNTU.md](https://github.com/j1dreamer/db2-private/blob/eng-sp-sss/UBUNTU.md). Server bind IP Tailscale, `--public-host auto`; systemd mẫu đã dùng tùy chọn này. Không quảng bá `127.0.0.1` cho máy chơi từ xa.
3. Trên iPhone, thử Safari `http://IP_TAILSCALE:20003/health`. Phải có JSON build `eng-sp-sss-combat-box-v8`, schema 30. Nếu Safari chưa mở được thì kiểm server/Tailscale trước.
4. Mở game → **Server riêng** ở màn đăng nhập → nhập **`http://IP_TAILSCALE:20003`** → **Lưu và khởi động lại**. Nhập địa chỉ đầy đủ, không chỉ bốn cụm số. Không thêm `/health` hoặc đường dẫn khác vào ô server.
5. Đăng ký/đăng nhập tài khoản của server đó. IPA lưu địa chỉ trên iPhone; đổi VPS/IP chỉ cần vào Server riêng sửa lại, không cần build/ký lại chỉ vì đổi IP.

Ví dụ định dạng: `http://100.101.102.103:20003`. Đây là địa chỉ minh họa, không phải VPS đã setup. `127.0.0.1` trên iPhone trỏ tới iPhone, không phải VPS. Nếu iOS hỏi quyền mạng nội bộ, cho phép ứng dụng kết nối.

Ô chọn server và endpoint trong JavaScript đóng gói, cùng chính sách HTTP trong Info.plist đã được kiểm tra. Chưa có phép thử cài IPA đã ký và chơi thực tế trên iPhone ở môi trường này; việc kết nối thật được kiểm sau khi VPS và chữ ký sẵn sàng.

## BoxRestore · rương và chữ Việt

Khôi phục nút chọn/số lượng/xác nhận rương gốc, giữ số ×N và nút đóng. Nhãn bổ sung có khung cố định và font Canvas/system Arial; nhãn Việt cũ chuyển font cả khi đổi nội dung. 34 bảng client/server giữ trùng khớp, không đổi quà SP/SS/SSS. AutoPlans vẫn có. [Chi tiết và kiểm chứng](COMBAT-BOX-FIX.md). Chưa xác minh render/touch bản này trên iPhone.
