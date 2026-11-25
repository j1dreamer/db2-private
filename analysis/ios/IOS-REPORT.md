# Kiểm tra IPA DB2 được cung cấp

Đã tải trực tiếp bằng `curl`, HTTP 200, 512.781.670 byte (~489 MiB). SHA-256: `de3072e9ee041d809c7e0a0f7979d35e0ef14dbb066171e56e27846faa456261`. URL ký tạm/cookie không được lưu trong repo. IPA gốc và native binary không được đẩy lên GitHub.

## Nội dung thực trong file

- ZIP có `Payload/dragonball.app/Info.plist` và executable `dragonball`.
- Bundle ID `com.ios.db.2.en`, `CFBundleShortVersionString=1.0.0`, `CFBundleVersion=1.0`. Trang Pgyer ghi build 25; `project.manifest` trong IPA ghi `1.0.0.23`. Các giá trị này được báo riêng, không suy ra từ tên file.
- Mach-O 64-bit ARM64, target `iphoneos`, khai báo MinimumOSVersion 10.0. Đây là executable thiết bị, không phải bản iOS Simulator. Máy phân tích Linux không chạy native iOS.
- `LC_ENCRYPTION_INFO_64.cryptid=0`. Kiểm tra 4.040 trang code bằng SHA-256 đều khớp CodeDirectory; hash Info.plist cũng khớp special slot 1. Điều này không xác nhận Apple còn tin chứng thư hoặc app sẽ cài/chạy được.
- Có load dependency `CombinedPlugin.dylib` và `Frameworks/AppRuntime/ATHelper.dylib`. Chỉ ghi nhận nội dung/load command; không suy đoán chức năng dựa trên tên.
- Có embedded provisioning profile dạng `ProvisionsAllDevices=true`, hạn ghi trong profile đến 2027-04-15. CMS profile kiểm được chữ ký mật mã với `openssl cms -verify -noverify`; chưa xác minh chuỗi tin cậy/thu hồi chứng thư Apple. `application-identifier` của entitlements/profile khác hậu tố bundle ID trong Info.plist; cần kiểm tra lại khi ký/cài bản riêng.
- `NSAppTransportSecurity.NSAllowsArbitraryLoads=true`: cấu hình plist cho phép HTTP, phù hợp hướng server riêng HTTP/Tailscale về mặt khai báo; kết nối mạng iPhone chưa được thử.

## JSC và cấu trúc JavaScript

Cả năm file JSC đều giải mã được theo XXTEA → gzip → UTF-8 JavaScript bằng khóa đã đọc từ native Android trước đây. Chuỗi khóa đó cũng hiện diện trực tiếp trong executable ARM64 iOS. Header gzip, độ dài giải mã, cú pháp Node.js và hash được kiểm tra; không gọi đây là bytecode chỉ vì phần mở rộng `.jsc`.

Main JSC giải mã thành 7.656.528 byte JavaScript, SHA-256 `3edb048a08a29e1107d32007fa523a38fe0973f560906f55caa54c87c2d3516f`. Có 319 module ngoài, cùng tập tên với Android. Module `data` đồng nhất AST với nguồn Android nhưng chỉ là khung mảng rỗng; không dùng phép so đó để kết luận bảng game giống nhau. Các bảng thực được đọc riêng từ asset `.bin`, xem phía dưới. Hai bundle resources/internal vẫn chỉ có loader rỗng 563 byte. Cocos engine giải mã có SHA-256 `63a6617cc067781e72a5da77e5097c8664e8361136914c02f20d7bd2b2d8e78f`, trùng bản Android đã kiểm tra.

Nhiều khác biệt source do đổi tên biến khi minify. So AST nguyên trạng có 66 module đồng nhất; thêm 163 module khớp khi thử hoán vị tên biến cục bộ `s↔o`, `h↔u`, `k↔f` và giữ nguyên key của object/member. 90 module còn lại không được tuyên bố tương đương chỉ từ phép so này. Xem `module-comparison.json`.

## Giao thức và kiểm tra chạy JavaScript thực

Acorn trích được đúng 342 route, trùng toàn bộ tập route Android. Danh sách trường request của từng route đều trùng. Đây là so hợp đồng request, không phải bằng chứng 342 luồng đã chạy trên iPhone.

Đã chạy mã lấy trực tiếp từ IPA trong Node, chỉ thay renderer bằng adapter kiểm thử:

- Player/Bag/Team, sảnh, top bar, điểm quay và các generator nhận được profile schema 28 từ backend; vé thường/cao cấp khởi tạo đúng.
- Codec iOS tạo request Pomelo cùng byte với codec Android.
- Sáu trận mẫu robot với seed 1/777 ở PvP, practice và island: worker dùng module combat lấy từ iOS và các bảng iOS thật. Kết quả/HP/MP/tick/damage khớp engine Android trong đúng sáu trường hợp đó. Bộ module chuẩn bị có 50 file, không khẳng định mọi file đều được load ở mỗi trận.
- Dùng codec iOS thật qua WebSocket localhost đến server aiohttp/Pomelo: xác thực, tạo nhân vật, đổi tên lần đầu, quay thường, quay cao cấp và đọc lại nhân vật đều trả 200. Profile sau quay tiếp tục dựng được bằng model iOS, vé đã tiêu không xuất hiện lại.

Chi tiết: `compatibility-tests.json` và `wire-tests.json`. Sáu trận robot không đại diện cho các kỹ năng khác đã thay đổi dữ liệu; các counterexample phía dưới cho thấy giới hạn đó. Không có claim đã thử cảm ứng, animation, native SDK, asset loading, cài đặt hay gameplay trên iPhone.

## So sánh bảng dữ liệu thực và counterexample combat

Đọc `assets/resources/config.json`, giải UUID đến 34 file native data `.bin`, kiểm gzip rồi parse JSON và metadata đuôi 64 ký tự. Có 26 bảng giống Android; 8 bảng khác: `vip`, `artifact`, `entity`, `task`, `entityExt`, `buff`, `fightSkill`, `role`. Tất cả header của tám bảng vẫn có cùng tập cột; khác biệt nằm ở record/giá trị.

- `role`: cả 1.760 record có ít nhất một khác biệt, gồm tăng trưởng chỉ số, một số chỉ số đầu và group.
- `fightSkill`: 82 record thay đổi, có `atkPer`, `initVal`, `valGrowth`, `buffIds`, cùng nội dung hiển thị.
- `buff`: 29 record chung thay đổi và thêm 9 ID bên iOS; không chỉ khác tên/ảnh.
- `vip`: 13 ngưỡng gem nạp khác; `task`: 4 mô tả thưởng khác; `artifact`: 2 record; `entity`: 2 record; `entityExt`: các extension/ID cũng khác.

Chạy lại với các bảng iOS thật: model sảnh/quay và sáu trận robot vẫn qua. Thêm hai ca với skill 105501, cùng raw đội/seed nhưng dùng hai bộ dữ liệu: kết quả combat không đồng nhất. Ví dụ seed 777: sát thương của tướng 105501 phía tấn công là 99.711 ở Android và 107.971 ở iOS; hai bên vẫn cùng thắng nên chỉ so cờ `isWin` sẽ bỏ sót sai khác. Xem `table-comparison.json`, `table-differences.json` và `changed-skill-combat-comparison.json`.

Vì vậy, codec và request tương thích không đồng nghĩa combat/cân bằng tương thích. Cần chọn bộ dữ liệu canonical và đồng bộ cả client/backend, hoặc thiết kế realm/adapter phiên bản cùng migration. Chưa tự đổi bảng Android, iOS hay dữ liệu người chơi. Cũng chưa gọi bản server Android hiện tại là backend iOS hoàn chỉnh.

## Khác biệt cần xử lý trước bản iOS riêng

Khi chạy hàm constants thật của hai bản, có sáu đường cấu hình khác nhau, đều thuộc hai bảng `ROLE.CONSTS.SOUL_TYPE_*_ATTR_ITEM_MAP`:

- Android: mục 9 là `dodgeRate`; bảng thuộc tính còn có mục 10 `addCritDmgRate`.
- iOS: mục 9 là `addCritDmgRate`; không có mục 10 trong hai bảng này.
- Backend schema 28 hiện khởi tạo/cho nâng mục 1–9 theo cấu hình Android. Vì vậy nâng mục 9 rồi coi là cùng ngữ nghĩa giữa hai client sẽ sai. Mục 10 trong bảng thuộc tính Android cũng chưa tự động đồng nghĩa có đủ luật nâng: hàm chi phí gốc chỉ định nghĩa ID nguyên liệu 1–9.

Cần adapter phiên bản hoặc luật canonical có migration rõ ràng trước khi hỗ trợ chung chiến hồn. Không ghi đè bảng iOS hay đổi ý nghĩa dữ liệu người chơi một cách âm thầm. Chi tiết số liệu nằm trong `soul-configuration-difference.json`.

Client iOS hiện vẫn là bản gốc, endpoint/hot update/login SDK chưa được đổi sang backend riêng. Chưa tạo hoặc ký IPA private; chưa có kiểm tra native trên iPhone. Kết quả hiện tại xác nhận giao thức và các ca khởi đầu đã thử, đồng thời xác nhận có sai khác combat/cấu hình cần xử lý. Không xác nhận có thể cài ngay APK patch hay bundle JavaScript Android vào IPA.

## Tái lập kiểm tra file

```sh
python -m tools.inspect_ipa /path/dragonball_1.0.0.ipa --out /tmp/ios-report
python -m tools.decode_jsc /path/dragonball_1.0.0.ipa --out /tmp/ios-decoded
python -m tools.extract_tables /path/dragonball_1.0.0.ipa /tmp/ios-tables
python -m unittest tests.test_ipa_inspection -q
```

Công cụ chỉ đọc/phân tích file, không chạy Mach-O, không giải mã FairPlay và không ký app. Các kiểm thử parser sử dụng fixture nhỏ được ghi rõ; báo cáo IPA thực ở thư mục này là kết quả của file tải được phía trên.
