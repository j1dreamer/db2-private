# ENG SSS/SP + GM v2

Theo yêu cầu chủ dự án, đổi bộ gameplay về client ENG gốc. Nhóm tướng S/SS/SSS/SP đã tồn tại trong bảng ENG: không đổi skill/tiến hóa để gán LR/XR thành SP. Giữ hai định nghĩa hộp 373/379 từ IPA để tương thích inventory.

Bỏ 20 module gameplay Long Chi Đảo từng được port; không nạp 22 flag/13 config override của nhánh đó. `clientRules.json` chỉ là các literal khởi động đã đọc từ ENG. `client/main.decoded.js` khớp byte giải mã từ archive gốc đã được cung cấp.

Các sửa có chủ đích, được ghi là mã dự án: VIP lifecycle, catalog sync, bỏ popup thưởng rỗng, UI và RPC GM kiểm quyền, transport server riêng, tiếng Việt, Speed 1–10× và bỏ hướng dẫn. Backend Python không phải backend gốc ENG.

Log người dùng 26/11/2026: `endlessRewardPanel.genData` khi sync sảnh, `ticketWeekCard` khi mở thẻ và popup rỗng sau dùng danh hiệu. VIP được kiểm bằng lifecycle deferred repaint; danh hiệu/khung bằng transaction và guard thật của baseView. Thẻ tuần Long không bị ép bật trong bản ENG.

Quyền GM do admin cấp; người chơi không thể tự gửi `privateGM: true` để có quyền. RPC mới chỉ chỉnh tài khoản đã chọn, kiểm giới hạn và ghi audit. Cấp vật phẩm từ catalog typed, không có trường giá hay quyền tùy ý từ client. Thu hồi quyền đóng panel ở client và chặn mọi lệnh mới tại server.

Cập nhật: dùng APK/IPA và source **cùng bản** ở nhánh `eng-sp-sss`. Nếu giữ database đang thử, lưu bản sao trước; chuyển baseline có snapshot và tính lại chỉ số. Nếu dùng mới, không copy data cũ sang. `/health` phải là `eng-sp-sss-gm-v2`, schema 30.

Báo cáo tổng, các bản dựng và đối chiếu thật nằm trong `analysis/eng-gm-*`. Các luồng chưa thử trực tiếp trên BlueStacks/iPhone được giữ trạng thái chưa xác minh; không coi headless là bằng chứng native.
