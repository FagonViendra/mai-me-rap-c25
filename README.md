# Mải Mê Ráp C25

Trò chơi xây dựng bằng khối, chạy trong trình duyệt có WebGL2. C25 bổ sung **100 mẫu khối**, **50 họa tiết 24×24** và **Xưởng 100 mẫu mới** để khám phá, chọn vật liệu rồi xây công trình của mình.

## Điểm chính

- **100 mẫu xây dựng:** 40 khối bề mặt; 60 mẫu phiến thấp, bậc thang, cột, lan can, khung, nội thất và chi tiết vườn. Có bộ lọc bộ sưu tập và tìm tên có dấu hoặc không dấu.
- **Tám cảnh có sẵn:** bảy cảnh cũ và Xưởng 100 mẫu mới. Xưởng chia thành 10 khu, mỗi khu 10 mẫu, mở ở chế độ Sáng tạo với bay bật sẵn.
- **Ba thử thách Hộ Vệ:** Lăng Kính, Thạch Giáp và Phong Dực, với vùng báo đòn và cách né khác nhau. Nhấn `J` → **Hộ Vệ** để đọc lời nhắc và chọn thử thách.
- **Giữ công trình:** lưu trong trình duyệt và xuất/nhập thế giới bằng tệp JSON.

## Mở game và xem nguồn

Bản nguồn công khai gồm cây nguồn C25, HTML đã dựng và bốn tài liệu hướng dẫn. `MAI_ME_RAP.html` là tệp game đã dựng. Phần dưới phân biệt gói chơi **GAME** với bộ mã **SOURCE**; các gói và gallery chỉ dùng khi được cung cấp kèm bản phát hành.

### GAME — bộ tệp để chơi

Giải nén toàn bộ gói GAME rồi chạy `CHOI_GAME.cmd`. Giữ `MAI_ME_RAP.html`, `open_or_serve.py` và `serve.py` trong cùng thư mục; bộ khởi chạy cần Python 3. Chơi tiếp bằng cùng trình duyệt và cùng địa chỉ mà bộ khởi chạy mở để dùng đúng dữ liệu lưu.

Từ màn hình đầu: **Thế giới & kho cảnh → Xưởng 100 mẫu mới → Chơi Xưởng 100 mẫu mới**. Trong túi đồ, chọn **Bộ sưu tập → 100 mẫu mới**. Để dùng họa tiết mới: **Esc → Thiết lập → Gói chất liệu → Chi tiết 24×24**.

### SOURCE — đọc và dựng lại

Nguồn C25 gồm 69 đầu vào: 56 tệp `src`, bốn công cụ, tám JSON thế giới và contract của bộ khối. Dùng Python **3.10 trở lên**; Node.js cần cho bước kiểm tra xưởng. Các lệnh sau chạy tại thư mục gốc của cây nguồn:

```sh
node tools/generate_c25_showcase_v2.cjs --check
python tools/generate_c25_scene_data.py --check
python tools/build.py --output builds/c25_my_rebuild/MAI_ME_RAP.html
```

Chọn thư mục đầu ra mới: công cụ dựng từ chối ghi đè HTML hoặc `BUILD.json` đã có. Dựng HTML dùng thư viện chuẩn Python; không cần cài gói npm cho hai công cụ kiểm tra cảnh trên. Bộ khởi chạy của GAME không phải đầu vào bắt buộc để dựng SOURCE. Lệnh dựng không tự mở máy chủ.

## Điều khiển

| Phím / chuột | Tác dụng |
|---|---|
| `W A S D`, di chuột | Di chuyển, nhìn quanh |
| `F` | Bật / tắt bay |
| `Space` / `Shift` khi bay | Đi lên / hạ xuống |
| `E` | Mở túi đồ |
| `1–9` hoặc con lăn | Chọn ô thanh nhanh |
| Chuột phải / chuột trái | Đặt khối / đào |
| Chuột giữa trong Sáng tạo | Lấy mẫu khối đang nhìn |
| `Esc` | Menu, thiết lập, lưu và xuất thế giới |
| `J` | Sổ Gió và trang Hộ Vệ |

## Lưu công trình và giới hạn hiện tại

Mỗi lần bấm **Chơi** trên thẻ cảnh là yêu cầu tạo một bản riêng. Muốn chơi tiếp, dùng **Đến thế giới đã lưu**. Nên giữ thêm bản JSON qua **Esc → Xuất thế giới → Tải JSON**. Nếu game báo chưa lưu được hoặc chưa xác nhận bản lưu, giữ trang đang mở và xuất JSON trước khi rời trang.

Các hình khối có hướng cố định; lan can và khung không tự nối. Bàn, ghế, kệ và chậu là đồ trang trí, chưa có chức năng ngồi, chứa đồ hoặc tự trồng cây. Bước lên nửa khối cần nền khô, đang đi bộ, tắt bay, có điểm đỡ và đủ khoảng trống phía trên. Kiểm tra phần hỗ trợ đặt trứng sinh vật hiện giới hạn ở mức CPU.

## Phạm vi kiểm tra

Bản C25 đã hoàn thành **3 vòng kiểm tra chức năng trong trình duyệt, 614 thao tác và 41 ảnh gốc**. Kiểm tra chạy trong môi trường Linux cô lập với WebGL phần mềm; kết quả này **không phải phép đo FPS hoặc hiệu năng GPU trên Windows**. Dựng lại HTML trùng nguồn cũng không thay thế kiểm tra chơi thực tế.

Ảnh bảng texture/icon là ảnh chẩn đoán. Ảnh Hộ Vệ tạm dừng giúp nhìn hình dáng và dấu báo đòn; ảnh tĩnh không chứng minh nhịp chiến đấu, thời điểm sát thương hoặc hiệu năng. Kiểm tra bố cục khung nhìn không chứng nhận một thiết bị di động vật lý.

## Tài liệu

- [Đọc trước khi chơi](DOC_TOI_TRUOC_C25.txt)
- [Hướng dẫn chơi C25](HUONG_DAN_C25.txt)
- [Danh mục 100 mẫu](DANH_MUC_100_KHOI_C25_V1.txt)
- [Dựng lại từ nguồn](HUONG_DAN_BUILD_C25_V1.txt)
