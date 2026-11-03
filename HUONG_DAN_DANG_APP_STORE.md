# Hướng Dẫn Đóng Gói & Đăng App "Chấm Công Pro" Lên Apple App Store / Google Play

Bộ mã nguồn này bao gồm đầy đủ 2 phương án để bạn đóng gói thành ứng dụng gốc (`.ipa` cho iPhone / App Store và `.aab` cho Android / Google Play):

---

## 1. Vì sao khi mở file `.html` trong ứng dụng Tệp (Files) của iPhone lại bị vỡ giao diện?
- Trình xem trước mặc định (**Quick Look**) của ứng dụng **Tệp (Files)** trên iOS tự động **khóa toàn bộ JavaScript và thư viện bên ngoài** vì lý do bảo mật của Apple.
- File `www/index.html` (và bản cập nhật mới trong khung chat) đã được **nhúng toàn bộ CSS nội tuyến (Inline CSS)** để không còn bị phóng to biểu tượng đồng hồ.
- Tuy nhiên, để các nút bấm hoạt động trên iPhone mà **không cần đăng lên App Store**, bạn cần mở ở môi trường cho phép chạy JavaScript:
  1. **Cách nhanh nhất (0đ, không cần cài thêm)**: Mở trực tiếp thẻ ứng dụng ngay bên trong **app Gemini** trên iPhone.
  2. **Cách ghim ra Màn hình chính iPhone (Safari PWA)**: Kéo thả file `www/index.html` lên [Tiiny.host](https://tiiny.host) hoặc [Netlify Drop](https://app.netlify.com/drop) (miễn phí) để nhận 1 đường link `https://...` -> mở link đó trên **Safari** -> nhấn nút **Chia sẻ** -> chọn **Thêm vào MH chính (Add to Home Screen)**.
  3. **Dùng app đọc HTML trên App Store**: Tải ứng dụng miễn phí **Documents - File Reader** hoặc **Koder Code Editor** trên App Store, mở file `.html` bên trong đó thì JavaScript sẽ chạy 100%.

---

## 2. Cách đóng gói file `.ipa` và đăng lên Apple App Store (Phương án Expo Cloud — Không cần máy Mac)

Dự án đã cấu hình sẵn **Expo React Native (`App.js`, `app.json`, `eas.json`)**. Bạn có thể build file `.ipa` trên đám mây của Expo để đẩy thẳng lên **TestFlight / App Store**:

### Điều kiện của Apple khi đăng lên App Store:
- Tài khoản **Apple Developer Program** (phí 99 USD/năm của Apple — bắt buộc đối với mọi ứng dụng muốn xuất hiện trên App Store hoặc TestFlight).

### Các bước thực hiện trên máy tính (Windows hoặc Mac):
1. Cài đặt [Node.js](https://nodejs.org/) và mở Terminal trong thư mục giải nén này:
   ```bash
   npm install
   npm install -g eas-cli
   ```
2. Đăng nhập tài khoản Expo (đăng ký miễn phí tại [expo.dev](https://expo.dev)):
   ```bash
   eas login
   ```
3. Chạy thử ngay trên iPhone thông qua ứng dụng **Expo Go** (Miễn phí, không cần tài khoản Apple 99 USD):
   - Tải app **Expo Go** trên App Store về iPhone.
   - Chạy lệnh:
     ```bash
     npx expo start
     ```
   - Dùng Camera iPhone quét mã QR hiện trên màn hình để mở app chạy trực tiếp trên iPhone!
4. Đóng gói file `.ipa` và đẩy lên **App Store Connect / TestFlight**:
   ```bash
   eas build --platform ios
   eas submit --platform ios
   ```
