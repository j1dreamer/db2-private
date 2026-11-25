# Dữ liệu chung Android/iOS

Theo lựa chọn của chủ dự án, **Android là chuẩn cho dữ liệu gameplay chung**. Không nhập các thay đổi cân bằng từ iOS vào tài khoản/server Android. Quyết định máy đọc được nằm ở [canonical-policy.json](../../tables/canonical-policy.json).

## Vì sao bản cài khác nhưng trước đây chơi có thể giống nhau?

Manifest trong hai gói gốc ghi Android `1.0.0.01`, iOS `1.0.0.23`, nhưng **cùng trỏ tới một URL manifest cập nhật**. `loginScene` thực sự có cơ chế `jsb.AssetsManager` tải cập nhật. Vì vậy người chơi Android có thể đã dùng dữ liệu sau cập nhật giống iOS; chưa đọc cache cập nhật trên thiết bị nên chưa xác nhận điều đó. Chênh lệch của hai gói tải về không chứng minh hai nền tảng phải dùng luật khác nhau.

8/34 bảng gốc khác nhau, bao gồm hệ số skill, buff, giá trị VIP, thưởng và nhóm nhân vật; không chỉ khác bản dịch. Các kết quả trước đồng bộ vẫn được giữ trong [báo cáo gốc](IOS-REPORT.md) và [hai trận lệch sát thương](changed-skill-combat-comparison.json).

## Phần iOS thực sự cần bổ sung

| Nội dung | Quyết định | Bằng chứng |
| --- | --- | --- |
| Rương `373`, `379` | Nhập hai định nghĩa vào `entityExtData` chung | `gmData` Android đã tham chiếu; icon và toàn bộ vật phẩm thưởng đều có sẵn trên Android |
| 20 định nghĩa rương còn lại | Lưu tham khảo, chưa kích hoạt | Chưa thấy tham chiếu cần thiết trong các trường dữ liệu Android đã kiểm tra |
| 9 buff chỉ có ở iOS | Lưu tham khảo, chưa kích hoạt | Không có phụ thuộc buff tương ứng trong bảng Android; các liên kết iOS nằm ở các hàng skill/buff khác với Android |
| Vật phẩm `60005` | Giữ nguyên Android | Android đã có định nghĩa ở bảng `entity`; iOS thêm bản ghi ghi đè ở `entityExt`, không phải vật phẩm mới |
| Native iOS, SDK bridge, `Info.plist`, framework và tài nguyên nền tảng | Giữ riêng bản iOS | Cần cho bản chạy iPhone; không thay bằng ELF/native Android |

[Kiểm tra phụ thuộc](selected-content-audit.json) ghi chính xác hàng `gmData`, icon và ID thưởng. [Nội dung để tham khảo](deferred-content.json) chứa các định nghĩa chưa nhập. Nhập định nghĩa không tự phát thưởng, không đổi dữ liệu người chơi, không bật gói mua hay event mới.

## Đồng bộ client và server

Server đọc 34 bảng chuẩn trong `tables/`. `tools/client_data.py` so sánh trực tiếp bảng trong archive đầu vào rồi sinh JavaScript chỉ ghi đè phần khác: Android cần `entityExt`; iOS cần tám bảng. Hai map thuộc tính Soul dùng bản Android, trong đó loại `9` là `dodgeRate`. Không tự mở thêm cấp nâng Soul loại `10`.

Hook chạy sau khi tải bảng/cache và trước `dataApi.init()`, sau đó áp dụng hai map Soul vào `serverConfig`. Mỗi lần áp dụng tạo bản sao mới vì `dataApi.init()` sửa mảng đầu vào. Không xóa tài khoản/local storage. Hai nền tảng có cùng SHA-256 dữ liệu chuẩn `c436403350a1fc1236eeb6b1d2320c54f4af965e3da93d97ff4fbcace1ccb079`.

[Kiểm tra với JavaScript iOS thực](canonical-compatibility-tests.json): 34/34 bảng sau áp dụng bằng chuẩn; cấu hình so sánh không còn khác; tám trường hợp combat khớp toàn bộ kết quả, gồm hai phản ví dụ trước đây. Với skill `105501`, sát thương iOS trở về `99711`, bằng Android, thay vì `107971`. Đây là kiểm thử headless với các đội/seed ghi trong báo cáo, chưa phải kiểm thử mọi trận hoặc native iPhone.

APK Android phát triển đã tích hợp overlay cùng các thay đổi trước đó: bỏ hướng dẫn, Speed 1–10, client/server 342 route. Tệp thay đổi so với APK fixed vẫn chỉ là `assets/assets/main/index.jsc` ngoài chữ ký; native không đổi. Xem [manifest APK](../development-apk.json). Cập nhật server từ nhánh `route-342`, giữ `data/`, dùng `Client-Route342-Dev-Patch.zip` với APK fixed làm đầu vào.

**iOS hiện mới có công cụ đồng bộ dữ liệu và JSC thử nghiệm dữ liệu. Chưa có IPA private đầy đủ đã ký hoặc chạy trên iPhone.** JSC dữ liệu chưa sửa endpoint/SDK login/transport; không dùng nó như bản chơi private hoàn chỉnh.

## Tái lập

Chuẩn bị Python, Node.js và dependency Acorn (`npm ci --prefix tools/js-parser`). Dùng đúng hai archive gốc của chủ dự án:

```sh
python -m tools.client_data ORIGINAL_ANDROID.zip android-data.js
python -m tools.client_data ORIGINAL_IOS.ipa ios-data.js
python -m tools.verify_canonical_data \
  --ios-archive ORIGINAL_IOS.ipa --android-archive ORIGINAL_ANDROID.zip \
  --work-dir artifacts/canonical-proof --output artifacts/canonical-proof.json
```

Công cụ đọc JSC, bảng và module trực tiếp từ IPA, tạo worker chứa module iOS, áp dụng cùng overlay dùng khi build client, rồi so với engine server Android. Thư mục thử nghiệm cũng chứa JSC chỉ đồng bộ dữ liệu để xem xét, không phải IPA cài đặt.
