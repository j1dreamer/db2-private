# v16 · Rương X7, thưởng và kiểm tra trận

- Client mới: số lượng nằm trên icon, tên ngắn bên dưới; bỏ phần đếm rời/phía trên trong cửa sổ chọn. Dùng nút đóng/xác nhận gốc. Chọn mở một rương mỗi lần theo bố cục X7.
- Rương #724 lấy đúng X7 17327: 20 loại mảnh SP ×60. Rương #351 vẫn là rương SP riêng tương thích. Các rương có định nghĩa chung và bảng gacha/drop giống ENG đã đối chiếu, không tự thay tỉ lệ.
- Nhập bảng X7 `signIn` (170 dòng đổi), `task` (235), `arenaRewards` (29), `shop` (2). Hai dòng shop X7 bị đảo min/max được chuẩn hóa để không sinh số lượng âm/ngược. Nhiều phần thưởng Gem/EXP cao hơn ENG 10 lần; không truy lĩnh phần đã nhận. Tài khoản, vật phẩm và tiền đang có giữ nguyên.
- Web → Sự kiện → **Mẫu sự kiện & shop X7**: tạo tiêu phí Gem, cày ải hoặc quay nhận quà; mở shop/vé, xúc xắc và lịch SP. Lịch SP → Chỉnh banner → Gói ưu đãi → **Thêm gói mua tướng trực tiếp**. Có thể chọn tướng khác bằng bộ chọn vật phẩm, giá, giới hạn, lịch; lượt mua độc lập lượt quay/bảo hiểm.
- Chưa có dữ liệu server online X7 về lịch, giá, tỷ lệ sự kiện: các luật này do backend riêng thực hiện và chỉnh trên web. Không nhận đây là bản sao toàn bộ server X7.
- Phiếu thường #2: 14 sao +1, 21 sao +2; rương cuối viễn chinh thường cửa 13 +1, lục đạo cửa 12 +1. Nhận/quét đều áp dụng, chỉ phát một lần. Client hiển thị thêm thưởng rương cuối để tránh nhầm với quà từng trận.
- Combat: dùng tiến trình Node bền vững, VM riêng mỗi lượt; mặc định 1 worker, heap tối đa 384 MB. Mọi chế độ gọi engine dùng chung. Viễn chinh, võ đài và đặc huấn bắt đầu kiểm tra trong lúc client đánh; đi ải/Xà Đạo giữ cache đã có. Đổi đội, seed hoặc kỹ năng không khớp vẫn replay và kiểm tra lại. HP/MP, thắng/thua và chống nhận thưởng lặp giữ nguyên.
- `DB2_BATTLE_PERSISTENT=0` trở về tiến trình một lần; `DB2_COMBAT_PREFETCH=0` tắt tính trước. VPS 1 CPU nên giữ 1 worker. Không có kết quả đo trên VPS thật ở lần đóng gói này.

Cần cập nhật **cả server và APK/IPA v17** cho dữ liệu rương/thưởng và giao diện. #724 từ chối client cũ để không tiêu rương với danh sách thưởng sai. Không bật tải/chạy JavaScript từ xa. IPA chưa ký: ký bằng bộ chứng chỉ của bạn trước khi cài.

Nguồn: `analysis/x7-box-gacha-v16-source-audit.json`. Chưa kiểm tra giao diện trực tiếp trên iPhone; các bài kiểm tra dùng controller client và engine phục hồi.
