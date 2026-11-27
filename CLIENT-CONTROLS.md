# Điều khiển trong game · IPA Controls

Cài bản `DB2-ENG-SPSSS-TextFix-unsigned.ipa` đã ký bằng Sideloadly. Bộ tải IPA hiện tạo file này; không chọn lại LoginFix hoặc LaunchFix cũ. Server và APK đang dùng không bị thay đổi bởi bản IPA này.

## Mất mạng / đổi server

Hộp server thu gọn, có nút × và Đóng. Bấm Kết nối lưu địa chỉ và khởi động lại game. Nếu lỗi kết nối, client dừng hàng đợi/reconnect cũ, bỏ popup lỗi/màn tải và trở về sửa IP. Nút xác nhận không tiếp tục vòng thử lại cũ. Kiểm tra cấu hình lúc khởi động vẫn giới hạn 8 giây.

Địa chỉ cần đầy đủ, ví dụ `http://100.x.x.x:20003`; bật Tailscale trên thiết bị và máy chạy server. Nút Server ở màn đăng nhập mở lại hộp này; đóng hộp để dùng tài khoản/mật khẩu.

## Nút tròn

- Kéo nút tròn để di chuyển; vị trí được nhớ giữa các cảnh.
- Giữ yên **2 giây** để mở thanh tốc độ **1–10×**. Kéo thanh hoặc bấm −/+ áp dụng ngay.
- Chạm nhanh mở bảng Auto / Ghi. Nút × đóng bảng.

Tốc độ vẫn là tốc độ game/giao diện; thời gian nhận thưởng và lịch sự kiện do server quyết định. Khoảng thời gian auto/record dùng thời gian thực, không nhân với tốc độ game.

## Auto click

1. Chạm nút tròn → Auto → **Một điểm** hoặc **Nhiều điểm**.
2. Chạm vị trí cần click. Một điểm tự quay lại bảng; nhiều điểm cho chọn tối đa 20 vị trí, rồi chạm nút tròn để kết thúc chọn.
3. Nhập khoảng cách **100–10000 ms** và số lượt. **0** là chạy liên tục; mặc định **1** lượt.
4. Bấm Chạy. Nhiều điểm được chạm lần lượt theo thứ tự đã chọn; một lượt là đi qua tất cả điểm.
5. Bấm nút **Dừng** cạnh nút tròn để ngắt ngay.

Các điểm đánh dấu không chặn thao tác game. Điểm được lưu theo tỉ lệ Canvas, nhưng thay đổi giao diện/tỉ lệ màn hình có thể cần chọn lại. Không tự gọi RPC cấp đồ hoặc bỏ qua điều kiện server.

## Ghi / phát lại

Chạm nút tròn → Ghi → **Bắt đầu ghi**, rồi thao tác chạm/kéo trong game bằng một ngón. Bấm **Dừng** để lưu; mở tab Ghi để Phát một lần, Phát lặp hoặc Xóa bản ghi. Giới hạn 2 phút hoặc 2000 sự kiện chạm; không ghi nội dung bàn phím hay thao tác ngoài ứng dụng.

Bản ghi và điểm nằm trên thiết bị, không phải dữ liệu nhân vật trên server. Auto/phát lại/ghi dừng khi đổi cảnh, mở bảng điều khiển, mất mạng hoặc đưa app xuống nền. Bản ghi dùng cho thao tác trong cùng cảnh; không phải trình tự chạy xuyên tất cả màn gameplay.

## Kiểm chứng

Logic điều khiển, touch dispatch, timer, popup và bản ghép IPA được kiểm bằng runtime mô phỏng và checksum; xem `analysis/ios-controls-validation.json`. Chưa có phép thử tương tác/render native trên iPhone trong môi trường build. Cần người dùng xác nhận thao tác thực tế sau khi ký/cài. Các điều khiển là mã dự án viết thêm, không phải chức năng từ server ENG gốc.
