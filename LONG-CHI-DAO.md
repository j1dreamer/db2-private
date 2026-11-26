# Long Chi Đảo — bản chuyển dữ liệu và Việt hóa

Bản này lấy dữ liệu/gameplay đọc được từ **龙之岛-1W免费版, X7 #17327**, giữ tài nguyên và khung client ENG/IPA để tương thích. Backend Python do dự án viết; không có source server gốc. Không thể khẳng định mọi luật kín của server Long Chi Đảo giống hệt.

## Phần lấy từ client Trung

- Đã tải và kiểm trực tiếp APK, JSC XXTEA/gzip và ELF ARM64. SHA-256 nguồn và từng bảng nằm trong `tables/canonical-policy.json`.
- Dùng 34 bảng; 27 bảng giống ENG, 7 bảng thay đổi: `arenaAchieveRewards`, `arenaRewards`, `entityExt`, `shop`, `signIn`, `task`, `vip`.
- Nhập 22 cờ và 13 đường dẫn cấu hình khởi động vào server/APK/IPA. Ví dụ: thức tỉnh tối đa 20, mốc mở tiến hóa kỹ năng 50, ô bảo vật/capsule 4–5 mở ở thức tỉnh 15/20. Công thức khác vẫn lấy đúng hàm đọc được, không suy ra chỉ từ tên/mốc tối đa.
- 289/319 module giống nhau sau chuẩn hóa AST theo phạm vi biến. Chuyển 20 module gameplay khác biệt qua bộ khung ENG/iOS, kiểm UUID và thuộc tính prefab; giữ thuộc tính thừa của prefab đích. Chi tiết tái lập ở `tools/merge_longzhidao.cjs`.
- 342 tên RPC và tập trường request literal khớp giữa client Trung và Global được kiểm tra. Độ phủ handler không đồng nghĩa đã thử mọi luồng native.
- Bảng tướng có nhóm **S, SS, SSS, SP**. Không đổi tên LR thành SP tùy ý; bảng role/evolution/soul của ba client thực tế giống nhau.

## Phần giữ từ ENG/iOS

Giữ tài nguyên, prefab và các module khung/ngôn ngữ/nền tảng để dùng lại native và bộ tiếng Việt có sẵn. Không lấy SDK/đăng nhập/thanh toán Trung sang backend riêng. Các module khác biệt được giữ gồm `buildExt`, `language`, `nameData`, `pako`, `resource`, `sdkApi`, `senstiveData`, `serverMain`, `settingPanel`, `soundApi`; các bản vá riêng vẫn áp dụng trên khung này.

Giữ ID vật phẩm 1 từ ENG, 373/379 từ IPA gốc vì tài khoản/khởi tạo cũ có thể tham chiếu chúng. Mỗi ID có nhãn nguồn riêng trong quản trị.

Tiếng Việt gốc ENG có **8.466 khóa**, được lưu nguyên tại `tables/localization/vi.eng.json`. Bản bổ sung có **498 mục**, trong đó **6 mục sửa khóa cũ**, tổng **8.958 khóa**. `vi.provenance.json` ghi nguồn từng khóa; `vi.authored.json` chỉ chứa phần dự án dịch/bổ sung. Kiểm tra placeholder và dịch tên/mô tả đủ 2.905 định nghĩa item/role. Ảnh chứa chữ ENG dựng sẵn vẫn giữ, chưa thay toàn bộ chữ trong ảnh.

## Phần tự viết và luật riêng

`tables/privateRules.json` và trang **Nguồn và bản dịch** liệt kê mã backend, gacha, event, giải đấu, Time Peak, xã hội/bang, chuyển tài khoản và luật dự phòng. Các phần này không được gán nguồn server gốc.

Ví dụ: shop nguồn có ID 140004/140005 với `minCount` lớn hơn `maxCount`; giữ bảng nguyên gốc và ghi rõ luật dự phòng cố định theo `minCount`. Tỉ lệ gacha, lịch event và luật server kín không có trong client dùng cấu hình riêng, có thể chỉnh qua quản trị.

Trước lần chuyển bộ luật trên database cũ, server tạo snapshot SQLite và kiểm integrity. Profile schema 29 giữ gem, coin, túi, VIP thủ công, tướng/cấp/sao/thức tỉnh; chỉ tính lại chỉ số chiến đấu theo dữ liệu đã chọn.

## Cập nhật

1. Dừng server; giải nén source nhánh `route-342` vào thư mục mới và chép `data` từ bản cũ sang. Giữ bản cũ làm backup. Cần Python và Node.js LTS, chạy `start.bat`.
2. Giải nén `Client-LongChiDao-VI-Patch.zip`, chép `DB2-Private-Android-fixed.apk` vào cùng thư mục; chạy `Apply-Dev.bat` rồi `Install-Dev.bat`. APK kết quả cùng chữ ký/package, có Speed 1–10× và bỏ hướng dẫn. Không gỡ app/xóa data.
3. IPA Long Chi Đảo VI giữ riêng, **chưa ký**. Không có IPA trong repo/ZIP public. Ký hợp lệ bằng Mac rồi cài; giữ native Mach-O gốc. Xem `IOS-PRIVATE.md`.
4. Kiểm tra `/health`: build `longzhidao-17327-vi`, schema 29, handler 342/342.

Bằng chứng bản dựng/kiểm thử: `analysis/longzhidao-validation.json`, `analysis/longzhidao-android-build.json`, `analysis/longzhidao-ios-build.json`, `analysis/longzhidao-canonical-validation.json`. Kiểm tra headless không thay thế việc cài và chơi trực tiếp trên Android/iPhone.
