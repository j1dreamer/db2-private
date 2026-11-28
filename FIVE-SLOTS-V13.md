# 5 ô nhộng / bảo vật và thức tỉnh 20

Build `eng-sp-sss-slots-snake-v13`, schema 30. Mở rộng này được chọn riêng từ cấu hình X7 trong `longzhidaoOverrides.json`, không phải mặc định ENG. Chỉ thay ba đường dẫn trong `clientRules.json`: hai danh sách ô và `ROLE.CONSTS.MAX_AWAKE_LEVEL`.

| Thức tỉnh của tướng | Ô nhộng dùng được | Ô bảo vật dùng được |
|---|---:|---:|
| 0–9 | 2 | 3 |
| 10–14 | 3 | 3 |
| 15–19 | 4 | 4 |
| 20 | 5 | 5 |

Mốc mở theo `EQUIP_TYPE_NEED_AWAKE_LEVEL_MAP` có trong ENG/X7. Không cần kích Chiến Hồn để mở ô. Không tự tăng thức tỉnh, cấp nguyên liệu hay cấp thêm trang bị. Điều kiện thức tỉnh và chi phí vẫn theo bảng ENG có sẵn đến cấp 20; tướng phải đủ phẩm và 20 sao như trước. Tiếp tục mở kỹ năng/giới hạn kỹ năng thức tỉnh theo các map ENG có sẵn đến 20.

Python đọc cùng override với battle worker và client. APK/IPA đã hỗ trợ clientConfig sẽ nhận cấu hình ngay khi mở lại game, và cấu hình được áp lại sau `buildExt.hackDataApi` để không bị trả về 3 ô. Các lần build client tiếp theo cũng dùng cùng file cấu hình. Gói cài APK/IPA hiện phát hành không được ký/build lại trong đợt này.

Đã kiểm tra các mốc 0/9/10/14/15/19/20, trang bị đủ 10 món, không nhân đôi bảo vật cùng ID, gỡ tất cả và giữ đồ qua khởi động lại. Chỉ số đưa vào trận được so với bộ dựng đội ENG và chạy engine PvP thật. Model giao diện ENG đọc đủ 5 món mỗi loại. Kiểm tra tăng thức tỉnh từ 10 đến 20 và từ chối lần 21 không trừ nguyên liệu. Chưa có xác minh ảnh trực tiếp trên iPhone.

Cập nhật bằng installer public đã pin commit v13, giữ database/token và tạo backup như trước. Đóng hẳn rồi mở lại game để tải clientConfig mới. Chỉ `/health` trả build v13 trên VPS mới chứng minh đã deploy; GitHub push không tự triển khai.

## Xà Đạo: giảm chờ xác minh sau trận

Trước đây `endlessHandler.pass` mới bắt đầu khởi tạo engine Node và mô phỏng lại trận. v13 bắt đầu tính trước từ `begin` trong lúc client đang đánh, dùng chung cơ chế giới hạn của đi ải: tối đa một tác vụ nền cùng lúc, tối đa 16 kết quả, hạn 15 phút. Nếu đội hình/tầng/seed/bản ghi không khớp, vẫn mô phỏng bình thường. Vẫn kiểm tra thắng/tick và giao dịch nhận thưởng một lần; không tin kết quả do client tự khai.

Nhật ký `endless_pass` có `verificationMs` và `prefetched` để đo trên VPS. `DB2_COMBAT_PREFETCH=0` tắt tính trước nếu cần. Cải tiến nhắm tới thời gian chờ sau trận, không khẳng định đã xử lý mọi nguyên nhân tải màn/ảnh trên iPhone hoặc độ trễ mạng. Benchmark ghi trong `analysis/five-slots-snake-v13-validation.json` là đo tại môi trường kiểm tra, không phải VPS người chơi.
