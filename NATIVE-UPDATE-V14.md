# Sửa cập nhật runtime cho APK/IPA BoxInfo đang cài

> Đính chính v15: APK/IPA private đã phát hành chặn chạy script tải về và tin hệ thống. Các sửa hiển thị qua script mô tả dưới đây không chạy trên các bản đó. Cần client v15 có bridge cấu hình dữ liệu; xem [NATIVE-CONFIG-V15.md](NATIVE-CONFIG-V15.md).

Build `eng-sp-sss-native-update-v14`, schema 30; giữ mở rộng 5 ô và Xà Đạo v13.

## Lỗi v12/v13

`patch_private_startup` thay `logoScene.next_` bằng kết nối có timeout rồi gọi `next2_`, nhưng thiếu bước eval `runScriptInfo` trong mã ENG gốc. Vì thế server đã trả cấu hình và các kiểm tra hàm độc lập đạt, nhưng client BoxInfo đang cài không thực thi các bản sửa qua HTTP. Điều này ảnh hưởng cả giới hạn 20, popup rương, bỏ Time Peak cũ, ảnh xếp hạng và xem trước thưởng sao. Không phải lỗi người dùng nhập IP hay chưa cập nhật server.

## Sửa đường giao cập nhật

Server gửi script tự tạo qua nhánh hệ thống `onNewMsg` / `执行代码` có sẵn trong client ENG, trước phản hồi chọn/tạo nhân vật thành công. Client áp cấu hình trước khi dựng model người chơi. Chỉ gửi sau xác thực và kiểm tra sở hữu nhân vật; nội dung lấy từ file/config server, không nhận script từ request/chat. Không thêm route chạy mã từ người chơi.

Ngoài ra builder khôi phục eval clientConfig trong startup probe cho các APK/IPA build sau này. Không cần ký lại client BoxInfo hiện tại để nhận đường push hệ thống. Các hook vẫn chống bọc lặp; đặt `isSimpleAwake=false` để nút nâng dùng cấp thức tỉnh tối đa 20 thay vì điều kiện 5 Z đơn giản.

Bài kiểm tra đi qua WebSocket thực, nhận và giải mã push trước phản hồi vào nhân vật, chạy bằng chính callback `onNewMsg` trích từ ENG. Kiểm tra cấu hình 5 ô, giới hạn 20, điều kiện hiển thị nâng ở cấp 5/10/14/15/19 và ẩn ở 20. Kiểm tra startup builder cũng thực thi script probe. Chưa xác minh ảnh native trên iPhone.

Cập nhật VPS bằng installer pin v14, rồi đóng hẳn game và đăng nhập lại. Chỉ quay về màn Hero mà giữ phiên cũ chưa nhận được push entry mới.
