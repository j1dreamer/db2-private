# Sự kiện SP · server v7

Client APK BoxInfo / IPA AutoPlans hiện tại dùng các màn ENG sẵn có; bản này thay server và web quản trị, không cần cài lại client chỉ vì đổi lịch/thưởng. Chưa xác nhận thao tác native trên iPhone/BlueStacks cho các bảng mới.

## Chỉnh trên web

Mở **Sự kiện → Lịch SP & vé → Thêm banner kế tiếp**. Chọn tướng, giờ bắt đầu/kết thúc UTC+7. Web tự đề xuất bắt đầu ngay sau banner cuối; thứ tự thực tế là theo giờ bắt đầu, không theo Item ID. Các lịch bật không được chồng nhau. Có thể đặt khoảng nghỉ, tắt hoặc sửa đợt. Nếu chưa tạo lịch nào, giữ banner Broly riêng mặc định; khi đã tạo lịch, ngoài các khoảng bật sẽ đóng SP.

Danh sách tướng chỉ lấy các class có vé `extra.wishSpClassId` tương ứng trong dữ liệu ENG (20 class hiện tại). Không coi thứ tự trong bảng là thứ tự phát hành. Không có lịch ra mắt server gốc trong source hiện có; các ngày và trình tự do quản trị đặt. Chọn tướng khác sẽ đổi ô tướng và các dòng đang dùng vé tướng trước sang đúng vé mới. Hình và tên lấy danh mục client; vật phẩm bổ sung chọn bằng danh sách có ảnh, ID và số lượng.

Mỗi đợt chỉnh được:

- Pool đúng 6 ô của màn ENG: 1 tướng và 5 vật phẩm, số lượng, sao và trọng số. Xác suất thường là trọng số/tổng; lượt bảo hiểm ra tướng ô đầu. Lượt bằng vé đúng tướng được ưu tiên, nếu thiếu đủ vé cho lượt 1/10/100 thì dùng Gem, không trừ vé một phần.
- Giá Gem/lượt, giới hạn lượt Gem/ngày và bảo hiểm. Lượt vé không tính vào hạn mức Gem.
- Đăng nhập: mốc ngày thực tế đã vào game, 1 ô cơ bản và tối đa 2 ô tinh anh; mốc và số lượng đều chỉnh được.
- Chiến lệnh: mốc điểm, 1 ô cơ bản và tối đa 3 ô tinh anh. Luật riêng mặc định: mỗi trận thắng/quét màn thành công ghi bởi server trong kỳ = 20 điểm. Có giá Gem mở tinh anh; 0 là miễn phí. Bù điểm chỉ trong 2 ngày cuối khi đã mở tinh anh, 2 Gem/điểm.
- Phúc lợi nạp: thêm/bớt mốc và chọn quà. Mốc đo **điểm nạp riêng**: nút **Ghi điểm nạp riêng** cần token quản trị và Player ID. Không có cổng thanh toán tự động; client không tự chứng nhận tiền thật. Thao tác này không tăng VIP hay Gem.
- Gói vé: giá Gem, giới hạn mua/ngày và đồ nhận. Gói cấp ngay khi mua; không nhận thêm lần nữa bằng nút nhận thưởng. Không giả lập giao dịch tiền thật. Không bớt số gói đã tạo vì ID gói gắn với vị trí; sửa giá/giới hạn hoặc tạo đợt mới.
- BXH ước: các khoảng hạng và quà. Xếp theo lượt ước đợt hiện tại, bằng điểm xếp Player ID tăng dần. Server kết toán và gửi thư một lần sau khi hết đợt, kể cả người chơi offline. Hộp thư đầy thì giữ chờ để thử lại, không bỏ quà.

Giữ ID khi sửa đợt để giữ lịch sử nhận, mua và bảo hiểm. Tạo ID mới cho đợt mới, kể cả cùng tướng. Đổi thưởng không đặt lại lượt nhận. Đợt đã kết toán không sửa lại. Dữ liệu lưu SQLite, giữ qua khởi động lại. Server đồng bộ thay đổi quản trị và ranh giới lịch cho người đang online (chu kỳ tối đa khoảng 10 giây).

## Sửa màn Hoạt động bị đơ

Log người dùng: `Cannot read property 'needMap' of undefined` trong `onSelectActivity_`. DTO `privateLogin` trước có `isUnlockMore` nhưng chưa gắn `isAdvanced` cho 7 dòng tinh anh; màn gốc đọc `advancedRewards[0].needMap` bị lỗi. Bản này gắn đúng cờ và chỉ đưa DTO đó vào màn Hoạt động, tránh màn xúc xắc tiếp tục xử lý mảng thưởng đã bị lọc của màn khác.

Client cũng tự sinh hai tab thẻ mà luôn đọc gói tuần/tháng/tháng lớn/năm. Server giờ có đủ bốn gói thẻ Gem riêng (ID 901–904), thời hạn và quà ngày; giá/thưởng là luật riêng, không xác nhận tiền thật. Mua tốn Gem bằng tổng số ngày × quà ngày; nhận ngay 1 Gem, sau đó 25/50/100/150 Gem mỗi ngày tương ứng tuần/tháng/tháng lớn/năm. Thưởng ngày sửa được ở Event hệ thống → Quà thẻ Gem riêng; thông số giá/thẻ gốc vẫn là mặc định trong `server/commerce.py`.

## Nguồn và giới hạn kiểm chứng

Dữ liệu tướng/vé/ảnh và các màn `spActivityPanel`, `activityPanel`, `dreamExtActivityPanel` được đọc trực tiếp từ client ENG. Lịch, giá mặc định, xác suất, mốc thưởng, chiến lệnh, giới hạn mua, điểm nạp và kết toán BXH là **luật riêng do dự án viết**, không gán là backend hoặc timeline phát hành gốc.

Các kiểm tra bao gồm giao dịch/nhận một lần/khởi động lại, đổi banner/qua ngày, đúng vé/pool/bảo hiểm, mail BXH, API quản trị có quyền, đồng bộ người online, đoạn genData gốc và thao tác web thật. Các mô phỏng client không thay phép thử render/touch native. Xem `analysis/sp-events-validation.json`.

## v10 · Tạo lịch hàng loạt từ danh sách ENG

Web → Sự kiện → Lịch SP & vé → **Tạo lịch từ danh sách ENG**. Có đủ 20 tướng có vé tương thích; mỗi dòng có ảnh tướng, ảnh vé và ID. Chọn/bỏ chọn, đưa lên/xuống để đặt thứ tự, chọn ngày bắt đầu UTC+7 và số ngày mỗi banner (1–30). Xem khoảng lịch trước khi bấm tạo. Mặc định 5 ngày là luật riêng, không phải lịch gốc. Các banner được thêm nối tiếp, không ghi đè lịch có sẵn; lịch chồng hoặc dữ liệu bị sửa ở cửa sổ khác bị từ chối toàn bộ. Có thể chỉnh riêng từng banner và thưởng sau khi tạo. Không tự tạo lịch khi nâng cấp để tránh đổi sự kiện đang chạy.

Danh sách mặc định theo classId trong dữ liệu ENG; chưa xác minh thứ tự/ngày ra mắt gốc. Chưa tìm được lịch SP có ngày và trình tự xác minh từ trang X7 đúng game 17327. Không dùng thông báo tích nạp hay trò One Piece cùng tên để dựng lịch Dragon Ball. Mỗi nguồn được thể hiện rõ trong API `spScheduleSources`; lịch do quản trị tạo mang nguồn private-server-rule. Xem `analysis/sp-roster-sources.json`.

| Tướng ENG | Role ID | Vé ID |
|---|---:|---:|
| Broly | 105504 | 11 |
| Goku Vô Cực | 105604 | 12 |
| Vegito | 105704 | 13 |
| Gogeta | 105804 | 14 |
| Shanpa | 106004 | 15 |
| Beerus | 106104 | 16 |
| Whis | 106204 | 17 |
| Son Goku Bản Năng Vô Cực | 107604 | 18 |
| Broly Full Force | 107704 | 19 |
| Gogeta SSJ4 | 107804 | 20 |
| Jiren Hồn Đỏ | 107904 | 21 |
| Vegito SSJ Blue | 108004 | 22 |
| Gogeta SSJ Blue | 108104 | 23 |
| Gohan BEAST | 108204 | 25 |
| Black Golden Frieza | 108304 | 24 |
| Vegeta Ultra Ego | 108404 | 26 |
| Vegito Vô Cực | 108504 | 27 |
| Trunks (XENO) | 108604 | 28 |
| Android 21 | 108704 | 29 |
| Piccolo (Orange) | 108804 | 30 |
