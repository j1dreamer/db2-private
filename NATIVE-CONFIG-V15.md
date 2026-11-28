# Cần cập nhật client v15 một lần

Server build `eng-sp-sss-native-config-v15`, schema 30. Không xóa database hay tài khoản.

Các bản client private trước v15 có hai chặn được đóng sẵn trong `tools/build_client.py`: vô hiệu `runScriptInfo.script` và thay `eval(data.msg.body)` bằng cảnh báo. Vì vậy thử trên callback ENG chưa đóng gói ở v14 đã cho kết luận sai. Chỉ cập nhật VPS không thể sửa các bản đó. v15 kiểm tra script sau đóng gói trong chính APK/IPA.

Client v15 giữ cả hai chặn. Thay vì chạy mã từ mạng, nó nhận `runtimeConfig` có trường giới hạn: version, maxAwake, equipmentSlots và chapterBoxes. Không đọc đường dẫn thuộc tính tùy ý hoặc eval script. Gói cài đóng sẵn cấu hình mở 5 ô, thức tỉnh tối đa 20, tắt chế độ thức tỉnh đơn giản, sửa tên/font rương, bỏ Time Peak thử nghiệm và phân biệt ID người chơi/robot. Cấu hình được áp lại sau dataApi init. Mốc mở ô vẫn 10/15/20 theo cấu hình đã kiểm tra; không tăng cấp tướng hay cấp đồ tự động.

## Tải và cài

Dùng Download-Clients.zip / Download-Clients.bat mới. File đầu ra có `v15` trong tên. Không cần tự ghép phần, APK/IPA cũ hoặc Git; downloader lấy các nguồn được pin SHA rồi ghép thành file đầy đủ và kiểm SHA.

Android: cài đè APK đã ký cùng chứng thư phát triển. iOS: IPA chưa ký, dùng Sideloadly ký/cài lại với Apple ID của mình, cùng bundle ID. Apple ID miễn phí không hỗ trợ một link OTA từ VPS để cài IPA này trực tiếp; cần máy tính ký/cài như lần trước. Không gỡ app trước để tránh mất thiết lập cục bộ.

Sau khi cài mở tab Thức Tỉnh. Tướng dưới thức tỉnh 20 phải hiện phần nâng ở bên trái; 5 Z đỏ phía trên nhân vật không phải bằng chứng cấp thức tỉnh hiện tại. Chưa có test hình ảnh trên thiết bị iPhone thực tế.

Bản này không còn gửi script cập nhật qua onNewMsg khi vào nhân vật. Server mới vẫn hỗ trợ client cũ chơi với phần tương thích hiện có, nhưng các sửa giao diện cần client v15.
