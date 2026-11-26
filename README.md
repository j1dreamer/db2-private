> **Web quản trị mới:** 8 khu vực, 2.845 item/role có ảnh thật, 17 event hệ thống và lịch sự kiện tùy chỉnh; cùng SQLite/RPC với game. Xem [cách chạy và phạm vi chỉnh sửa](ADMIN.md).

> iOS: đã có **IPA private thử nghiệm chưa ký, giữ riêng theo yêu cầu**; không có payload trên repo public. Xem [ký/cài trên Mac, giao tệp riêng và kết nối Cloud](IOS-PRIVATE.md). Chưa xác minh native trên iPhone hoặc đường iPhone → Cloud. Dữ liệu chung lấy **Android làm chuẩn**.

> Nhánh phát triển `route-342`: **342/342 route**, 251 kiểm thử qua ([chi tiết web/server](analysis/admin-validation.json)); không còn route trống. Chưa xác minh bản mới trên thiết bị. Xem [IMPLEMENTATION-342.md](IMPLEMENTATION-342.md) cho phạm vi và luật riêng.
>
> **APK sửa lỗi kẹt màn nền khi bật Speed (26/11/2026):** tải [Client-Route342-Speed-BootFix.zip](Client-Route342-Speed-BootFix.zip), khoảng 5 MB. Giải nén vào thư mục mới, chép **DB2-Private-Android-fixed.apk** cũ vào đó, chạy `Apply-Dev.bat` rồi `Install-Dev.bat`. Tạo **DB2-Private-route342-speed-bootfix.apk**, cùng package/chữ ký để cài đè. Có Speed 1×–10× cho cả giao diện, bỏ hướng dẫn và các bản vá route-342. Không cần đổi server/data. Đã sửa lỗi `setTimeScale of null` bằng cách chờ scheduler khởi tạo; 31 kiểm thử client/đóng gói qua, xác minh ghép APK bằng Python và PowerShell. Chưa kiểm thử lại trên BlueStacks thực. Gói `Client-Route342-Dev-Patch.zip` cũng đã thay bằng cùng bản sửa; các gói Speed cũ bên dưới chỉ để tham khảo lịch sử.
>
> Server phải dùng [source nhánh route-342](https://github.com/j1dreamer/db2-private/archive/refs/heads/route-342.zip), có Python và **Node.js LTS** (`pkg install nodejs` trên Termux). Dừng server cũ, giải nén source vào thư mục mới, chép thư mục `data` từ bản cũ sang rồi chạy `start.bat`; giữ lại thư mục cũ làm bản sao lưu. `Check-Home.py` → `running_health` sẽ hiển thị build, schema và số route để phát hiện đang chạy nhầm server cũ.

# DB2 Private — bản phát triển

> **Sửa lỗi cài đặt Android 11+**: APK `v0.1.0-dev` cũ đã nén `resources.arsc`, có thể bị hệ thống từ chối dù chữ ký hợp lệ. Dùng [APK-Install-Fix.zip](APK-Install-Fix.zip), giải nén cạnh APK cũ, nhấp đúp `Apply-Fix.bat` trên Windows rồi cài **DB2-Private-Android-fixed.apk**. Bản vá khoảng 1,5 MB; không cần tải lại toàn bộ APK.

Backend Python + SQLite, web quản trị và công cụ đóng gói client Android từ bộ file người dùng cung cấp. iOS chưa nằm trong bản này.

## Trạng thái thực tế

- Nhánh hiện tại có 217 route nghiệp vụ/182 kiểm thử và profile schema 20; danh sách chi tiết ở `analysis/route-coverage.json`. Backend có đăng nhập/session/Pomelo, SQLite, web quản trị, giftcode/gacha, ải, túi/đội hình, nhiệm vụ, bạn bè/chat/thư, arena, bang, boss và đặc huấn.
- Đã kiểm thử giao thức và SQLite qua mạng loopback.
- Còn 125 route chưa triển khai; chưa xác minh các luồng mới trên BlueStacks, chưa tích hợp mọi event vào UI gốc.
- Người dùng đã vào sảnh/quay trên bản fixed cũ. APK phát triển mới bỏ hướng dẫn, có Speed 1×–10× và vá giao thức; mã SDK native vẫn trong gói nhưng JS không gửi telemetry/thanh toán native. Kết quả chơi trên APK mới vẫn cần kiểm tra thực tế.
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
- Nếu chưa có pool tùy chỉnh, đọc drop table được trích từ client. Lần quay đầu dùng class 101 hoặc 201. Pool mặc định bảo đảm nhánh 3 sao mỗi lượt thứ 20 theo hằng số client, theo luật riêng dùng counter tích lũy. Pool admin giữ cấu hình riêng; chưa điều chỉnh xác suất theo wishlist. Không khẳng định thuật toán giống server gốc.
- Tướng trùng chuyển thành 10 hồn cùng class: đây là chính sách server riêng hiện tại.
- Trên web quản trị, thêm mục thưởng vào pool sẽ kích hoạt danh sách tùy chỉnh cho pool đó. Trọng số được chuẩn hóa tương đối, không phải phần trăm độc lập.
- Event quản trị hiện có một phần thưởng gem tại chỉ số 0, nhận bằng route `logic.playerHandler.receiveActivityAward`. Mỗi nhân vật nhận một lần, thời gian server tính bằng giây Unix. Chưa nối các tên event tùy ý vào màn event gốc của game.
- Trừ tài nguyên/cấp thưởng/ghi lịch sử trong cùng transaction. Response được ghi nhớ cho request ID trùng trên cùng WebSocket, tối đa 256 request gần nhất; chưa có idempotency xuyên kết nối cho gacha.
- Báo lỗi client sau đăng nhập được ghi vào nhật ký quản trị qua `/user/reportClientError`, có kiểm tra token. Không ghi mật khẩu/token vào nhật ký.

## Môi trường đã kiểm tra

Linux x86_64, Python 3.12, Node 24 (chỉ dùng cho test codec gốc), Java 21. Chưa chạy trên Termux, Windows, macOS hoặc Android thật. Backend được viết đa nền tảng; đây chưa phải xác nhận mọi nền tảng đã được thử.

47 kiểm thử backend/codec/đóng gói và dữ liệu client đã pass. Web quản trị đã thử bằng Chrome: đăng nhập, tạo giftcode, lưu mục pool và xem audit.

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
- 47 kiểm thử backend/codec/đóng gói/bản vá và dữ liệu sảnh đã pass; bản sửa schema 3 vẫn cần xác nhận sảnh hiển thị đúng trên Android/BlueStacks.

Bản vá Windows dùng PowerShell có sẵn; không đổi execution policy. Đã chạy thử thuật toán PowerShell trên cùng APK gốc và xác nhận đầu ra khớp SHA-256 bản sửa đã ký. File `Apply-Fix-Python.bat` là lựa chọn thay thế khi có Python.

## Sửa lỗi sảnh đầy icon mặc định (schema 3)

Log trên BlueStacks báo `Cannot read property 'daily' of undefined` trong `dailyTaskPanel.genData`. Server thiếu `task.receivedPointMap`, làm luồng khởi tạo sảnh dừng trước khi ẩn event và cập nhật thông tin người chơi. Hàm tạo dữ liệu `homeScene.genData` còn đọc `activity.scorePointInfoMap` cho event cung hoàng đạo. Schema 3 bổ sung hai cấu trúc này, dữ liệu nhiệm vụ ngày/tuần và bộ đếm điểm danh. Nhân vật schema 2 trở xuống được bổ sung trường khi tải từ SQLite, giữ nguyên tiền, tướng và tiến trình đã có.

Dừng server rồi cập nhật source (hoặc chỉ thay `server/profile.py` từ main), chạy lại `start.bat`/`python start.py`, thoát hẳn game và mở lại. Không cần thay APK hay xóa database. Bộ kiểm thử chạy chính hàm gốc `homeScene.genData`, kiểm tra tên/VIP, các cờ ẩn event và việc nâng cấp nhân vật cũ; không dựng giao diện Cocos.

## Chẩn đoán khi vẫn đơ sau cập nhật

Trong thư mục chứa `start.bat`, chạy `python Check-Home.py` khi server đang mở. Công cụ chỉ đọc mã nguồn, các trường schema cần thiết trong SQLite, năm dòng audit liên quan gần nhất và `/health`; không xuất mật khẩu, token hoặc toàn bộ hồ sơ nhân vật. Nếu chạy server với `--data`, truyền cùng thư mục đó cho công cụ. Kết quả cho biết bản code schema nào, dữ liệu nhân vật còn thiếu trường nào và đường dẫn đang kiểm tra. Công cụ không nâng cấp hoặc ghi database.

Bộ kiểm thử còn chạy `quickNode.genData` với các hàm gốc achievement/ship/skill và cache team tạo bằng hàm gốc. Đây là luồng gây lỗi `daily` trong log thiết bị; với schema 3, cả homeScene và quickNode tạo dữ liệu thành công. Vẫn cần dữ liệu chẩn đoán từ máy chạy game để xác định lỗi sau cập nhật.

## Sửa thanh thể lực (schema 4)

Thiết bị đã xác nhận code và nhân vật schema 3, sau đó báo `Cannot read property 'actionPoint' of undefined` trong `coinTopNode.update_`. Schema 4 thêm `timesMaxMap` và `nextRecoverTimeMap` cho thể lực/điểm kỹ năng, cùng bộ đếm mua thể lực. Giới hạn thể lực theo hàm gốc `PLAYER.FUNS.getActionPointMax(level) = 60 + level`; trường có sẵn được giữ nguyên khi nâng cấp nhân vật cũ. Mốc hồi phục mặc định bằng 0 (chưa lên lịch); logic tự hồi thể lực phía server vẫn chưa triển khai.

Dừng server, tải và giải nén [Home-Fix.zip](Home-Fix.zip) vào thư mục chứa `start.bat`, ghi đè các file code, chạy server lại rồi mở lại game. Gói tích lũy hiện chứa các file code `server/profile.py`, `server/storage.py`, `server/app.py`, `server/gameplay.py` và `Check-Home.py`, không chứa database. Nhật ký migration ghi schema thực tế. 47 kiểm thử đã pass, bao gồm tái hiện lỗi schema 3, chạy chính lifecycle `coinTopNode.onLoad/update_/tick_` và thao tác mở/đóng bảng hồi thể lực với schema 4, cả nhánh có mốc hồi phục. Chưa xác nhận bản sửa mới trên BlueStacks.

## Đặt tên đội trong hướng dẫn

Đã xử lý `logic.playerHandler.rename` với body `{name: ...}` như client gốc. Dựa trên `firstReName.test`/`renamePanel`, lần đặt tên đầu khi tên hiện tại trùng `userName` được miễn phí; các lần sau tốn 100 gem theo `PLAYER.CONSTS.RE_NAME_COST_GEM`. Bộ đếm riêng lưu trong profile ngăn lặp miễn phí. Gửi lại cùng tên đang dùng trả thành công và không trừ thêm. Phản hồi trả `name`, `gem`, `costGem` để Player gốc cập nhật trước callback đóng panel.

Quy định server riêng: tên tối đa 10 đơn vị UTF-16 như ô nhập client, không rỗng/control/markup; tên đội không trùng tên tài khoản (tránh kích hoạt lại hướng dẫn) và không trùng tên đội khác khi so sánh casefold. Kiểm tra/trừ gem/lưu tên nằm trong cùng transaction. Đã kiểm tra WebSocket có xác thực, lưu DB, giữ số dư khi thất bại và hàm Player/homeScene gốc nhận tên mới. Chưa xác nhận phần hướng dẫn sau đổi tên trên thiết bị; các route gameplay khác vẫn đang triển khai.

## Client bỏ hướng dẫn

[APK-No-Guide.zip](APK-No-Guide.zip) (~5 MB) tạo APK `DB2-Private-no-guide.apk` từ đúng `DB2-Private-Android-fixed.apk` đã phát hành. Giải nén vào thư mục riêng, chép APK fixed vào đó và chạy `Apply-No-Guide.bat` (PowerShell tích hợp) hoặc `Apply-No-Guide-Python.bat`. Các helper kiểm SHA-256 đầu vào/đầu ra và giữ nguyên APK nguồn. Cài cập nhật bằng ADB `install -r` để giữ dữ liệu ứng dụng; server/SQLite không đổi. Backend vẫn cần các bản sửa schema/rename hiện tại.

Builder đặt `buildExt.isSkipGuide = true`, khiến hàm gốc `guide.run` bỏ qua chuỗi hướng dẫn. Đã chạy hàm gốc để kiểm tra không khởi động bước hướng dẫn; đã kiểm tra cú pháp toàn bundle, chữ ký v1/v2/v3, resources.arsc lưu không nén/căn lề, package và chứng chỉ giữ nguyên. Bản vá đã tái tạo đúng APK bằng cả Python và PowerShell. Chưa kiểm thử cài cập nhật bản này trên BlueStacks.

- APK nguồn: `d3dd3db256d550667eba386217e969327c82cc37985e2b503adea3673f883c3f`.
- APK bỏ hướng dẫn: `93a51856da76adaa1e4229cfd2f12f0756af6bdfb92453eb3e517d8802e22209`.
- Bản client bỏ hướng dẫn không cấp thêm tài nguyên hoặc triển khai các route gameplay còn thiếu. Quay thường vẫn cần 300 gem/lần hoặc vé.
- `tools/make_apk_patch.py` tạo kế hoạch copy/literal từ payload ZIP nén giữ nguyên; `tools/apply_no_guide.py` áp dụng bản vá có checksum cố định. Thông tin build nằm tại `client/no-guide-build.json`.

## Vé quay khởi đầu (schema 5)

Mỗi nhân vật mới nhận một vé thường (119) và một vé cao cấp (120), giữ gem khởi đầu 50. Nhân vật schema 4 trở xuống được cộng thêm đúng một vé mỗi loại khi tải hồ sơ lần tiếp theo; vé được gộp vào stack hiện có, slot mới tránh trùng chỉ số kể cả khi `lastIdx` cũ thấp hơn chỉ số vật phẩm. Cờ `privateStarterTicketsGranted` lưu cùng profile; tạo/nâng cấp nhân vật và cấp vé nằm trong transaction, có audit `starter_tickets`. Vé đã dùng không được cấp lại khi đăng nhập.

Cập nhật gói `Home-Fix.zip`, mở lại server rồi đăng nhập lại game để lấy dữ liệu túi mới. `Check-Home.py` hiển thị cờ đã cấp và số vé 119/120. Đã kiểm tra các hàm Player/Bag/pointScene gốc thấy cả hai loại vé và nhận delta tiêu vé; quay mỗi loại một lần không trừ gem. Bộ kiểm thử cũng kiểm tra cộng vào nhân vật cũ, giữ vật phẩm khác và không cấp lặp sau mở lại SQLite.

Khi APK fixed cũ còn chạy hướng dẫn, callback quay thành công mới gọi `guideNext1`. Phản hồi thiếu tài nguyên (`code:500`) gỡ loading trong `serverMain.sync` nhưng bỏ qua callback thành công trong `socket._request`, nên bước hướng dẫn chưa hoàn thành và lớp chặn thao tác có thể vẫn còn. Cài APK no-guide đã phát hành để tắt hướng dẫn; cấp vé khởi đầu không thay thế bản vá client. Chưa xác nhận thao tác mới trên thiết bị.

## Bản sửa sau quay cao cấp + tốc độ 1–10×

Log thiết bị schema 5 báo lỗi `Cannot read property '1' of undefined` trong hàm `test` của hướng dẫn. Mã gốc chuyển từ tuyển tướng sang `firstBattle.test` và đọc `smapStarMap[1]`, tiếp theo `smapBattleTo.test` đọc `[1][101]`. Schema 6 thêm cấu trúc tiến độ ải đầu rỗng, map lượt chơi/rương trống, cùng các trường tướng còn thiếu dùng khi dựng màn hình kỹ năng. Giữ nguyên gem, vé đã tiêu, tướng và tiến độ cũ; không cấp lại quà khởi đầu hay đánh dấu thắng ải.

Cập nhật `Home-Fix.zip` như các bản trước, khởi động lại server và game. `Check-Home.py` mới kiểm tra cả tiến độ ải và xuất stack lỗi (tối đa 2400 ký tự) thay vì chỉ dòng đầu.

[APK-Speed-Fix.zip](APK-Speed-Fix.zip) (~5 MB) áp dụng trực tiếp từ `DB2-Private-Android-fixed.apk`; không cần cài bản no-guide trung gian. Giải nén vào thư mục riêng, chép APK fixed vào đó, chạy `Apply-Speed.bat` hoặc `Apply-Speed-Python.bat`. Cài cập nhật `DB2-Private-speed.apk` bằng ADB `install -r` để giữ dữ liệu ứng dụng.

Client mới gồm:

- Tắt hướng dẫn.
- Nút `Speed Nx` gần góc trên bên phải, bấm để đổi lần lượt 1–10 rồi về 1; lưu lựa chọn. Scale engine hiệu dụng bị giới hạn 10×, giữ pause; không sửa Date.now hoặc timer mạng thực. Cập nhật tốc độ Spine khi đổi mức trong trận.
- Hiệu ứng quay mặc định bỏ nhanh; checkbox Skip trong màn quay vẫn thay đổi và lưu lựa chọn này.
- Lỗi xử lý phản hồi/callback được ghi vào nhật ký và hiển thị thông báo, gỡ loading rồi tiếp tục hàng đợi. Không tự gửi lại lệnh quay đã được server chấp nhận.

APK đầu ra SHA-256: `650e472cfbcc821dcb23a280921d1cab863964a0ff22a994aa8fc4177bff5b6f`. Package và chứng chỉ giữ nguyên. Đã kiểm tra cú pháp, ciphertext JSC khớp bundle build, chữ ký v1/v2/v3 và tài nguyên không nén/căn lề. Bản vá được tái tạo và xác minh bằng Python và PowerShell. Chưa xác nhận cài đặt/giao diện mới trên BlueStacks. Thông tin build: `client/speed-build.json`.

### Phạm vi gameplay

[Đối chiếu gameplay](analysis/gameplay-review.md) ghi các nguồn YouTube/nhà phát hành và hạn chế truy cập video. [Danh sách route](analysis/route-coverage.json) hiện có 16/342 route đã dispatch, còn 326 route chưa triển khai; đây không phải bản server hoàn chỉnh. Headless tests không thay thế kiểm thử trận đấu/giao diện trên thiết bị. Các route chưa có vẫn báo lỗi, không trả thành công giả.
