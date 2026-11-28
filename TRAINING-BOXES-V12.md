# Tu luyện, rương SP và xếp hạng sảnh — v12

Build: `eng-sp-sss-training-boxes-v12`, schema 30. Dữ liệu người chơi và token quản trị được giữ khi chạy installer. Không cần ký lại APK/IPA BoxInfo đang dùng; thoát hẳn game và mở lại sau cập nhật để tải clientConfig mới.

## Tu luyện

ENG `roleScene.genData` tạo `trainItems.type` từ khóa object nên gửi chuỗi `"1"` khi mở khóa. Server trước đây chỉ nhận số nguyên, gây “Mục tu luyện không hợp lệ”. v12 nhận cả chuỗi ID chuẩn và số nguyên trong 15 mục có cấu hình. Vẫn cần thức tỉnh 10, tài nguyên và mở mục trước đó theo điều kiện giao diện ENG. Số lượng, chuỗi không chuẩn, boolean, ID lạ bị từ chối trước khi trừ tài nguyên. Mở/tăng cấp/đặt lại đủ 15 mục đã được kiểm tra.

## Rương

Web → **Kho vật phẩm → Rương chọn SP ×60**: xem ảnh/tên 20 loại mảnh SP, nhập Player ID và số rương (1–100). Mỗi rương chọn một loại, nhận đúng 60 mảnh. Dùng rương cấu hình từng món #351 của ENG; đây là mẫu riêng DB2, không phải rương gốc ENG/X7. Không cấp #351 trần nếu muốn mẫu này. Rương #727 và các rương tướng ENG khác giữ nguyên phần thưởng.

Hook clientConfig điền tên tướng nguyên con trong rewardPanel: mã ENG gốc không điền `name_label` ở nhánh role, để lại chữ mẫu `AAAAAA`. Chuyển label popup rương sang font hệ thống để hỗ trợ dấu Việt. Đây là sửa hiển thị qua server, không thay native binary. Fixture kiểm tra cập nhật tên/font và không bọc lặp. **Chưa xác minh trực tiếp hình ảnh trên iPhone**; không tuyên bố toàn bộ màn/rương đã được test native.

## Sảnh và lực chiến

Server gửi ba DTO Top 1 thật: võ đài thường, võ đài 3v3 theo nhóm cấp đang chơi và danh vọng theo kỳ tuần của server. Khi Top 1 là robot, không dựng một người chơi khác làm vô địch. Rank/avatar/tên thay đổi được đưa vào đồng bộ định kỳ. ID người chơi cũ giữ nguyên. Sửa hàm phân biệt robot phía client theo ID robot âm của server riêng; ENG gốc đánh dấu cả người chơi ID ≤10000 thành robot.

Đối chiếu 1.760 cấu hình tướng ở cấp/sao/thức tỉnh có seed cố định: phép tính lực chiến Python từ attr khớp `ROLE.FUNS.getPower` ENG trong mọi trường hợp thử. Kiểm tra chuỗi tiến hóa giữ class/group; tiến hóa phẩm màu không biến SS thành SSS/SP. Không tự thêm hệ số tăng lực chiến. Việc ghép attr ở backend riêng vẫn có những luật riêng đã ghi trong source; phép đối chiếu này không chứng minh toàn bộ backend gốc ENG được khôi phục.

## Triển khai

Installer Ubuntu/public có pin commit riêng để cài đúng source v12. Chỉ khi lệnh cài trên VPS chạy thành công và `/health` trả build v12 mới coi là đã deploy. SSH từ môi trường làm việc hiện bị từ chối cổng 22; việc đẩy source lên GitHub không tự cập nhật VPS.
