# IPA Controls mới nhất · server ENG v6

Bộ tải tạo **DB2-ENG-SPSSS-Controls-unsigned.ipa**, 510.861.884 byte (~487 MiB). Đây là client BoxInfo hiện tại có Speed 1–10×, chọn server, GM có kiểm quyền và giao diện rương mới. Server event v6 không cần một IPA khác. Công cụ tải kiểm SHA-256 toàn file trước khi báo COMPLETE; tải lỗi có thể chạy lại để dùng cache đã kiểm.

## Sửa lỗi mở đen rồi tự thoát

Log thiết bị cho thấy iOS chấp nhận chữ ký, sau đó `CombinedPlugin.dylib` ghi `[sjcode] disabled/not-found; kill now` và app thoát với trạng thái `voluntary`. Bản trước giữ nguyên native nên cũng giữ hai plugin khởi động này. LaunchFix bỏ hai mục nạp plugin ở cuối bảng thư viện và hai file `CombinedPlugin.dylib`, `Frameworks/AppRuntime/ATHelper.dylib`; đã kiểm không có symbol import phụ thuộc chúng. Không đổi mã lệnh gameplay hoặc JSC; IP server vẫn nhập trong game. Bản này cần ký lại hợp lệ, chưa được thử mở native trên iPhone.

## Tài khoản / mất kết nối / font — LoginFix

- Form tài khoản/mật khẩu gốc hoạt động cả khi chưa cấu hình server: đóng hộp “Server riêng” để thấy form. Bản trước iOS bỏ qua nhầm bước mở form nếu địa chỉ mặc định chưa được đặt.
- Thử IP không tới được: chờ tối đa 8 giây rồi quay về màn đăng nhập, tự mở lại “Server riêng” với lỗi. Mạng lỗi/HTTP lỗi/địa chỉ trả HTML hoặc JSON không phải cấu hình DB2 đều trả về để sửa IP, không đứng mãi ở màn tải.
- Bỏ nút “Nguồn và luật” khỏi IPA; thông tin nguồn vẫn nằm trong tài liệu/web quản trị.
- Chữ Việt dùng font hệ thống Arial dự phòng khi font đóng gói thiếu dấu; không sửa font size hoặc ảnh chứa chữ. Cần kiểm hình ảnh thực tế trên iPhone sau cài.
- Vẫn giữ sửa plugin tự thoát của LaunchFix. Ký/cài file **Controls** mới bằng Sideloadly; không chọn lại IPA cũ.

## Điều khiển mới · Controls

Hộp server nhỏ, đóng được popup mất mạng và hủy vòng reconnect cũ. Nút tròn kéo được; giữ 2 giây mở thanh tốc độ 1–10×; chạm nhanh mở Auto/Ghi. Có auto một điểm, nhiều điểm và ghi/phát lại chạm/kéo trong cùng cảnh. Nút Dừng hiện khi đang chạy/ghi/chọn điểm; tự dừng khi mất mạng, chuyển cảnh hoặc xuống nền. Xem [CLIENT-CONTROLS.md](CLIENT-CONTROLS.md). Các điều khiển cần thử thực tế sau khi ký/cài trên iPhone.

## Tải

**Windows:** cài Python 3.10+, giải nén toàn bộ `Download-IPA.zip`, mở `Download-IPA.bat`. Không kéo riêng BAT ra khỏi thư mục. Chương trình chỉ tải IPA, không tải APK. IPA hoàn chỉnh nằm cạnh BAT. **Chọn file có chữ `Controls` để ký, không chọn lại BoxInfo cũ.** Nếu đã có file BoxInfo gốc chưa ký, có thể tránh tải lại 488 MB bằng lệnh trong CMD tại thư mục bộ tải:

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
9a17a6c16495b08fbd296ad155ab1df349c2f150adb051b561a8d80ca60c23ba
```

## Ký và cài qua máy tính

BAT chỉ tải file, **không tự ký/cài IPA**. IPA này chưa ký. Dùng cách ký hợp lệ của bạn, chẳng hạn Sideloadly trên Mac/Windows: cắm iPhone bằng cáp, chọn Tin cậy trên iPhone, chọn thiết bị và IPA đã tải, rồi ký/cài với tài khoản Apple của bạn trong công cụ đó. Không gửi mật khẩu/chứng chỉ/private key vào chat. Nếu iOS yêu cầu thì bật Developer Mode hoặc tin cậy nhà phát triển trong Cài đặt. Hạn dùng chữ ký và việc phải ký lại phụ thuộc loại tài khoản/chứng chỉ.

Nếu ký bằng công cụ khác, giữ quyền kết nối mạng của ứng dụng. Chỉ cắm cáp hay mở file IPA trong Safari không tự cài được. Việc ký sẽ đổi checksum nên so SHA-256 ở trên **trước bước ký**.

## Nhập IP Tailscale sau khi setup server

1. Cài/bật Tailscale trên iPhone và VPS, cho hai máy vào cùng tailnet (hoặc chia sẻ máy đúng quyền). ACL/firewall phải cho TCP 20003.
2. Trên VPS, dùng hướng dẫn [UBUNTU.md](https://github.com/j1dreamer/db2-private/blob/eng-sp-sss/UBUNTU.md). Server bind IP Tailscale, `--public-host auto`; systemd mẫu đã dùng tùy chọn này. Không quảng bá `127.0.0.1` cho máy chơi từ xa.
3. Trên iPhone, thử Safari `http://IP_TAILSCALE:20003/health`. Phải có JSON build `eng-sp-sss-event-goals-v6`, schema 30. Nếu Safari chưa mở được thì kiểm server/Tailscale trước.
4. Mở game → **Server riêng** ở màn đăng nhập → nhập **`http://IP_TAILSCALE:20003`** → **Lưu và khởi động lại**. Nhập địa chỉ đầy đủ, không chỉ bốn cụm số. Không thêm `/health` hoặc đường dẫn khác vào ô server.
5. Đăng ký/đăng nhập tài khoản của server đó. IPA lưu địa chỉ trên iPhone; đổi VPS/IP chỉ cần vào Server riêng sửa lại, không cần build/ký lại chỉ vì đổi IP.

Ví dụ định dạng: `http://100.101.102.103:20003`. Đây là địa chỉ minh họa, không phải VPS đã setup. `127.0.0.1` trên iPhone trỏ tới iPhone, không phải VPS. Nếu iOS hỏi quyền mạng nội bộ, cho phép ứng dụng kết nối.

Ô chọn server và endpoint trong JavaScript đóng gói, cùng chính sách HTTP trong Info.plist đã được kiểm tra. Chưa có phép thử cài IPA đã ký và chơi thực tế trên iPhone ở môi trường này; việc kết nối thật được kiểm sau khi VPS và chữ ký sẵn sàng.
