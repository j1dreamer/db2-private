# Server v11 · shop, vé, xúc xắc và thu hồi

Build `/health`: `eng-sp-sss-economy-recall-v11`, schema vẫn 30, 342 route game. Các thay đổi dưới đây ở server/web; không cần cài lại APK/IPA chỉ để nhận phần thưởng/lịch/gói mới. Khởi động lại game sau cập nhật để lấy clientConfig và phần xem trước rương mới. Không xóa SQLite, reset lượt đã nhận, token hoặc mật khẩu Caddy.

## Thưởng thử đã được người dùng chọn

Bổ sung vào rương sao có sẵn, giữ phần thưởng gốc:

| Mốc | Phần bổ sung mặc định | Nguồn |
|---|---|---|
| Đi ải 14 sao | Phiếu nạp #2 ×1 | Luật thử do server mình đặt |
| Đi ải 21 sao | Phiếu nạp #2 ×2 | Luật thử do server mình đặt |
| Rương cuối viễn chinh thường, cửa 13 | Phiếu #2 ×1 | Luật thử do server mình đặt |
| Rương cuối viễn chinh Lục đạo, cửa 12 | Phiếu #2 ×1 | Luật thử do server mình đặt |

Chỉ nhận khi claim rương hợp lệ; rương sao đã nhận không được cấp bù hay nhận lại. Viễn chinh tính mỗi lượt nhận rương cuối hợp lệ, kể cả càn quét/lượt reset theo giới hạn gốc. Bỏ trống một nhóm trong web để tắt phần bổ sung. Phiếu #2 là tiền đổi trong game, không phải xác nhận tiền thật và không tăng VIP/tiền nạp thực.

## Shop & vé nạp trên web

Menu mới **Shop & vé nạp**:

- **Thưởng & hạn vé**: chọn đồ bằng ảnh/ID/số lượng cho bốn mốc trên. Đổi giờ/phút hết hạn phiếu #1 theo UTC+7, mặc định 23:59:59. Chỉ phiếu mới nhận dùng giờ mới; không kéo dài phiếu đã có. Phiếu #2 không tự hết hạn. Hạn chi tiết của từng ô hiện trong Kho đồ.
- **14 shop ENG**: 295 dòng nguồn, giữ nhóm quay, điều kiện cấp và ID hàng. Sửa đồ nhận, tiền trả, giá đơn vị, lượng tối thiểu/tối đa, trọng số, VIP, bật/tắt, mua không giới hạn và giờ tự làm mới. Giá thực tế trong kho = giá đơn vị × số lượng. Sửa giá/thưởng không tự mở lại nhóm đã bán trong cùng kỳ; đổi kỳ hoặc refresh hợp lệ mới có kho mới.
- **Gói ưu đãi**: 6 gói riêng và 4 thẻ Gem có màn client tương thích. Sửa giá Gem/phiếu, quà, lượt mỗi ngày, bật/tắt và lịch theo giờ/ngày/tuần. Giữ lịch sử mua. Thẻ đã đóng vẫn giữ DTO bắt buộc để client không crash, server chặn mua và có mô tả đóng; không cam kết ẩn toàn bộ khung native. Thời hạn loại thẻ giữ 7/30/30/365 ngày; quà mỗi ngày đã chỉnh được ở Event hệ thống → Quà thẻ Gem riêng.
- **Quầy đổi**: 5 nhóm riêng, sửa tiền/quà/giới hạn, thêm dòng với ID mới, đặt thời gian/lặp. Giữ các ID/thứ tự cũ để bảo toàn lịch sử mua; không xóa dòng cũ rồi tái sử dụng ID. Quầy thường chỉ một món nhận theo hợp đồng màn ENG; quầy exchange2 hỗ trợ nhiều món trả/nhận.

Chỉnh sửa có kiểm version tránh ghi đè giữa hai tab. Người online nhận đồng bộ; quầy/gói ngoài lịch bị server từ chối kể cả client còn hiển thị cũ. Catalog shop nguồn ENG có ba dòng shop 13 tham chiếu đồng tiền #84 thiếu định nghĩa; lớp tương thích ánh xạ sang #97 đúng `server.CONSTS.ENTITY_ID.TOP_ARENA_3V3_COIN`. Không chỉnh file bảng ENG gốc. Trường hợp minCount > maxCount trong dữ liệu đã có fallback dùng min; khi chỉnh mới buộc max >= min.

## Sự kiện xúc xắc

Sự kiện → Event hệ thống → **Bàn cờ mộng ước**: thời gian UTC+7, lặp/ngừng lặp, bật/tắt, 4 nhóm ô và quà qua vòng đã chỉnh được bằng ảnh. **Nhiệm vụ xúc xắc** chỉnh quà theo lượt.

v11 sửa tiến độ bàn cờ theo kỳ thời gian đã đặt: không mất vị trí/lượt chỉ vì sang thứ Hai trong cùng kỳ dài. Khi sang kỳ mới, reset vị trí/cờ hiệu ứng/lượt của riêng xúc xắc. Nhiệm vụ xúc xắc kế thừa kỳ bàn cờ nếu chưa có lịch riêng; nhận quà một lần theo kỳ, không dùng lại khóa nhận tuần cũ. Vé xúc xắc #94/#95 giữ qua kỳ theo mô tả ENG. Các quy tắc ô ngẫu nhiên/hiệu ứng là phần triển khai riêng đã có, không gọi là backend X7 gốc.

## Khôi phục thưởng ải hằng ngày

57 smap thuộc bmap type 3/4/5 đã có `mob.dropClassId` trong ENG, nhưng reward_plan trước chỉ đọc specifyDropEntityIds/specifyDropValues. v11 nối các mob của cả hai zone sang dropData, giữ nhóm/trọng số/số lượng của bảng nguồn. Chọn loot một lần lúc begin, lưu trong adventure_runs; thắng mới cấp, thua không cấp, nhận lại bị chặn. Càn quét dùng cùng reward_plan và hạn lượt/ngày có sẵn.

Ví dụ nguồn: 30101 → #49904 ×4 + #49902 ×15; 30401 → #20002 ×12 + #20001 ×28; 30501 → #202 ×6 + #201 ×10; 30601 → #40115 ×20. Coin/EXP gốc giữ nguyên. Đây là khôi phục liên kết bảng có bằng chứng, không tự bịa quà mới. Không khẳng định đã xác minh mọi mode PvP/chiến trường từ ảnh Victory không có tên màn.

## Giảm chờ xác minh sau trận

Server có thể chạy trước một replay tự động ngay khi beginSmap đã lưu. Cache tối đa 16 kết quả trong 15 phút, chỉ một replay nền đang chạy trên mỗi event loop. Khi end, chỉ dùng lại khi player/seed/đội/ship/smap và các bản ghi kỹ năng khớp; vẫn đối chiếu thắng/sao/tick và kiểm run chưa nhận. Khác đầu vào hoặc có thao tác tay thì replay lại. Không tin kết quả do client khai.

Log `end_smap` có `verificationMs` và `prefetched` để đo trên VPS. Benchmark cục bộ trong kiểm tra này: khoảng 2.3 giây tính trước, khoảng 59 ms xử lý end khi cache đã xong. Không coi số này là độ trễ mạng hoặc cam kết tốc độ trên VPS. Nếu cần tắt tính trước: thêm `DB2_COMBAT_PREFETCH=0` vào `/etc/db2/server.env` rồi restart db2. Engine giới hạn hiện có vẫn áp dụng.

## Kho đồ & thu hồi

Menu mới hoặc nút trong hồ sơ người chơi: xem ô túi, ID, số lượng, hạn dùng, cả item thiếu định nghĩa. Thu hồi một ô hoặc theo Item ID trên một người/toàn server, theo số lượng mỗi người hoặc toàn bộ. Bắt buộc xem trước tổng người/ô/số lượng và xác nhận. Nếu kho đổi sau preview thì từ chối để xem lại. Chỉ tác động túi, không đụng đội hình/trang bị/thư chưa nhận.

Mỗi lần thu hồi lưu archive riêng trong SQLite, có mã request chống chạy lặp, audit và bản before/after. Nút Phục hồi chỉ khôi phục nếu ô vẫn đúng trạng thái sau thu hồi; không ghi đè đồ mới. Mọi người trong lượt thu hồi/khôi phục xử lý cùng transaction. Không có thu hồi tự động khi cài v11; người quản trị chọn rõ món lỗi trước.

## Giới hạn và chứng minh

- Không có source backend gốc hay lịch phát hành chính thức X7; giữ phân biệt dữ liệu ENG, luật riêng và phần chưa kiểm chứng. Đây không phải tuyên bố “copy hết/verify toàn bộ gameplay”.
- `analysis/economy-v11-validation.json`, test server và các report browser ghi rõ phạm vi đã thử. Chưa thao tác native trên iPhone hoặc deploy VPS người dùng từ cloud.
- clientConfig dùng hook script ENG có sẵn để cập nhật xem trước rương và ẩn nút Time Peak thử nghiệm trên client cũ. Kiểm ES5/VM; chưa coi là đã fix toàn bộ font/prefab IPA. Các thay đổi binary/native vẫn cần IPA ký hợp lệ.
