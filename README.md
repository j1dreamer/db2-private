# APK Android đã ký — DB2 Private

Đây là đúng bản APK đã ký và xác minh v1/v2/v3. File được chia nhỏ để truyền qua GitHub; việc ghép chỉ nối byte, không build hoặc ký lại.

## Windows

1. Tải ZIP của nhánh `apk-download`, giải nén toàn bộ.
2. Nhấp đúp **join-apk.bat**.
3. Chờ thông báo **APK verified**. File **DB2-Private-Android-dev.apk** sẽ nằm cùng thư mục.

Có thể dùng `python join-apk.py` trên Windows, Linux hoặc macOS. Trên Linux/macOS cũng có thể chạy `sh join-apk.sh`.

Cần khoảng 1,5 GB trống cho ZIP, các phần đã giải nén và APK hoàn chỉnh.

- Package: `com.dp2.web.dev`, dùng debug certificate.
- Mặc định server `http://127.0.0.1:20003`; nút **Server riêng** ở màn đăng nhập cho phép đổi địa chỉ.
- Chưa xác minh cài đặt/vào sảnh trên Android thật. Đây chưa phải bản game hoàn chỉnh.
- Source server nằm ở nhánh `main`.
