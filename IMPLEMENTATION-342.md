# Mục tiêu 342/342 route

Mục tiêu đã được người dùng yêu cầu: toàn bộ 342 route có xử lý nghiệp vụ, dữ liệu bền vững và phản hồi tương thích client. Route đăng ký tên rồi trả thành công rỗng không được tính hoàn tất.

Nhánh làm việc: `route-342`. Đây là nhánh phát triển, không thay thế các APK/gói vá đã phát hành ở main. Mục tiêu còn đang mở; chưa hoàn tất.

## Định nghĩa hoàn tất

Với từng route: đối chiếu request thật từ JavaScript; xác thực tài khoản và quyền với dữ liệu; xử lý dữ liệu, chi phí, phần thưởng và transaction; kiểm thử thành công/thất bại/replay; đối chiếu response với consumer của client. Các chuỗi giao diện/trận đấu cần kiểm tra trên thiết bị trước khi gọi là bản chơi hoàn chỉnh. Luật không đọc được từ client phải ghi là luật server riêng hoặc chờ bằng chứng, không mô tả như luật gốc đã xác minh.

## Tiến độ hiện tại

- Đã trích đủ 342 hợp đồng request: `analysis/route-contracts.json`. Công cụ Acorn giải quyết cả hai route có tên đi qua biến cục bộ, không chỉ các chuỗi truyền trực tiếp vào request.
- 165 route có xử lý trong nhánh và được các bộ kiểm thử nhóm bao phủ. Còn 177 route chưa triển khai. Xem `analysis/route-coverage.json` để biết từng route. Đây là độ phủ xử lý phía server, chưa phải 165 luồng đã xác minh trên thiết bị.
- Đã chạy 136 kiểm thử tổng thể. Các kiểm thử gồm engine gốc/phát lại trận, ghi thưởng một lần, túi đồ và tiền tệ có transaction, quyền sở hữu, hết hạn vật phẩm, thông báo thư/bạn bè/chat giữa hai WebSocket và codec Pomelo gốc. Các chuỗi kiểm thử gọi thành công đủ 38 route đội hình và 12 route arena 3v3; bảng chi phí và input combat được đối chiếu trực tiếp với hàm gốc. Nhiệm vụ dùng counter/claim SQL; quyền GM cần token quản trị và client xóa role/hash/cache đúng cách. Arena được kiểm tra với engine PvP gốc, lưu báo cáo, cập nhật hạng và chống gửi lại trận.

## Phần mới trong nhánh

Sáu route smap: bắt đầu, kết thúc, càn quét, rương chương, đặt lại lượt và mua lượt chế độ 5. Trận bắt đầu có seed server và snapshot đội hình; server chạy lại engine JavaScript gốc trước khi nhận kết quả thắng. Hồ sơ chứa run đang hoạt động trong SQLite nên reconnect không tạo thưởng lặp. Server không chấp nhận đổi seed hoặc đội hình sau khi bắt đầu. Client được vá để dùng seed và gửi lịch sử/tick thực thay các giá trị 0/rỗng của client cũ. Đường forfeit không phát thưởng.

Chín route nhân vật: ảnh tướng/đồng hành/danh hiệu/chat, ẩn trang bị, mua thể lực, mua điểm kỹ năng, mua vàng, điểm danh. Quyền ngoại hình và hạn mức/giá trị có sẵn lấy từ dữ liệu client; các grant chưa mở không tự được tạo theo ID từ client.

Dữ liệu nền: hồi thể lực/điểm kỹ năng theo timestamp, ngày server UTC+7, reset hạn mức hằng ngày, kỹ năng đầu tiên của tướng, dữ liệu nền cần cho màn xếp đội. Combat worker dùng các module battle gốc; phần renderer được thay bằng event sink, không thay công thức gây sát thương hay RNG.

14 route bạn bè, 5 thư, 2 bảng xếp hạng, 2 cửa hàng và 2 chat: dữ liệu SQLite, quyền người gửi/nhận, giới hạn ngày, chống nhận đính kèm lặp; xếp hạng từ tiến độ đã lưu; stock theo nhóm/trọng số/bảng giá và lịch UTC+7. Push dùng codec Pomelo gốc, chỉ gửi sau khi chọn nhân vật. Thư và các delta khác không ghi đè toàn bộ `extra.chat`.

19 route túi đồ: bán, hợp thành tướng/đá/trang bị/đồng hành, nâng sao và tăng tỷ lệ, cấp/kỹ năng đồng hành, tái tạo/lưu/hợp capsule, nâng/phân giải tinh tú. Vật phẩm riêng lẻ có model và ô túi riêng; capsule có thuộc tính, tinh tú có cấp/giá trị và đồng hành có kinh nghiệm/kỹ năng. Vé/vật phẩm hết hạn không được dùng. Schema 9 sửa các stack riêng lẻ cũ, giữ số dư và các thuộc tính đã có.

38 route đội hình: trang bị/tháo từng món hoặc tự chọn, nâng/tiến hóa chiêu thức, màu/sao/đột phá, kinh nghiệm, kỹ năng thường/thức tỉnh, tu luyện/reset, chiến hồn, duyên phận, tiến hóa kỹ năng và reset chiến binh. Schema 10 đổi kỹ năng thành map theo ID đúng consumer `skillItem`, không mất cấp đã nâng. Chi phí/giới hạn lấy từ hàm gốc qua `tools/extract_progression.py`. Hoàn tài nguyên dùng sổ đầu tư đã lưu, chỉ hoàn một lần. Các instance trang bị giữ nguyên thuộc tính khi tháo/lắp.

8 route vật phẩm/nhiệm vụ/online: rương ngẫu nhiên hoặc tự chọn, chia số lượng đổi rương, vật phẩm hồi phục/ngoại hình, thưởng danh vọng, nhận nhiệm vụ và mốc hoạt động, báo thời gian online có kiểm tra đồng hồ server. ID 98/99/100 tăng VIP exp/thể lực/exp đội thay vì vào túi. VIP exp trong game không xác nhận thanh toán hoặc tăng `topUpMoney`. Nhiệm vụ dùng các chuỗi/bảng thưởng gốc và counter hành động đã ghi; reset ngày/tuần UTC+7, chống nhận lặp bằng SQL. Schema 11 thêm dữ liệu VIP exp/danh vọng nền.

3 route GM: cấp vật phẩm, thêm tướng, xóa tướng. Web quản trị có cấp/thu hồi quyền theo ID nhân vật; chỉ token quản trị được đổi quyền. Xóa hoàn trang bị riêng lẻ, hủy run đang chờ và phải giữ ít nhất một chiến binh. Client mới xử lý role tombstone, xóa hash/cache và quay về sảnh; APK cũ chưa có bản vá này.

9 route arena: thông tin, ghép đối thủ, đặt/xem phòng thủ, mua lượt, chọn/kết thúc trận và danh sách/chi tiết báo cáo. Seed và hai đội được chụp lúc chọn; kết thúc chạy lại `pkBattleInstant` gốc và dùng damage map tính lại. Đổi hạng và thưởng kỷ lục lấy bảng `arenaAchieveRewards`, phát một lần; quyết toán ngày từ `arenaRewards` vào 21 giờ UTC+7 qua thư. Client mới dùng seed server và phân biệt NPC âm với ID người chơi từ 1; APK cũ không gửi seed đúng cho luồng này.

2 route hỗ trợ riêng: `viewAd` cấp token hỗ trợ nội bộ và `point.adReward` dùng token nhận 1 vé thường. Đây không phải xác nhận quảng cáo bên thứ ba. Hạn mức lấy `AD.TYPE_TIMES_MAP`; vé hỗ trợ quay cách nhau 6 giờ; một token đang chờ mỗi loại, hết hạn sau 1 giờ. Cờ `isAd` của mua thể lực/vàng, điểm danh, nhiệm vụ ngày và đặt lại ải sử dụng token tương ứng: miễn phí một lượt thể lực/vàng, nhân đôi điểm danh/thưởng và điểm hoạt động của nhiệm vụ ngày, hoặc đặt lại ải không dùng quota VIP. Không ghi tăng tiền nạp. Schema 12 thêm map hỗ trợ; ngày mới xóa token cũ.

12 route arena 3v3: sáu bảng cấp độ, ba đội không lặp chiến binh/đồng hành, phòng thủ, ghép/chọn/đấu, mua lượt, báo cáo, nhận xu tích lũy, chiêm bái và hai bảng xếp hạng. Server chạy lại từng lượt cùng seed đến khi một bên thắng hai lượt, đối chiếu toàn bộ `winPlayerIdMap`; damage map dùng kết quả engine. Báo cáo đọc bằng route chung arena như client yêu cầu. Generator `arena3v3Scene.genData` gốc nhận đúng dữ liệu server trong kiểm thử. Schema 13 bổ sung counter nền; client mới lấy seed server cho vòng đầu.

18 route bang hội: tạo/gia nhập/duyệt đơn, quyền chủ/phó bang, kế nhiệm, giải tán/rời bang, thông báo/cấu hình, chiêm bái và nhận thưởng, rương, đánh trống, kỹ năng. Thành viên và đơn nằm trong SQL; mỗi thao tác lấy quyền thật thay vì tin guildId client. Thay đổi thành viên phát onSync cho các phiên liên quan. Kiểm thử gọi đủ 18 route và chạy generator/giao diện duyệt đơn gốc; bản vá client tránh thêm thành viên hai lần sau delta. Schema 14 thêm cấu trúc bang trống đủ trường và kỹ năng bang. Các chế độ boss/chiến bang chưa triển khai không được tính trong 18 route này.

Combat ba đội tải engine một lần cho toàn bộ trận; kết quả và damage được đối chiếu với chạy từng vòng riêng. Giới hạn hai worker đồng thời và thời gian chờ; heartbeat/RPC timeout được điều chỉnh để không ngắt kết nối giữa lúc server xác minh trận. SDK riêng vô hiệu gửi telemetry và thanh toán native; chỉ catalog do server công bố với giá gem riêng mới đi qua route mua nội bộ. Chưa có xác nhận thanh toán bên thứ ba.

## Những phần cần chốt hoặc xác minh tiếp

- Người dùng đã chọn dùng bảng/công thức gốc khi có và định nghĩa, ghi rõ luật riêng cho phần thiếu. Số lượng rơi ải dùng `specifyDropValues`, phù hợp consumer `starSignSmapScene`; thời điểm/xác suất rơi của mọi loại ải chưa xác minh. Cửa hàng tính giá đơn vị nhân số lượng; refresh loại 14 dùng fallback gem do config gốc thiếu. Chu kỳ đồng hành tăng sao đặt lại cấp 1, giữ kỹ năng; chat giới hạn 200 UTF-16 unit/3 giây. Bốn tinh tú cùng thuộc tính mở bộ yếu ở rarity tối thiểu 3, mạnh ở rarity 5. Tự trang bị chọn ô trống/món yếu nhất và không hạ chất lượng; reset hoàn những chi phí có sổ kể từ lúc triển khai, không bịa tài nguyên huấn luyện trước đó. Ghép thuộc tính cơ bản/trang bị/thức tỉnh là luật riêng dùng các giá trị gốc; công thức chiến đấu và tính power lấy từ client. Không coi các lựa chọn này là mã server gốc đã phục hồi.
- Nạp tiền, lịch/mùa giải và event có phần cấu hình ở server gốc. Không giả vờ xác nhận thanh toán/quảng cáo bên thứ ba; hỗ trợ nội bộ là luật riêng đã mô tả, chưa có UI riêng thay SDK quảng cáo trong APK.
- Combat giờ cần Node.js trên máy chạy server (Termux: `pkg install nodejs`, Windows: Node.js LTS). Thiếu runtime thì route kết thúc trận báo lỗi, không phát thưởng không được kiểm tra. Chưa đóng gói APK mới của nhánh này.
- Chưa xác nhận luồng phiêu lưu mới trên BlueStacks; headless replay không chứng minh mọi preload/animation/scene đều hoạt động.
- Thưởng rương có trọng số chọn một mục W và roll độc lập các mục R là luật riêng dùng tham số mô tả gốc. Tự mở tối đa 1.000 rương/lần, bỏ qua rương cần chọn hoặc chưa cấu hình. Nhiệm vụ giữ đồ/đá tính cả đồ đang trang bị; những counter cho chế độ chưa triển khai còn bằng 0. Online nhận tối đa 60 giây mỗi request, giới hạn bằng thời gian phiên đã chọn nhân vật và không được tăng nhanh bởi tốc độ game.
- Arena riêng mở với 20 NPC dùng stat template `robotData`, ID âm; người mới xếp cuối. Ghép ba đối thủ khác nhau theo khoảng hạng; thắng đổi chỗ khi đối thủ đang có hạng tốt hơn. Không có cooldown giữa trận; 5 lượt/ngày và giá/hạn mức mua theo bảng VIP/client. Chọn trận trừ lượt, cùng tham số dùng lại seed; đổi trận bỏ lượt đã tiêu. Snapshot hết hạn sau 15 phút. Quyết toán một lần theo hạng lúc kiểm tra ngày, không truy lĩnh mọi ngày vắng mặt; heartbeat của phiên đang chơi cũng kiểm tra thư đến hạn.
- Drop gốc có nhánh số lượng 0: luật riêng coi là không có phần thưởng, không tạo vật phẩm số lượng 0 hoặc hủy lượt. Kiểm thử ép nhánh rương bang 701 → 10304 để không phụ thuộc ngẫu nhiên.
- Rương cấu hình ID 351 không có mã cấu hình dùng mặc định riêng 1.000 vàng với đủ metadata cho UI; mã cấu hình cụ thể phải tồn tại trong `shop.randomBoxList`, mã lạ bị từ chối thay vì tạo rương thiếu trường.
- Arena 3v3 riêng dùng 20 NPC/bảng, người mới đứng cuối, không cooldown, 5 lượt/ngày. Phải có ít nhất ba chiến binh; lên bảng cấp mới chuyển xuống cuối bảng mới. Xu 106 tích lũy theo `arenaRewards.hourCoin`, lấy trọn giờ, truy lĩnh tối đa 24 giờ. Mỗi tượng người chơi thật nhận một lần/ngày và chịu tổng hạn mức VIP; NPC không mở thưởng tượng. Phần thưởng chiêm bái dùng hàm gốc. Lượt, run, đổi hạng, nhận xu và tượng đều được lưu/kiểm tra ở server. GM làm roster còn dưới ba tướng sẽ gỡ khỏi bảng ba đội và hủy run đang chờ.

- Bang hội: dùng bảng gốc cho giá tạo, giới hạn thành viên, đóng góp, rương/trống, chiêm bái và kỹ năng. Luật riêng: tên 16 UTF-16 unit, thông báo 300 ký tự, tối đa 10 đơn đang chờ, rương trả tất cả soul trong danh sách ở lượt có phí; kỹ năng đã học giữ hiệu lực sau khi rời bang. Trống loại 3 gửi quà tới thành viên hiện tại, mỗi người nhận tối đa 10 thư chia sẻ/ngày. Kế nhiệm dùng thời gian hoạt động server; rương/trống/chiêm bái reset UTC+7.

## Thứ tự các nhóm tiếp theo

1. Nâng tướng/kỹ năng/trang bị, nhiệm vụ và điều kiện mở khóa.
2. Các chế độ chiến đấu cá nhân: arena/3v3, luyện tập, viễn chinh, boss, endless, đảo, timePeak.
3. Bang hội, đội nhiều người, chiến trường/liên server, lịch event và các RPC quản trị.

Mỗi nhóm chỉ nâng trạng thái khi có xử lý và kiểm thử; không thay con số mục tiêu 342.
