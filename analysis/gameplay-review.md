# Gameplay đối chiếu và phạm vi server

Nguồn đối chiếu chính là bundle client đã giải mã, 34 bảng dữ liệu và log trên thiết bị. Tìm được các video đúng tên:

- FYX Official: https://www.youtube.com/watch?v=cx_QezFdRPU
- Helixone: https://www.youtube.com/watch?v=vhMdoXwQEwk
- Mô tả từ nhà phát hành: https://play.google.com/store/apps/details?id=com.dp2.gp.apk

Công cụ tìm kiếm đọc được tiêu đề/mô tả video. Mở trang bị throttled, tải nội dung video bị proxy trả 403; chưa xem được video hoặc kiểm chứng từng cảnh. Vì vậy không suy ra schema hay công thức server từ các mô tả này. Mô tả nhà phát hành nêu các nhóm tính năng chiến đấu, thu thập/nâng cấp tướng, biến hình, PvP, phiêu lưu, event và bang hội; đây là danh sách tính năng được quảng bá, không phải bằng chứng backend hiện tại đã triển khai.

## Lỗi đã tái hiện bằng mã gốc

- `dailyTaskPanel.genData`: thiếu `task.receivedPointMap.daily/weekly`.
- `homeScene.genData`: thiếu `activity.scorePointInfoMap`.
- `coinTopNode.update_/tick_`: thiếu `timesMaxMap` và `nextRecoverTimeMap`.
- Hướng dẫn `firstBattle.test`/`smapBattleTo.test`: thiếu `smapStarMap[1][101]`; xuất hiện sau tuyển tướng khi hướng dẫn chuyển sang ải. Schema 6 tạo map rỗng, không đánh dấu thắng ải.
- Lỗi callback client có thể bị nuốt ở native; lỗi trong receiveCb còn có thể ngăn hàng đợi tiến tiếp. Bản client mới ghi báo lỗi, gỡ loading và tiếp tục hàng đợi khi xử lý phản hồi ném exception. Không gửi lại lệnh quay đã được server xử lý.

## Phần đã chạy được trong kiểm thử

Đăng ký/đăng nhập riêng, chọn/tạo/lưu nhân vật, rename, dữ liệu sảnh/thanh thể lực, vé khởi đầu cấp một lần, gacha thường/cao cấp với dữ liệu tướng và kết quả client, giftcode, thưởng event riêng và quản trị. Chỉ một phần đã được người dùng xác nhận trên BlueStacks. Kết quả headless không chứng minh toàn bộ giao diện hay trận đấu chạy được.

## Phần còn phải triển khai

Xem `route-coverage.json` để biết từng route. Cần triển khai và kiểm thử các chuỗi phiêu lưu: thông tin ải → xếp đội → khởi tạo trận → tính/kiểm tra kết quả → trừ thể lực/nhận thưởng/lưu tiến độ. Sau đó là nâng tướng/trang bị/kỹ năng, nhiệm vụ, cửa hàng, đấu trường, bang hội, chiến đấu liên server và các event gốc. Hiện các route đó vẫn trả lỗi chưa triển khai. Không gắn phản hồi thành công giả để ẩn phần gameplay chưa có.

## Tăng tốc client

Nút `Speed Nx` chọn hệ số 1–10 và lưu cục bộ. Scale engine thực tế bằng min(scale của game × hệ số riêng, 10); mức 0 của game vẫn giữ pause. Reset tốc độ của scene/trận không xóa lựa chọn riêng. Đổi hệ số trong trận yêu cầu cập nhật lại tốc độ Spine. Không sửa Date.now, timer thực, giá tiền, RNG hay thời hạn event. Cần xác nhận tương tác nút và hoạt ảnh trên thiết bị; ở 10× có thể bỏ qua nhiều khung hình chuyển động.
