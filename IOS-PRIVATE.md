# IPA ENG SSS/SP + GM v2

File hiện tại: **DB2-ENG-SPSSS-GM-unsigned.ipa**. Tải bằng `Download-Clients.zip`; Mac chạy `python3 Download-Clients.py --only ipa`. Chủ dự án đã cho phép công khai IPA.

IPA có gameplay ENG, tiếng Việt, Speed 1–10×, bỏ hướng dẫn và GM được kiểm quyền giống APK. Native Mach-O/framework/SDK giữ byte gốc. Các chữ trong ảnh dựng sẵn có thể chưa dịch.

IPA **chưa ký**, cần ký hợp lệ bằng công cụ/chứng chỉ của bạn trên Mac rồi cài qua cáp. Không đưa mật khẩu Apple hoặc chứng chỉ riêng lên repo/chat. Bundle `com.j1dreamer.db2.private`; profile/chữ ký cũ được gỡ và cần ký lại đúng các framework/dylib khi công cụ yêu cầu.

Server phải là build `eng-sp-sss-gm-v2` (schema 30). Trên iPhone nhập địa chỉ LAN/Tailscale thật của máy chạy server. Chưa có mạng riêng Cloud→iPhone hoạt động sẵn và chưa kiểm native iPhone.

Xem `analysis/eng-gm-ios-build.json` và `analysis/eng-gm-canonical-validation.json`. Các báo cáo `analysis/ios/` và `longzhidao-*` thuộc giai đoạn trước.
