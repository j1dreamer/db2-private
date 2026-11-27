# IPA BoxInfo mới nhất · server ENG v6

Bộ tải tạo **DB2-ENG-SPSSS-BoxInfo-unsigned.ipa**, 511.242.249 byte (~488 MiB). Đây là client BoxInfo hiện tại có Speed 1–10×, chọn server, GM có kiểm quyền và giao diện rương mới. Server event v6 không cần một IPA khác. Công cụ tải kiểm SHA-256 toàn file trước khi báo COMPLETE; tải lỗi có thể chạy lại để dùng cache đã kiểm.

## Tải

**Windows:** cài Python 3.10+, giải nén toàn bộ `Download-IPA.zip`, mở `Download-IPA.bat`. Không kéo riêng BAT ra khỏi thư mục. Chương trình chỉ tải IPA, không tải APK. IPA hoàn chỉnh nằm cạnh BAT.

**Mac:** cài Python 3.10+, giải nén ZIP. Mở Terminal ở thư mục đó và chạy:

```sh
bash ./Download-IPA.command
```

Có thể dùng `python3 Download-Clients.py --only ipa`. Không cần file game cũ; bộ tải tự ghép các phần. Cần khoảng 1,1 GB dung lượng trống cho IPA và cache. Không cài file `.downloading`.

SHA-256 IPA **trước khi ký**:

```text
c6c324ce858b2e5d7106246882f80479458af713e4bdbf16e13b04e882dac10b
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
