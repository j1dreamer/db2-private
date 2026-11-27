# Ubuntu combat và IPA rương · v8

## Combat trên VPS

Ảnh báo `Combat cần Node.js` là lỗi runtime của server, không phải lỗi từng map. Worker chiến đấu dùng Node để chạy engine khôi phục từ client. Bản v8 tìm Node 22+ qua `DB2_NODE`, PATH, bản Node do bộ cài đặt ở `/opt/db2/node/bin/node` và các vị trí hệ thống. Không tải Node trong RPC trận đấu.

Bộ cài Ubuntu cài Node LTS nếu cần, kiểm checksum từ nodejs.org, ghi đường dẫn tuyệt đối vào `/etc/db2/server.env`. Không dùng bản nvm trong `/root` hoặc `/home` vì dịch vụ bật `ProtectHome=true`. File user đăng nhập nhìn thấy không bảo đảm user dịch vụ nhìn thấy được.

Chạy bộ cài v8 trên VPS để cập nhật; giữ dữ liệu và backup như trước. Sau đó `/health` phải có build `eng-sp-sss-combat-box-v8` và `combat.available: true`. Nếu thiếu runtime, health ghi `status: degraded` cùng hướng dẫn thay vì báo máy chủ sẵn sàng chiến đấu. Kiểm thực tế trên VPS vẫn cần sau khi người dùng chạy bộ cài; cloud chưa SSH được vào VPS.

## Rương và font IPA

Cài IPA **BoxRestore** mới qua Sideloadly. Các nút chọn, đổi số lượng và xác nhận trong rương chọn trở về luồng ENG gốc; giữ số ×N và nút đóng. Bỏ thanh nút mở rương do dự án thêm vốn đè lên luồng gốc. AutoPlans, tốc độ và chọn IP giữ nguyên.

Các nhãn bổ sung được cấu hình khi node chưa kích hoạt, có khung chữ dương và dùng Canvas/system Arial. Chữ Việt trong nhãn/RichText cũ cũng chuyển sang font hệ thống; xử lý cả khi đổi nội dung bằng `setVertsDirty`, không chỉ khi mở cảnh. Không thay hình ảnh có chữ hay luật phần thưởng để chữa font. Render iPhone sau ký/cài cần người dùng kiểm tra.

Đối chiếu 34 bảng canonical với native resources + data overlay của IPA. Không sửa pool gốc SP/SS/SSS, không biến mảnh ×60 thành tướng nguyên. Rương 721–724 là lựa chọn tướng nguyên theo cấu hình; các rương 706–712, 726–727 chọn mảnh theo bảng. Những tên chung như “Hero” không đủ để suy ra quà: xem ID/type/số lượng trong web.

Đã sửa lỗi mở rương vàng #343: lượng vàng trong bảng gốc có thể tới 9 triệu, trước đó bị chặn nhầm bởi giới hạn 1 triệu dùng cho vật phẩm. Giới hạn rộng hơn chỉ áp dụng cho tiền tệ; kiểm số rương/số lượt/chọn quà vẫn giữ.

## Rà toàn bộ web và rương

Web chi tiết rương hiển thị trực tiếp phần thưởng, ảnh, ID, loại vật phẩm và số lượng của một rương, tách nhóm cố định/ngẫu nhiên/chọn. Rương cấu hình theo từng món #351 không có phần thưởng mặc định trong bảng; web ghi rõ thay vì tự đặt quà.

Các báo cáo:

- `analysis/catalog-all-items-web-validation.json`: 2.845 trang chi tiết HTTP và 1.083 ảnh dùng chung, không lỗi. Đây là kiểm tra danh mục/ảnh, không coi là đã dùng mọi vật phẩm native trong game.
- `analysis/all-box-open-validation.json`: 53 rương có cấu hình, 374 ca mở/chọn, trong đó 332 ca lựa chọn; #351 cần cấu hình instance. Các rương ngẫu nhiên được mở mẫu; không dùng số mẫu đó để kết luận xác suất.
- `analysis/box-client-server-tables.json`: đối chiếu bảng client/server.
- `analysis/admin-browser-tests.json`: thao tác web desktop/mobile, chọn quà ×60 và điều hướng tới vật phẩm con.

Không xóa hồ sơ người chơi hay thay đổi dữ liệu VPS khi chạy các bộ kiểm tra này; dùng SQLite tạm riêng. Chưa xác minh các màn native trên iPhone hoặc từng ải riêng lẻ sau triển khai VPS.
