# Điều khiển trong game · IPA AutoPlans

Cài `DB2-ENG-SPSSS-AutoPlans-unsigned.ipa` đã ký bằng Sideloadly. Server ENG v6 và APK không đổi trong lần cập nhật này.

## Nút tròn và kết nối

Kéo nút tròn để di chuyển. Giữ yên **2 giây** mở thanh tốc độ **1–10×**, áp dụng ngay. Chạm nhanh mở thư viện kịch bản auto. Khoảng chờ auto/ghi dùng thời gian thực, không nhân tốc độ game.

Server riêng dùng địa chỉ đầy đủ `http://IP-TAILSCALE:20003`. Hộp có nút đóng; thử kết nối khởi động tối đa 8 giây. Mất mạng hủy hàng đợi/reconnect cũ, dừng auto và trở về sửa IP.

## Tạo và sửa kịch bản

1. Chạm nút tròn → **Tạo** → đặt tên, chọn một điểm, nhiều điểm hoặc bản ghi.
2. Với một/nhiều điểm: kéo vòng số tới vị trí cần chạm. Nút **+ / −** thêm/bớt điểm, tối đa 20.
3. Chạm vòng số để sửa thời gian chờ, thời gian giữ, thứ tự hoặc xóa điểm. Chờ 100–600000 ms, giữ 20–10000 ms.
4. Bánh răng mở cài đặt số lượt; 0 chạy liên tục. Bấm **Lưu** để giữ kịch bản, **▶** để chạy.
5. Khi chạy, dùng Tạm dừng/Tiếp tục hoặc Dừng trên thanh nổi. Kéo tay nắm để di chuyển thanh.

Một lượt đi qua toàn bộ điểm theo thứ tự. Tạm dừng giữa lần giữ chạm sẽ gửi hủy touch; tiếp tục chạy lại cử chỉ bị ngắt. Điểm dùng tọa độ theo tỉ lệ Canvas; nếu bố cục game thay đổi cần sửa lại vị trí.

## Ghi → lưu → phát

Tạo loại **Bản ghi** chỉ chuẩn bị ghi. Bấm **●** trên thanh nổi để bắt đầu, thao tác chạm/kéo trong game bằng một ngón, bấm **■** kết thúc rồi đặt tên/lưu. Mở thư viện để chọn bản ghi và Phát hoặc sửa số lượt. Giới hạn khoảng 2 phút/2000 sự kiện; không ghi bàn phím hoặc thao tác ngoài app.

Có thể lưu tối đa 30 kịch bản riêng. Bản nháp tách khỏi bản đã lưu; đóng khi đang sửa có Lưu/Bỏ thay đổi/Quay lại. Bỏ thay đổi không ghi đè bản đã lưu. Điểm/bản ghi cũ tự chuyển sang danh sách mới, giữ nguyên khóa dữ liệu cũ.

Auto và ghi tiếp tục qua chuyển cảnh khi app còn mở, chờ ổn định cảnh trước khi phát tiếp. Xuống nền kết thúc bản ghi thành nháp và tạm dừng phát, không tự chạy lại. Mất mạng hoặc quay về đăng nhập dừng phát. Mở bảng điều khiển tạm dừng phát.

## Nguồn và kiểm chứng

Đây là mã Cocos do dự án viết, dựa trên mô hình plan/point/record đọc tĩnh từ SDK X7. Không nhúng SDK Android X7 hoặc ảnh giao diện X7; chưa xác minh giống từng điểm ảnh hay đầy đủ hành vi native. Người dùng đối chiếu cách dùng sau khi ký/cài. Không gọi API cấp vật phẩm hoặc bỏ qua kiểm quyền server.

24 kiểm tra tập trung đã qua; có kiểm script thật được đóng gói trong IPA và checksum toàn file. Xem [báo cáo](analysis/ios-autoplans-validation.json) và [nguồn tham chiếu X7](docs/x7-auto-reference.md). Ảnh `docs/autoplans-*.png` là bản dựng bố cục từ cây node mô phỏng, **không phải ảnh chạy trên iPhone**. Chữ, touch và cảm giác dùng trên iPhone vẫn cần xác nhận.
