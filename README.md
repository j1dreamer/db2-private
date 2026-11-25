# DB2 Private — bản phát triển

> **Sửa lỗi cài đặt Android 11+**: APK `v0.1.0-dev` cũ đã nén `resources.arsc`, có thể bị hệ thống từ chối dù chữ ký hợp lệ. Dùng [APK-Install-Fix.zip](APK-Install-Fix.zip), giải nén cạnh APK cũ, nhấp đúp `Apply-Fix.bat` trên Windows rồi cài **DB2-Private-Android-fixed.apk**. Bản vá khoảng 1,5 MB; không cần tải lại toàn bộ APK.

Backend Python + SQLite, web quản trị và công cụ đóng gói client Android từ bộ file người dùng cung cấp. iOS chưa nằm trong bản này.

## Trạng thái thực tế

- Đã có: đăng ký/đăng nhập tài khoản riêng, session 24 giờ, Pomelo handshake/heartbeat, gate/connector, tạo/chọn nhân vật theo schema dự thảo, đổi giftcode, web quản trị có token, tạo giftcode, cấp gem, pool gacha tùy chỉnh và lưu lịch event.
- Đã kiểm thử giao thức và SQLite qua mạng loopback.
- Chưa có: xác minh profile đủ trường để vào sảnh trên thiết bị, toàn bộ 342 route gameplay, tích hợp các event tùy ý vào UI event gốc.
- Người dùng đã cài APK trên BlueStacks và tới cảnh sảnh; phát hiện lỗi khởi tạo dữ liệu sảnh. Schema 3 sửa lỗi này ở server, cần xác nhận lại trên thiết bị. Mã SDK Java vẫn còn trong gói.
- Các thao tác chưa triển khai trả lỗi rõ ràng; không giả lập thành công.

## Chạy

Cần Python 3.10 trở lên có pip và venv. Lần đầu cần mạng để cài aiohttp. Sau đó dữ liệu lưu tại `data/game.sqlite3`.

Linux/macOS/Termux:

```sh
python3 start.py
```

Windows: nhấp `start.bat` hoặc chạy `python start.py`.

Termux: cài Python bằng `pkg install python` trước. Nếu venv hoặc aiohttp cần công cụ biên dịch, cài gói phát triển tương ứng của Termux.

Mở `http://127.0.0.1:20003`. Token quản trị nằm trong `data/admin-token`, chỉ cần nhập vào web; không đặt token vào URL và không gửi token cho người khác.

Mặc định server chỉ nghe localhost. Để kết nối từ điện thoại khác qua Tailscale:

```sh
python3 start.py --bind DIA_CHI_TAILSCALE --public-host DIA_CHI_TAILSCALE
```

Địa chỉ này phải là IP/hostname của máy chạy server, có thể truy cập được từ client. Tailscale được cài và cấu hình riêng trên các thiết bị. Không cần mở cổng router. Nếu dùng HTTP qua mạng riêng, chỉ cho phép các thiết bị tin cậy trong tailnet; chưa có TLS tích hợp.

## Đóng gói APK

Công cụ dùng thư viện chuẩn Python; cần Java để ký APK. Không phải build lại project Cocos từ source gốc.

```sh
python3 tools/build_client.py --source /path/File_000 --bundle client/main.decoded.js --server http://DIA_CHI_TAILSCALE:20003 --output artifacts/db2-private-unsigned.apk
java -jar vendor/uber-apk-signer.jar -a artifacts/db2-private-unsigned.apk -o artifacts/signed
```

Công cụ ký bên thứ ba: https://github.com/patrickfav/uber-apk-signer — bản 1.3.0. SHA-256 được đối chiếu với checksum của release trước khi dùng. Bản ký mặc định dùng debug certificate công khai, chỉ dành cho phát triển. Trước phát hành phải ký bằng khóa riêng của chủ server và giữ khóa đó cho các lần cập nhật.

Bản mặc định dùng `http://127.0.0.1:20003`: server phải chạy trên cùng thiết bị. Ở màn đăng nhập, nút **Server riêng** cho phép lưu `http://IP-TAILSCALE:20003` và khởi động lại; phần này chưa được thử trên thiết bị. Tham số build `--server` đặt địa chỉ mặc định.

Package mặc định đổi thành `com.dp2.web.dev` để hướng tới cài song song; các chuỗi AXML được thay bằng chuỗi cùng độ dài, class Java và resource ID giữ nguyên. Chưa xác minh cài song song trên thiết bị. Có thể dùng `--keep-package` để giữ package gốc khi thử trên profile riêng. Không gỡ bản game đang có hoặc xóa dữ liệu để thử bản này.

## Kiểm tra

```sh
python3 -m unittest discover -s tests -v
```

Sao lưu khi server đã dừng, hoặc dùng SQLite backup API; không sao chép riêng file DB khi WAL đang hoạt động.

## Quy tắc economy đang dùng

- Quay thường dùng vé 119 nếu đủ cho cả lượt quay; nếu thiếu, dùng 300 gem/lần hoặc 2.700 gem/10 lần. Quay 100 lần dùng 27.000 gem. Vé lẻ không bị trừ khi chọn thanh toán bằng gem.
- Cao cấp dùng vé 120. Pool là 202/203/204; đổi pool tốn 300 gem theo hằng số client.
- Nếu chưa có pool tùy chỉnh, đọc drop table được trích từ client. Lần quay đầu dùng class 101 hoặc 201. Chưa triển khai bảo hiểm và điều chỉnh xác suất theo wishlist; không khẳng định thuật toán giống server gốc.
- Tướng trùng chuyển thành 10 hồn cùng class: đây là chính sách server riêng hiện tại.
- Trên web quản trị, thêm mục thưởng vào pool sẽ kích hoạt danh sách tùy chỉnh cho pool đó. Trọng số được chuẩn hóa tương đối, không phải phần trăm độc lập.
- Event quản trị hiện có một phần thưởng gem tại chỉ số 0, nhận bằng route `logic.playerHandler.receiveActivityAward`. Mỗi nhân vật nhận một lần, thời gian server tính bằng giây Unix. Chưa nối các tên event tùy ý vào màn event gốc của game.
- Trừ tài nguyên/cấp thưởng/ghi lịch sử trong cùng transaction. Response được ghi nhớ cho request ID trùng trên cùng WebSocket, tối đa 256 request gần nhất; chưa có idempotency xuyên kết nối cho gacha.
- Báo lỗi client sau đăng nhập được ghi vào nhật ký quản trị qua `/user/reportClientError`, có kiểm tra token. Không ghi mật khẩu/token vào nhật ký.

## Môi trường đã kiểm tra

Linux x86_64, Python 3.12, Node 24 (chỉ dùng cho test codec gốc), Java 21. Chưa chạy trên Termux, Windows, macOS hoặc Android thật. Backend được viết đa nền tảng; đây chưa phải xác nhận mọi nền tảng đã được thử.

30 kiểm thử backend/codec/đóng gói và dữ liệu client đã pass. Web quản trị đã thử bằng Chrome: đăng nhập, tạo giftcode, lưu mục pool và xem audit.

## Đối chiếu với JavaScript gốc

Bộ kiểm thử chạy các constructor Player/Bag/Team và các hàm sinh dữ liệu pointScene, roleItem, teamScene, eqptScene, itemItem, dailyTaskPanel và homeScene cùng các panel mà homeScene gọi từ client gốc. Lớp dataApi khởi tạo bằng cả 34 bảng dữ liệu đã trích. Các phụ thuộc giao diện/mạng được stub; các kiểm thử này không dựng màn hình và không xác nhận game vào sảnh trên Android.

Đã kiểm tra vé biến mất sau khi dùng, số gem/hồn tướng sau hai lượt quay khớp DB, sáu trang bị ban đầu và dữ liệu tình bạn được hàm client chấp nhận. Profile schema 3 bổ sung các trường còn thiếu cho bản phát triển trước, giữ số dư và roster hiện có. Một số trường/giá trị vẫn là dữ liệu khởi tạo dự thảo; cửa hàng và nhiệm vụ chưa triển khai. Hai mục cửa hàng ban đầu được đánh dấu hết hàng để hàm tạo badge trên sảnh không đọc danh sách trống.

Phân tích AST xác định **319 module ở bảng ngoài**. Các thống kê regex trước có lẫn module lồng trong thư viện. Công cụ `tools/split_bundle.py` gọi Node/Acorn chỉ phục vụ phát triển; backend không cần Node.

## Kiểm tra môi trường và sao lưu

Sau khi launcher cài phụ thuộc, có thể chạy:

```sh
.venv/bin/python tools/doctor.py
.venv/bin/python tools/backup.py
```

Windows dùng `.venv\Scripts\python.exe` thay `.venv/bin/python`. Công cụ doctor kiểm tra Python, aiohttp, scrypt, SQLite/quyền ghi và cổng 20003; không đọc token hoặc sửa dữ liệu game.

Công cụ backup dùng SQLite backup API, gồm dữ liệu đã commit trong WAL khi server đang chạy. Bản sao lưu ở `backups/`, không ghi đè file đã có và kiểm tra tính toàn vẹn sau khi sao lưu. File sao lưu có dữ liệu tài khoản/người chơi; lưu cùng quyền riêng tư như database gốc. Không tích hợp khôi phục tự động vào bản phát triển này.

## Bản GitHub

Repository chứa server, bảng dữ liệu, JavaScript client đã khôi phục, các kiểm thử và công cụ đóng gói. Không chứa database người chơi, token quản trị, khóa ký riêng hoặc APK. Source client và asset trích xuất do người dùng cung cấp; không có tuyên bố cấp lại giấy phép cho các thành phần đó.

Để dùng riêng công cụ tách module bằng AST, cần Node và chạy `npm --prefix tools/js-parser ci` trước. Backend không cần Node hoặc Java; Java chỉ cần khi ký APK.

## Tải APK đã ký trên PC

Windows có Python 3: nhấp đúp **Download-APK.bat** trong thư mục repo. Hoặc chạy:

```sh
python tools/download_apk.py
```

Công cụ tải 25 phần từ nhánh `apk-download`, kiểm tra SHA-256 từng phần, ghép thành **DB2-Private-Android-dev.apk** và kiểm tra checksum toàn file. Không build/ký lại APK. Nếu mất mạng, chạy lại để tiếp tục các phần còn thiếu. Cần khoảng 1 GB trống cho phần tải và APK hoàn chỉnh.

Nếu không dùng Python, tải ZIP của nhánh `apk-download`, giải nén và nhấp **join-apk.bat** trên Windows để ghép bằng lệnh có sẵn của hệ điều hành.

## Kiểm tra khả năng cài APK

Sau khi zipalign và ký, phải chạy `python tools/verify_apk.py FILE.apk` bên cạnh kiểm tra chữ ký. Android 11+ với target SDK 30+ yêu cầu `resources.arsc` không nén và căn lề 4 byte; kiểm tra chữ ký riêng lẻ không phát hiện lỗi này. Đây là lỗi đóng gói đã được sửa trong builder và kiểm tra CI.

- APK cũ SHA-256: `a198837ccae5a3ad662d2489c4e1748016aebe77359e84f4bc4734c5f389f430`.
- APK sửa SHA-256: `d3dd3db256d550667eba386217e969327c82cc37985e2b503adea3673f883c3f`.
- Bản vá chỉ sao chép các vùng byte không đổi và thay những vùng đã sửa/ký; kiểm tra checksum nguồn và đầu ra, giữ nguyên APK cũ.
- `tools/download_apk.py` hiện tự áp dụng bản vá sau khi tải/ghép APK nền.
- 30 kiểm thử backend/codec/đóng gói/bản vá và dữ liệu sảnh đã pass; bản sửa schema 3 vẫn cần xác nhận sảnh hiển thị đúng trên Android/BlueStacks.

Bản vá Windows dùng PowerShell có sẵn; không đổi execution policy. Đã chạy thử thuật toán PowerShell trên cùng APK gốc và xác nhận đầu ra khớp SHA-256 bản sửa đã ký. File `Apply-Fix-Python.bat` là lựa chọn thay thế khi có Python.

## Sửa lỗi sảnh đầy icon mặc định (schema 3)

Log trên BlueStacks báo `Cannot read property 'daily' of undefined` trong `dailyTaskPanel.genData`. Server thiếu `task.receivedPointMap`, làm luồng khởi tạo sảnh dừng trước khi ẩn event và cập nhật thông tin người chơi. Hàm tạo dữ liệu `homeScene.genData` còn đọc `activity.scorePointInfoMap` cho event cung hoàng đạo. Schema 3 bổ sung hai cấu trúc này, dữ liệu nhiệm vụ ngày/tuần và bộ đếm điểm danh. Nhân vật schema 2 trở xuống được bổ sung trường khi tải từ SQLite, giữ nguyên tiền, tướng và tiến trình đã có.

Dừng server rồi cập nhật source (hoặc chỉ thay `server/profile.py` từ main), chạy lại `start.bat`/`python start.py`, thoát hẳn game và mở lại. Không cần thay APK hay xóa database. Bộ kiểm thử chạy chính hàm gốc `homeScene.genData`, kiểm tra tên/VIP, các cờ ẩn event và việc nâng cấp nhân vật cũ; không dựng giao diện Cocos.
