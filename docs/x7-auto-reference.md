# X7 Auto click — đối chiếu tham chiếu

Đã đọc trực tiếp SDK trong APK **X7 Global Dragon Ball: Return of the Dragon**, lấy từ URL public ghi trong [báo cáo](../analysis/x7-auto-reference.json). Bộ SDK nằm trong `assets/plugin-release.zip` → `appPlugin-plugin-release.apk`. Có kiểm riêng bản Global; không coi SDK bản Trung là tự động giống Global. Không đưa APK hoặc mã SDK của X7 vào source dự án.

Xác nhận được mô-đun `simulateclick`, các model kịch bản/điểm/sự kiện ghi, dialog tạo kịch bản hoặc bản ghi, màn chỉnh/lưu kịch bản và cài đặt điểm chạm. Các hàm tạo/lưu cùng chuỗi tài nguyên cho thấy luồng ghi riêng với cửa sổ nổi. Các ảnh/animation hướng dẫn chỉ mô tả toolbox và điểm chạm đánh số; chưa đủ để khớp toàn bộ giao diện sử dụng.

Ảnh Toolbox công khai: [bài hướng dẫn X7](https://ssrebirth2.wixsite.com/home/post/app-jogue-pelo-x7game). Ảnh đó chỉ xác nhận lối vào Auto click tool, không chứng minh vị trí nút hoặc toàn bộ thao tác của màn chỉnh.

## Những gì bản hiện tại còn thiếu

| Phần | Bản dự án hiện tại | Hướng làm lại cần đối chiếu với giao diện X7 |
|---|---|---|
| Kịch bản | Một cấu hình và một bản ghi | Danh sách có tên, tạo/sửa/lưu/mở riêng |
| Đặt điểm | Chọn vào vị trí; marker không kéo chỉnh được | Điểm đánh số có thể chỉnh trực tiếp; thêm/xóa rõ ràng |
| Ghi | Mở modal rồi ghi ngay; chỉ có dừng/lưu | Luồng ghi riêng, trạng thái rõ và hộp lưu bản ghi |
| Phát lại | Start/Stop | Play/Pause/Resume/Stop và tiến độ |
| Cấu hình | Một khoảng chờ chung | Đối chiếu màn chỉnh thời gian từng điểm và lặp |

Các hướng làm lại trong bảng là đề xuất triển khai của dự án, không được nhận là chi tiết giao diện X7 đã quan sát đầy đủ. Không có bản IPA “clone X7” nào được phát hành từ đợt nghiên cứu này.

Để khớp đúng bản người dùng quen sử dụng, còn cần video ngắn mở Auto click → tạo/chỉnh điểm → ghi → lưu → phát lại. Không thể xác minh trải nghiệm “giống hệt” chỉ từ tên lớp, chuỗi và animation giới thiệu. Phần chạy trên iPhone sẽ cần mã Cocos/iOS tương thích; thư viện Android của X7 không phải binary có thể chép trực tiếp vào IPA.
