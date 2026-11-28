# Cập nhật iPhone chỉ bằng iPhone + VPS

## Phần đang dùng được, không phải ký lại

Cập nhật server/web bằng SSH thay được lịch SP, shop/gói/quà, giờ sự kiện, vật phẩm và các xử lý backend. Native client ENG đã có clientConfig.runScriptInfo để nhận script giới hạn của server khi đăng nhập; v11 dùng nó cho xem trước rương và tắt Time Peak cũ. Không phải mọi thay đổi native/binary/asset đều hot-update được. Cần thoát hẳn game rồi vào lại để tải config.

## Khi phải thay IPA

Có quy trình Linux/VPS ký IPA rồi phát một trang cài qua Safari, không cần laptop cho mỗi lần cập nhật. Điều kiện trước khi thực hiện:

1. Chứng chỉ phân phối hợp lệ và private key tương ứng (thường đóng thành .p12).
2. Ad Hoc .mobileprovision có App ID/bundle ID khớp IPA và UDID iPhone đã đăng ký; profile/cert chưa hết hạn hoặc bị thu hồi.
3. IPA mới giữ entitlement đúng profile; máy iPhone chấp nhận bản ký đó. Có thể cần cài lại nếu đổi team/bundle ID, nên không hứa cài đè giữ dữ liệu giữa hai bộ ký khác nhau.
4. HTTPS hợp lệ để phục vụ IPA đã ký và manifest.plist. Người dùng mở Safari và bấm Cài đặt; không thể âm thầm đẩy/cài ứng dụng từ một phiên SSH.

[Apple: tạo Ad Hoc provisioning profile](https://developer.apple.com/help/account/provisioning-profiles/create-an-ad-hoc-provisioning-profile) yêu cầu App ID, distribution certificate và các thiết bị đã đăng ký. [zsign](https://github.com/zhlynn/zsign) là công cụ bên thứ ba mã nguồn mở hỗ trợ ký trên Linux không cần Xcode/macOS; công cụ không cấp quyền ký Apple và không thay việc có chứng chỉ/profile hợp lệ.

Với tài khoản Apple ID miễn phí hiện dùng Sideloadly, chỉ có IPA hoặc VPS thì chưa có đủ điều kiện cho OTA Ad Hoc. Không biến bản ký miễn phí thành bản OTA tin cậy bằng cách đổi URL, DNS hoặc manifest. SideStore/AltStore là hướng khác nhưng thường cần bước chuẩn bị/pair thiết bị ban đầu; chưa coi máy hiện đã sẵn sàng chỉ vì đã cài game bằng Sideloadly.

Nếu đã có Apple Developer trả phí nhưng chưa có bộ ký, có thể chuẩn bị private key/CSR trên VPS rồi dùng cổng Developer qua Safari để cấp cert và đăng ký iPhone/profile. Cách tạo CSR và quản lý chứng chỉ cần làm theo tài khoản của chủ máy; không gửi Apple ID/password/private key vào chat.

## Trạng thái của dự án

Chưa nhận .p12/.mobileprovision hoặc xác minh loại tài khoản nên chưa ký IPA hay mở endpoint OTA trên VPS. Không lấy private key từ IPA đã cài; IPA không chứa private key ký ứng dụng. Khi có đủ bộ ký, đặt file trên VPS qua SSH/SFTP trong thư mục root-only, giữ chứng chỉ/private key ngoài repo và ngoài web root; mới cấu hình ký, manifest và link cài giới hạn. Public admin tiếp tục giữ hai lớp xác thực; tiến trình cài iOS cần link tải phù hợp, không giả định nó chia sẻ cookie/BasicAuth của Safari.

Chưa xác minh cài OTA trên iOS 26.5; tài liệu này là phương án khả thi có điều kiện, không phải thông báo đã triển khai.
