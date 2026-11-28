# v17 · Điều khiển gọn trong game

Áp dụng UI UX Pro Max (`.claude/skills/ui-ux-pro-max/SKILL.md` trong bộ source có sẵn): vùng chạm lớn, nhãn rõ, tương phản và phản hồi tại ô nhập. Stack thật là Cocos Creator/JSB; không thay bằng UI web.

- Sửa EditBox: dùng một dòng; neo trái/trên đúng cách Cocos cập nhật label, căn chữ từ lề 12, giới hạn trong chiều rộng ô. Áp dụng chung IP, tên và số lượt.
- Kết nối: thử server trước khi lưu, hiển thị đang thử/lỗi ngay trong hộp; không lưu IP lỗi rồi tự khởi động lại.
- Chạm icon tốc độ mở bảng Auto **288 ×304 đơn vị canvas** ở mép trái, không có lớp phủ chặn toàn màn. Một điểm / đa điểm / ghi thao tác; mẫu nhanh lặp liên tục, có dừng rõ ràng.
- Khi chạy, dùng thanh nổi; nút **Ẩn** thu thành nút Auto nhỏ mà không ngừng chạy. Chạm lại để mở thanh. Thanh đầy đủ vẫn kéo được. Chỉnh/lưu/thư viện là thao tác tùy chọn.
- Điểm kéo và điểm phát lại chuyển đổi qua camera Cocos theo hai chiều, không nhầm tọa độ màn hình với tọa độ world khi camera co giãn/tịnh tiến.
- Chỉ dùng trong game; ra nền tự tạm dừng, màn đăng nhập không mở auto. Không điều khiển app khác hoặc toàn iOS.
- Giữ 2 giây trên icon tốc độ vẫn mở thanh kéo 1–10×.

[Ảnh dựng từ control đang triển khai](docs/ui-v17-preview.png). Đây chưa phải ảnh chạy trên iPhone. Test dùng tọa độ camera có scale/offset, chuỗi chạm/giữ/thả, ghi vuốt, tạm dừng, scene và lưu/đọc kịch bản.

Client v17 gồm cả nội dung v16: [rương/thưởng X7 và giảm chờ](X7-CONTENT-V16.md). Cần cập nhật server và ký/cài lại IPA v17. Dữ liệu tài khoản trong VPS giữ nguyên.
