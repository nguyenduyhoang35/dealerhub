# RBAC (Role-Based Access Control) Design

## Database Schema

### Bảng `roles`
```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,      -- superadmin, admin, driver, customer, ...
  display_name VARCHAR(100) NOT NULL,    -- "Super Admin", "Quản lý", "Tài xế", "Khách hàng"
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,       -- true = không thể xóa/sửa tên
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng `permissions`
```sql
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,     -- agents.view, agents.create, orders.edit
  name VARCHAR(100) NOT NULL,            -- "Xem đại lý", "Tạo đại lý", "Sửa đơn hàng"
  module VARCHAR(50) NOT NULL,           -- agents, products, orders, users, routes, reports
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng `role_permissions`
```sql
CREATE TABLE role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

### Cập nhật bảng `users` (hiện tại là `drivers`)
```sql
ALTER TABLE drivers ADD COLUMN role_id INTEGER REFERENCES roles(id);
-- Migrate data: role='admin' -> role_id=2, role='driver' -> role_id=3, etc.
-- Sau đó: ALTER TABLE drivers DROP COLUMN role;
-- Rename: ALTER TABLE drivers RENAME TO users;
```

## Permissions List

### Module: dashboard
- `dashboard.view` - Xem dashboard

### Module: agents (Đại lý)
- `agents.view` - Xem danh sách đại lý
- `agents.create` - Tạo đại lý mới
- `agents.edit` - Sửa đại lý
- `agents.delete` - Xóa đại lý
- `agents.export` - Xuất Excel

### Module: categories (Danh mục)
- `categories.view` - Xem danh mục
- `categories.create` - Tạo danh mục
- `categories.edit` - Sửa danh mục
- `categories.delete` - Xóa danh mục

### Module: products (Sản phẩm)
- `products.view` - Xem sản phẩm
- `products.create` - Tạo sản phẩm
- `products.edit` - Sửa sản phẩm
- `products.delete` - Xóa sản phẩm
- `products.export` - Xuất Excel

### Module: orders (Đơn hàng)
- `orders.view` - Xem đơn hàng
- `orders.view_own` - Xem đơn hàng của mình (customer)
- `orders.create` - Tạo đơn hàng
- `orders.edit` - Sửa đơn hàng
- `orders.delete` - Xóa đơn hàng
- `orders.change_status` - Đổi trạng thái đơn
- `orders.export` - Xuất Excel

### Module: routes (Lên tuyến)
- `routes.view` - Xem tuyến giao hàng
- `routes.assign` - Gán tài xế cho đơn
- `routes.reorder` - Sắp xếp thứ tự giao

### Module: users (Người dùng)
- `users.view` - Xem danh sách người dùng
- `users.create` - Tạo người dùng
- `users.edit` - Sửa người dùng
- `users.delete` - Xóa người dùng
- `users.manage_admins` - Quản lý tài khoản admin (chỉ superadmin)

### Module: roles (Vai trò)
- `roles.view` - Xem danh sách vai trò
- `roles.create` - Tạo vai trò mới
- `roles.edit` - Sửa vai trò
- `roles.delete` - Xóa vai trò
- `roles.assign_permissions` - Gán quyền cho vai trò

### Module: reports (Báo cáo)
- `reports.view` - Xem báo cáo
- `reports.export` - Xuất báo cáo

### Module: settings
- `settings.view` - Xem cài đặt
- `settings.edit` - Sửa cài đặt

## Default Roles

### 1. superadmin (is_system: true)
- Tất cả permissions
- Không thể xóa

### 2. admin (is_system: true)
- Tất cả permissions trừ:
  - `users.manage_admins`
  - `roles.*`

### 3. driver (is_system: true)
- `dashboard.view`
- `orders.view_own`
- `orders.change_status` (chỉ đơn được gán)
- `routes.view` (chỉ tuyến của mình)

### 4. customer (is_system: true)
- `products.view`
- `orders.view_own`
- `orders.create`

## API Changes

### Auth response includes permissions
```json
{
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "role": {
      "id": 2,
      "name": "admin",
      "display_name": "Quản lý"
    },
    "permissions": ["agents.view", "agents.create", "orders.view", ...]
  }
}
```

### Permission check middleware
```typescript
// src/lib/rbac.ts
export function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission) || user.role.name === 'superadmin';
}

export function requirePermission(...permissions: string[]) {
  return (req, res, next) => {
    const user = req.user;
    const hasAny = permissions.some(p => hasPermission(user, p));
    if (!hasAny) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    next();
  };
}
```

## UI Changes

### Admin menu - ẩn/hiện theo quyền
```tsx
const menuItems = [
  { key: '/admin', permission: 'dashboard.view', ... },
  { key: '/admin/agents', permission: 'agents.view', ... },
  // ...
].filter(item => hasPermission(user, item.permission));
```

### Admin page: Vai trò & Quyền
- `/admin/roles` - Quản lý vai trò
- Tạo/sửa vai trò với checkbox chọn permissions theo module

## Migration Steps

1. Tạo bảng `roles`, `permissions`, `role_permissions`
2. Seed default roles và permissions
3. Thêm cột `role_id` vào `drivers`, migrate data từ `role` string
4. Xóa cột `role` cũ
5. Rename `drivers` -> `users`
6. Cập nhật API auth để trả về permissions
7. Cập nhật UI check permissions
8. Tạo trang admin quản lý roles
