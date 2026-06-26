# Báo Cáo Đặc Tả Cơ Sở Dữ Liệu & Danh Sách APIs (Database & API Specification)

Tài liệu này cung cấp toàn bộ đặc tả chi tiết về cấu trúc Cơ sở dữ liệu (Database Schema), mối quan hệ giữa các thực thể (Entity Relationships), phân tích khả năng thiết lập biểu đồ thống kê từ DB, và danh sách đầy đủ tất cả các API Endpoints trong dự án.

---

## 1. Mối Quan Hệ Giữa Các Thực Thể (Entity Relationships)

Dưới đây là sơ đồ **Mermaid ER Diagram** thể hiện cấu trúc liên kết dữ liệu giữa các bảng trong hệ thống:

```mermaid
erDiagram
    users {
        UUID id PK
        String username UK
        String password
        String fullName
        String email
        String imageUrl
        String role_id FK
        LocalDateTime created_at
        LocalDateTime updated_at
    }
    roles {
        String name PK
        String description
    }
    chords {
        UUID id PK
        String title
        String slug UK
        String content
        UUID user_id FK
        UUID artist_id FK
        String artistName
        UUID category_id FK
        String youtubeUrl
        boolean isPublic
        Long views
        LocalDateTime createdAt
        LocalDateTime updatedAt
    }
    chord_views {
        UUID id PK
        UUID chord_id FK
        UUID user_id
        String ip_address
        LocalDateTime viewed_at
    }
    artists {
        UUID id PK
        String name
        String slug UK
        String description
        String imageUrl
    }
    categories {
        UUID id PK
        String name
        String slug
    }
    audios {
        UUID id PK
        String url
        UUID chord_id FK "Unique"
    }
    posts {
        UUID id PK
        String content
        UUID audio_id FK "Unique"
        UUID user_id FK
        LocalDateTime created_at
        LocalDateTime updated_at
    }
    comments {
        UUID id PK
        String content
        UUID post_id FK
        UUID user_id FK
        LocalDateTime created_at
        LocalDateTime updated_at
    }
    likes {
        UUID id PK
        UUID post_id FK "Unique composite (post_id, user_id)"
        UUID user_id FK "Unique composite (post_id, user_id)"
        LocalDateTime created_at
    }
    playlists {
        UUID id PK
        String name
        String description
        UUID userId
        LocalDateTime created_at
    }
    playlist_chords {
        UUID playlist_id PK,FK
        UUID chord_id PK,FK
    }
    collections {
        UUID id PK
        String name
        String slug
        UUID user_id FK
        LocalDateTime created_at
    }
    collection_chords {
        UUID collection_id PK,FK
        UUID chord_id PK,FK
    }
    stores {
        UUID id PK
        UUID user_id FK "Unique"
    }
    store_posts {
        UUID store_id PK,FK
        UUID post_id PK,FK
    }
    requests {
        UUID id PK
        String type "CHORD, ARTIST, SONG"
        String rawData "JSON TEXT"
        UUID created_by_id FK
        String status "PENDING, APPROVED, REJECTED"
        Long requesterId
        LocalDateTime createdAt
    }
    invalidated_tokens {
        String id PK "jti"
        Date expiryTime
    }

    users ||--|| roles : "has 1"
    users ||--|| stores : "has 1 (1-1)"
    stores ||--{ store_posts : "contains"
    posts ||--{ store_posts : "referenced by"
    chords ||--o| audios : "has 0..1 (1-1)"
    chords }|--|| users : "created by"
    chords }|--|| artists : "performed by"
    chords }|--|| categories : "categorized by"
    chord_views }|--|| chords : "tracks"
    posts }|--|| users : "created by"
    posts ||--o| audios : "references 0..1"
    comments }|--|| posts : "belongs to"
    comments }|--|| users : "written by"
    likes }|--|| posts : "liked"
    likes }|--|| users : "liked by"
    playlists ||--{ playlist_chords : "contains"
    chords ||--{ playlist_chords : "part of"
    collections }|--|| users : "owned by"
    collections ||--{ collection_chords : "contains"
    chords ||--{ collection_chords : "part of"
    requests }|--|| users : "created by"
```

---

## 2. Chi Tiết Các Trường (Fields) & Định Nghĩa Bảng Dữ Liệu

### 2.1. Bảng `users` (Người dùng)
*Lưu trữ thông tin tài khoản người dùng.*
* **id** (`UUID`, Primary Key): Khóa chính tự sinh (UUID).
* **username** (`String`, Unique, Not Null): Tên đăng nhập duy nhất.
* **password** (`String`, Not Null): Mật khẩu đã được mã hóa BCrypt.
* **fullName** (`String`): Họ và tên đầy đủ.
* **email** (`String`): Email người dùng.
* **imageUrl** (`String`): Link ảnh đại diện (avatar).
* **roles_name** (`String`, Foreign Key): Liên kết tới bảng `roles`.
* **created_at** (`LocalDateTime`, Not Null): Thời gian tạo tài khoản (Tự động gán khi insert).
* **updated_at** (`LocalDateTime`): Thời gian cập nhật thông tin lần cuối.

### 2.2. Bảng `roles` (Vai trò phân quyền)
*Phân quyền truy cập tài nguyên hệ thống.*
* **name** (`String`, Primary Key): Tên vai trò (ví dụ: `admin`, `user`).
* **description** (`String`): Mô tả chức năng vai trò.

### 2.3. Bảng `chords` (Hợp âm / Bài hát)
*Chứa dữ liệu bài hát và hợp âm nhạc.*
* **id** (`UUID`, Primary Key): Khóa chính tự sinh.
* **title** (`String`, Not Null): Tiêu đề bài hát.
* **slug** (`String`, Unique, Not Null): Chuỗi slug tối ưu URL (Tự động tạo dựa trên `title`).
* **content** (`TEXT`, Not Null): Nội dung hợp âm bài hát (Định dạng văn bản).
* **user_id** (`UUID`, Foreign Key): Người đóng góp/tạo hợp âm (Liên kết bảng `users`).
* **artist_id** (`UUID`, Foreign Key): Ca sĩ trình bày (Liên kết bảng `artists`).
* **artistName** (`String`): Tên ca sĩ (nhập nhanh).
* **category_id** (`UUID`, Foreign Key, Not Null): Danh mục/Thể loại (Liên kết bảng `categories`).
* **youtubeUrl** (`String`): Link video YouTube minh họa.
* **isPublic** (`boolean`, Default `false`): Trạng thái công khai duyệt bài.
* **views** (`Long`, Default `0`): Tổng lượt xem của hợp âm này.
* **createdAt** (`LocalDateTime`, Not Null): Thời gian đăng.
* **updatedAt** (`LocalDateTime`): Thời gian cập nhật nội dung.

### 2.4. Bảng `chord_views` (Nhật ký lượt xem hợp âm)
*Lưu lịch sử xem hợp âm chi tiết phục vụ thống kê lượt xem theo thời gian thực.*
* **id** (`UUID`, Primary Key)
* **chord_id** (`UUID`, Foreign Key, Not Null): Liên kết bảng `chords`.
* **user_id** (`UUID`): ID người dùng xem bài (nếu đã đăng nhập).
* **ip_address** (`String`): Địa chỉ IP khách hàng truy cập.
* **viewed_at** (`LocalDateTime`): Thời gian click xem bài hát (Tự động gán thời gian hiện tại).

### 2.5. Bảng `posts` (Bài đăng cộng đồng)
*Bài đăng dạng tin tức, chia sẻ cảm nghĩ hoặc đính kèm tệp âm thanh.*
* **id** (`UUID`, Primary Key)
* **content** (`TEXT`, Not Null): Nội dung bài đăng.
* **audio_id** (`UUID`, Foreign Key, Unique): File âm thanh ghi âm đính kèm (Liên kết bảng `audios`).
* **user_id** (`UUID`, Foreign Key, Not Null): Người đăng bài viết (Liên kết bảng `users`).
* **created_at** (`LocalDateTime`): Ngày đăng bài.
* **updated_at** (`LocalDateTime`): Ngày cập nhật bài viết.

### 2.6. Bảng `comments` (Bình luận bài viết)
*Bình luận của người dùng trên các bài đăng.*
* **id** (`UUID`, Primary Key)
* **content** (`TEXT`, Not Null): Nội dung bình luận.
* **post_id** (`UUID`, Foreign Key, Not Null): Bài viết chứa bình luận.
* **user_id** (`UUID`, Foreign Key, Not Null): Người viết bình luận.
* **created_at** (`LocalDateTime`): Ngày viết bình luận.
* **updated_at** (`LocalDateTime`): Ngày sửa bình luận.

### 2.7. Bảng `likes` (Lượt thích bài viết)
*Người dùng tương tác thích bài đăng.*
* **id** (`UUID`, Primary Key)
* **post_id** (`UUID`, Foreign Key, Not Null)
* **user_id** (`UUID`, Foreign Key, Not Null)
* **created_at** (`LocalDateTime`): Ngày thích.
* *Constraint:* Unique composite key trên cặp `(post_id, user_id)`.

### 2.8. Bảng `stores` & `store_posts` (Kho bài viết yêu thích của User)
*Lưu danh sách bài viết yêu thích của từng User.*
* **id** (`UUID`, Primary Key)
* **user_id** (`UUID`, Foreign Key, Unique, Not Null): Người sở hữu kho lưu trữ.
* Bảng trung gian **`store_posts`**:
  * **store_id** (`UUID`, Foreign Key, PK)
  * **post_id** (`UUID`, Foreign Key, PK)

### 2.9. Bảng `playlists` & `playlist_chords` (Danh sách phát nhạc)
* **id** (`UUID`, Primary Key)
* **name** (`String`)
* **description** (`TEXT`)
* **userId** (`UUID`, Not Null)
* **created_at** (`LocalDateTime`)
* Bảng trung gian **`playlist_chords`**:
  * **playlist_id** (`UUID`, Foreign Key, PK)
  * **chord_id** (`UUID`, Foreign Key, PK)

### 2.10. Bảng `collections` & `collection_chords` (Bộ sưu tập hợp âm)
* **id** (`UUID`, Primary Key)
* **name** (`String`)
* **slug** (`String`)
* **user_id** (`UUID`, Foreign Key)
* **created_at** (`LocalDateTime`)
* Bảng trung gian **`collection_chords`**:
  * **collection_id** (`UUID`, Foreign Key, PK)
  * **chord_id** (`UUID`, Foreign Key, PK)

### 2.11. Bảng `requests` (Yêu cầu duyệt nội dung)
*Kiểm duyệt nội dung của người dùng gửi lên trước khi chuyển thành thực thể chính thức.*
* **id** (`UUID`, Primary Key)
* **type** (`String`): Kiểu yêu cầu (`CHORD`, `ARTIST`, `SONG`).
* **rawData** (`TEXT`): Chuỗi JSON chứa toàn bộ dữ liệu cần tạo (khi duyệt sẽ parse và save).
* **created_by_id** (`UUID`): Người yêu cầu.
* **status** (`String`): Trạng thái (`PENDING`, `APPROVED`, `REJECTED`).
* **requesterId** (`Long`)
* **createdAt** (`LocalDateTime`)

---

## 3. Khả Năng Vẽ Biểu Đồ Từ Cơ Sở Dữ Liệu (Analytics & Chart Feasibility)

Dưới đây là phân tích chi tiết về các câu hỏi thống kê biểu đồ dựa trên cấu trúc DB hiện tại của dự án:

### 3.1. Biểu đồ tổng số người dùng mới (Theo ngày / tuần / tháng)
* **Khả thi:** **CÓ** (Đã được cấu hình tối ưu).
* **Chi tiết cấu trúc:** Trước đây, thực thể `User` chưa lưu giữ thời gian tạo tài khoản. Chúng tôi đã tiến hành cập nhật thêm trường `createdAt` (sử dụng `@CreationTimestamp` tự động điền thời gian máy chủ khi đăng ký) và trường `updatedAt` cho `User.java`.
* **Cách thực hiện truy vấn:**
  ```sql
  -- Theo ngày:
  SELECT DATE(created_at) AS date, COUNT(id) AS count FROM users GROUP BY DATE(created_at);
  -- Theo tháng:
  SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(id) AS count FROM users GROUP BY DATE_FORMAT(created_at, '%Y-%m');
  ```

### 3.2. Tổng số hợp âm đã duyệt / được đăng tải
* **Khả thi:** **CÓ**.
* **Chi tiết cấu trúc:** 
  - Hợp âm đã duyệt đăng tải chính thức nằm ở bảng `chords` (chỉ những dòng có `is_public = true` hoặc `isPublic = true`).
  - Lịch sử duyệt bài cũng có thể được đếm thông qua bảng `requests` với điều kiện `type = 'CHORD'` và `status = 'APPROVED'`.
* **Cách thực hiện truy vấn:**
  ```sql
  -- Đếm tổng số hợp âm đã được công khai:
  SELECT COUNT(id) FROM chords WHERE is_public = true;
  ```

### 3.3. Biểu đồ thanh (Bar Chart) về số lượng bài hát mới
* **Khả thi:** **CÓ**.
* **Chi tiết cấu trúc:** Hệ thống guitar biểu diễn bài hát dưới dạng thực thể `Chord` (mỗi Chord đại diện cho một bài hát kèm hợp âm). Trường `createdAt` trong thực thể `Chord` được tự động điền thông qua `@CreationTimestamp`.
* **Cách thực hiện truy vấn:**
  ```sql
  -- Thống kê số lượng bài hát (chord) mới tạo theo tháng:
  SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(id) AS song_count 
  FROM chords 
  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
  ORDER BY month ASC;
  ```

### 3.4. Top 10 bài hát / hợp âm được xem nhiều nhất
* **Khả thi:** **CÓ** (Hỗ trợ 2 phương án).
* **Chi tiết cấu trúc:** 
  1. *Cách 1 (Truy vấn tĩnh - Nhanh):* Dựa trên trường `views` (lượt xem tích lũy) có sẵn trong bảng `chords`.
  2. *Cách 2 (Truy vấn động - Theo thời gian thực):* Bảng `chord_views` ghi nhận từng lượt click xem kèm thời gian `viewed_at`. Phương án này giúp bạn vẽ được cả biểu đồ **Top 10 bài hát xem nhiều nhất trong ngày, trong tuần, hoặc trong tháng qua**.
* **Cách thực hiện truy vấn:**
  ```sql
  -- Tĩnh: Top 10 bài hát có lượt xem cao nhất từ trước đến nay:
  SELECT id, title, views FROM chords ORDER BY views DESC LIMIT 10;
  
  -- Động: Top 10 bài hát xem nhiều nhất trong 7 ngày gần đây (dùng bảng chord_views):
  SELECT c.id, c.title, COUNT(v.id) AS weekly_views 
  FROM chords c 
  JOIN chord_views v ON c.id = v.chord_id 
  WHERE v.viewed_at >= NOW() - INTERVAL 7 DAY 
  GROUP BY c.id, c.title 
  ORDER BY weekly_views DESC 
  LIMIT 10;
  ```

---

## 4. Định Nghĩa APIs & Tham Số Sử Dụng Cho Frontend

Dưới đây là danh sách đầy đủ tất cả các endpoint API trong hệ thống để Frontend tích hợp. Tất cả các endpoint trả về định dạng bao bọc `ApiResponse` như mô tả ở Mục 1.

### 4.1. Hệ thống Đăng nhập & Xác thực (Auth)
* **POST `/auth/log-in`**
  * *Request Body:* `{ "email": "user@gmail.com", "password": "password123" }`
  * *Response:* Trả về Access Token và đặt Refresh Token vào HttpOnly Cookie.
* **POST `/auth/log-in/google`**
  * *Request Body:* `{ "code": "GOOGLE_AUTH_CODE" }`
  * *Response:* Đăng nhập thông qua tài khoản Google.
* **POST `/auth/log-out`**
  * *Request Body:* `{ "token": "ACCESS_TOKEN" }`
* **POST `/auth/refresh`**
  * *Request Body (Optional):* `{ "token": "REFRESH_TOKEN" }` (hoặc tự đọc từ Cookie)
* **POST `/auth/introspect`**
  * *Request Body:* `{ "token": "TOKEN" }`

### 4.2. Quản lý Người dùng (Users)
* **POST `/users`**
  * *Request Body:* `{ "username": "...", "password": "...", "fullName": "...", "email": "..." }`
  * *Mô tả:* Đăng ký tài khoản mới (Public).
* **GET `/users/my-info`**
  * *Mô tả:* Lấy thông tin tài khoản đang đăng nhập hiện tại dựa trên Bearer Token gửi ở Header.
* **GET `/users/{userId}`**
  * *Mô tả:* Chi tiết tài khoản theo ID.
* **PUT `/users/{userId}`**
  * *Request Body:* `{ "fullName": "...", "imageUrl": "...", "roles": ["user"] }`
* **DELETE `/users/{userId}`**

### 4.3. Hợp âm / Bài hát (Chords)
* **POST `/chords`**
  * *Request Body:* `{ "title": "...", "content": "...", "artistName": "...", "categoryId": "UUID", "youtubeUrl": "...", "isPublic": true }`
* **GET `/chords`**
  * *Query Params:* `search` (từ khóa tìm kiếm), `page` (trang số), `size` (kích thước trang).
* **GET `/chords/{id}`**
  * *Mô tả:* Lấy chi tiết bài hát bằng ID.
* **PUT `/chords/{id}`**
* **DELETE `/chords/{id}`**
* **GET `/chords/trending`**
  * *Mô tả:* Lấy danh sách hợp âm thịnh hành trong tuần.
* **GET `/chords/mostViews`**
  * *Mô tả:* Top 10 hợp âm được xem nhiều nhất toàn thời gian.
* **POST `/chords/{chordId}/view`**
  * *Query Params:* `userId` (nếu có đăng nhập)
  * *Mô tả:* Gọi API này khi người dùng truy cập bài hát để tự động ghi nhận lượt xem vào bảng `chord_views` và cộng dồn vào `chords`.

### 4.4. Bài đăng cộng đồng (Posts)
* **POST `/posts`**
  * *Request Body:* `{ "content": "...", "audioId": "UUID" (nếu có), "userId": "UUID" }`
* **GET `/posts/{id}`**
* **PUT `/posts/{id}`**
* **DELETE `/posts/{id}`**

### 4.5. Tương tác Bài viết (Comments & Likes)
* **POST `/comments`**
  * *Request Body:* `{ "content": "...", "postId": "...", "userId": "..." }`
* **PUT `/comments/{id}`**
* **DELETE `/comments/{id}`**
* **GET `/comments/post/{postId}`** - Danh sách bình luận của bài viết.
* **POST `/likes`** - Thích bài đăng `{ "postId": "...", "userId": "..." }`.
* **DELETE `/likes/post/{postId}/user/{userId}`** - Bỏ thích bài đăng.
* **GET `/likes/post/{postId}/user/{userId}/check`** - Trả về `true/false` kiểm tra xem tài khoản hiện tại đã Like hay chưa.

### 4.6. Yêu thích (Stores)
* **GET `/stores/my-store`**
  * *Mô tả:* Xem danh sách bài viết đã lưu của bản thân.
* **POST `/stores/posts/{postId}`**
  * *Mô tả:* Lưu bài viết yêu thích.
* **DELETE `/stores/posts/{postId}`**
  * *Mô tả:* Bỏ lưu bài viết yêu thích.

### 4.7. Danh sách phát & Bộ sưu tập (Playlists & Collections)
* **POST `/playlists`**
  * *Request Body:* `{ "name": "...", "description": "...", "userId": "UUID" }`
* **POST `/playlists/{playlistId}/chords/{chordId}`** - Thêm bài hát vào danh sách phát.
* **POST `/collections`**
  * *Request Body:* `{ "name": "...", "userId": "UUID", "chordIds": ["UUID1", "UUID2"] }`

### 4.8. Âm thanh thu âm (Audios)
* **POST `/audios`**
  * *Request Body:* `{ "url": "link_cloudinary", "chordId": "UUID" }`

### 4.9. Quản lý Yêu cầu kiểm duyệt (Requests)
* **GET `/requests/pending`** - Danh sách yêu cầu chờ duyệt (Admin).
* **POST `/requests`** - Gửi yêu cầu đăng nội dung mới từ User.
* **POST `/requests/{id}/approve`** - Admin phê duyệt yêu cầu (Tự động tạo Chord/Artist chính thức).
* **POST `/requests/{id}/reject`** - Admin từ chối phê duyệt.
