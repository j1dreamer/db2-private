# Ubuntu + Tailscale

Mẫu triển khai này dành cho VPS của bạn. Chưa có máy đích/SSH để thực hiện hay đo tải thật. Ubuntu 24.04 LTS, 1 vCPU / 2 GB RAM dùng thử nhóm nhỏ; không suy ra sức chứa người chơi từ số route. Engine trận cần Node.js LTS (khuyến nghị 22/24); Python cần 3.10+. Gói hệ thống `nodejs` của Ubuntu có thể cũ, kiểm `node --version` trước triển khai.

## Bố trí

- `/opt/db2/app`: source nhánh `eng-sp-sss`, root sở hữu, tài khoản dịch vụ chỉ đọc.
- `/opt/db2/venv`: Python venv cài `requirements.txt`.
- `/var/lib/db2`: dữ liệu SQLite, token, backup; chỉ tài khoản `db2` đọc/ghi.
- `/etc/db2/server.env`: cấu hình, root sở hữu, mode 600.
- `deploy/db2.service`: chạy bằng tài khoản hệ thống `db2`, tự khởi động lại nếu lỗi và theo máy khi bật systemd.

Sau khi cài Python/venv/Node/Tailscale, tải source vào `/opt/db2/app`, tạo tài khoản hệ thống `db2`, tạo venv tại `/opt/db2/venv` và cài dependencies. Chép unit tới `/etc/systemd/system/db2.service`; chép mẫu env tới `/etc/db2/server.env`, thay `DB2_BIND` bằng đúng kết quả `tailscale ip -4`. Không chạy nguyên giá trị mẫu. Unit không tự đăng nhập Tailscale hoặc mở firewall; ACL Tailscale phải cho thiết bị chơi truy cập cổng TCP 20003.

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now db2
sudo systemctl status db2 --no-pager
sudo journalctl -u db2 -n 80 --no-pager
```

Kiểm từ máy đã vào cùng Tailscale:

```sh
curl --fail http://IP_TAILSCALE:20003/health
```

Phải có build `eng-sp-sss-event-goals-v6`, schema 30. Web quản trị cùng địa chỉ này, token trong `/var/lib/db2/admin-token`; chỉ đọc trên máy quản trị, không đăng token lên chat/repo. Trong APK/IPA BoxInfo nhập `http://IP_TAILSCALE:20003`. Tailscale cần bật cả trên VPS và máy chơi; bind riêng IP này không mở game ra Internet công cộng.

## Cập nhật / sao lưu

Dừng service trước khi thay source; giữ nguyên `/var/lib/db2`. Khi service đã dừng, sao lưu toàn thư mục đó sang nơi riêng, sau đó cập nhật source/dependencies và bật lại. Kiểm health, đăng nhập, túi đồ và một event trước khi cho người chơi vào. Không dùng `git reset` hoặc xóa database để sửa lỗi. Rollback cả source và bản sao database nếu một bản nâng cấp không tương thích.

systemd chỉ giữ tiến trình chạy; không thay việc theo dõi hiệu năng, log, dung lượng và kiểm backup. Có thể thêm lịch backup/giám sát khi triển khai thật; không có tác vụ giám sát từ chat được tạo sẵn. 1 vCPU có thể chậm khi nhiều trận cùng chạy; chỉ tăng số người chơi sau khi đo tải thực.

## Kết nối hỗ trợ qua SSH

Cần địa chỉ VPS, cổng SSH và tên user có quyền cài dịch vụ. Có thể dùng SSH public key tạm cho phiên hỗ trợ; không gửi mật khẩu/private key trong chat. Nếu SSH chỉ ở Tailscale, môi trường thực hiện cũng phải có đường vào tailnet. Sau khi xác minh kết nối mới cài, kiểm tra dịch vụ và bàn giao lệnh quản lý; chưa có kết nối VPS nào được thực hiện bởi bản source này.
