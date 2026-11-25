# Mục tiêu 342/342 route

Mục tiêu đã được người dùng yêu cầu: toàn bộ 342 route có xử lý nghiệp vụ, dữ liệu bền vững và phản hồi tương thích client. Route đăng ký tên rồi trả thành công rỗng không được tính hoàn tất.

Nhánh làm việc: `route-342`. Đây là nhánh phát triển, không thay thế các APK/gói vá đã phát hành ở main. Mục tiêu còn đang mở; chưa hoàn tất.

## Định nghĩa hoàn tất

Với từng route: đối chiếu request thật từ JavaScript; xác thực tài khoản và quyền với dữ liệu; xử lý dữ liệu, chi phí, phần thưởng và transaction; kiểm thử thành công/thất bại/replay; đối chiếu response với consumer của client. Các chuỗi giao diện/trận đấu cần kiểm tra trên thiết bị trước khi gọi là bản chơi hoàn chỉnh. Luật không đọc được từ client phải ghi là luật server riêng hoặc chờ bằng chứng, không mô tả như luật gốc đã xác minh.

## Tiến độ hiện tại

- Đã trích đủ 342 hợp đồng request: `analysis/route-contracts.json`. Công cụ Acorn giải quyết cả hai route có tên đi qua biến cục bộ, không chỉ các chuỗi truyền trực tiếp vào request.
- 31 route có xử lý trong nhánh và được các bộ kiểm thử nhóm bao phủ. Còn 311 route chưa triển khai. Xem `analysis/route-coverage.json` để biết từng route.
- Đã chạy 60 kiểm thử tổng thể. Các kiểm thử mới gồm engine gốc chạy không renderer, phát lại trận thắng với cùng seed/lịch sử kỹ năng, ghi tiến độ/thưởng một lần, đội hình không hợp lệ, thiếu thể lực, càn quét, rương sao, mua lượt và các thao tác nhân vật.

## Phần mới trong nhánh

Sáu route smap: bắt đầu, kết thúc, càn quét, rương chương, đặt lại lượt và mua lượt chế độ 5. Trận bắt đầu có seed server và snapshot đội hình; server chạy lại engine JavaScript gốc trước khi nhận kết quả thắng. Hồ sơ chứa run đang hoạt động trong SQLite nên reconnect không tạo thưởng lặp. Server không chấp nhận đổi seed hoặc đội hình sau khi bắt đầu. Client được vá để dùng seed và gửi lịch sử/tick thực thay các giá trị 0/rỗng của client cũ. Đường forfeit không phát thưởng.

Chín route nhân vật: ảnh tướng/đồng hành/danh hiệu/chat, ẩn trang bị, mua thể lực, mua điểm kỹ năng, mua vàng, điểm danh. Quyền ngoại hình và hạn mức/giá trị có sẵn lấy từ dữ liệu client; các grant chưa mở không tự được tạo theo ID từ client.

Dữ liệu nền: hồi thể lực/điểm kỹ năng theo timestamp, ngày server UTC+7, reset hạn mức hằng ngày, kỹ năng đầu tiên của tướng, dữ liệu nền cần cho màn xếp đội. Combat worker dùng các module battle gốc; phần renderer được thay bằng event sink, không thay công thức gây sát thương hay RNG.

## Những phần cần chốt hoặc xác minh tiếp

- Người dùng đang được hỏi có cho phép luật riêng ở những phần không có bằng chứng server gốc hay không. Quy tắc rơi vật phẩm ải đang là **quy tắc riêng dự thảo**: mỗi ID vật phẩm được liệt kê có value dương cấp 1 đơn vị; tiền tệ dùng value trong bảng. Không coi đây là công thức rơi gốc. Giới hạn/chi phí có literal/function trong client được dùng đúng nguồn đó.
- Quảng cáo, nạp tiền, lịch/mùa giải và event có phần cấu hình ở server gốc. Chưa có bằng chứng/chứng từ thì không giả vờ xác nhận thanh toán/quảng cáo thành công.
- Combat giờ cần Node.js trên máy chạy server (Termux: `pkg install nodejs`, Windows: Node.js LTS). Thiếu runtime thì route kết thúc trận báo lỗi, không phát thưởng không được kiểm tra. Chưa đóng gói APK mới của nhánh này.
- Chưa xác nhận luồng phiêu lưu mới trên BlueStacks; headless replay không chứng minh mọi preload/animation/scene đều hoạt động.

## Thứ tự các nhóm tiếp theo

1. Hòm thư, bạn bè, bảng xếp hạng, cửa hàng và các thao tác túi.
2. Nâng tướng/kỹ năng/trang bị, nhiệm vụ và điều kiện mở khóa.
3. Các chế độ chiến đấu cá nhân: arena/3v3, luyện tập, viễn chinh, boss, endless, đảo, timePeak.
4. Bang hội, đội nhiều người, chiến trường/liên server, lịch event và các RPC quản trị.

Mỗi nhóm chỉ nâng trạng thái khi có xử lý và kiểm thử; không thay con số mục tiêu 342.
