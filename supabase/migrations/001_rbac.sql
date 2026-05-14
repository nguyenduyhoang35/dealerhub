-- RBAC: Roles & Permissions System
-- Run this in Supabase SQL Editor

-- 1. Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  module VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 4. Insert default roles
INSERT INTO roles (name, display_name, description, is_system) VALUES
  ('superadmin', 'Super Admin', 'Toàn quyền hệ thống', TRUE),
  ('admin', 'Quản lý', 'Quản lý đại lý, sản phẩm, đơn hàng', TRUE),
  ('driver', 'Tài xế', 'Giao hàng và cập nhật trạng thái', TRUE),
  ('customer', 'Khách hàng', 'Đặt hàng và xem đơn hàng', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 5. Insert all permissions
INSERT INTO permissions (code, name, module) VALUES
  -- Dashboard
  ('dashboard.view', 'Xem dashboard', 'dashboard'),

  -- Agents
  ('agents.view', 'Xem đại lý', 'agents'),
  ('agents.create', 'Tạo đại lý', 'agents'),
  ('agents.edit', 'Sửa đại lý', 'agents'),
  ('agents.delete', 'Xóa đại lý', 'agents'),
  ('agents.export', 'Xuất Excel đại lý', 'agents'),

  -- Categories
  ('categories.view', 'Xem danh mục', 'categories'),
  ('categories.create', 'Tạo danh mục', 'categories'),
  ('categories.edit', 'Sửa danh mục', 'categories'),
  ('categories.delete', 'Xóa danh mục', 'categories'),

  -- Products
  ('products.view', 'Xem sản phẩm', 'products'),
  ('products.create', 'Tạo sản phẩm', 'products'),
  ('products.edit', 'Sửa sản phẩm', 'products'),
  ('products.delete', 'Xóa sản phẩm', 'products'),
  ('products.export', 'Xuất Excel sản phẩm', 'products'),

  -- Orders
  ('orders.view', 'Xem tất cả đơn hàng', 'orders'),
  ('orders.view_own', 'Xem đơn hàng của mình', 'orders'),
  ('orders.create', 'Tạo đơn hàng', 'orders'),
  ('orders.edit', 'Sửa đơn hàng', 'orders'),
  ('orders.delete', 'Xóa đơn hàng', 'orders'),
  ('orders.change_status', 'Đổi trạng thái đơn', 'orders'),
  ('orders.export', 'Xuất Excel đơn hàng', 'orders'),

  -- Routes
  ('routes.view', 'Xem tuyến giao hàng', 'routes'),
  ('routes.view_own', 'Xem tuyến của mình', 'routes'),
  ('routes.assign', 'Gán tài xế cho đơn', 'routes'),
  ('routes.reorder', 'Sắp xếp thứ tự giao', 'routes'),

  -- Users
  ('users.view', 'Xem người dùng', 'users'),
  ('users.create', 'Tạo người dùng', 'users'),
  ('users.edit', 'Sửa người dùng', 'users'),
  ('users.delete', 'Xóa người dùng', 'users'),
  ('users.manage_admins', 'Quản lý admin', 'users'),

  -- Roles
  ('roles.view', 'Xem vai trò', 'roles'),
  ('roles.create', 'Tạo vai trò', 'roles'),
  ('roles.edit', 'Sửa vai trò', 'roles'),
  ('roles.delete', 'Xóa vai trò', 'roles'),
  ('roles.assign_permissions', 'Gán quyền', 'roles'),

  -- Reports
  ('reports.view', 'Xem báo cáo', 'reports'),
  ('reports.export', 'Xuất báo cáo', 'reports'),

  -- Settings
  ('settings.view', 'Xem cài đặt', 'settings'),
  ('settings.edit', 'Sửa cài đặt', 'settings')
ON CONFLICT (code) DO NOTHING;

-- 6. Assign permissions to superadmin (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'superadmin'
ON CONFLICT DO NOTHING;

-- 7. Assign permissions to admin (all except users.manage_admins and roles.*)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.code NOT IN ('users.manage_admins', 'roles.create', 'roles.edit', 'roles.delete', 'roles.assign_permissions')
ON CONFLICT DO NOTHING;

-- 8. Assign permissions to driver
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'driver'
  AND p.code IN ('dashboard.view', 'orders.view_own', 'orders.change_status', 'routes.view_own')
ON CONFLICT DO NOTHING;

-- 9. Assign permissions to customer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'customer'
  AND p.code IN ('products.view', 'categories.view', 'orders.view_own', 'orders.create')
ON CONFLICT DO NOTHING;

-- 10. Add role_id column to drivers table
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id);

-- 10b. Add agent_id column for customers (link to agent/dealer)
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS agent_id INTEGER REFERENCES agents(id);

-- 11. Migrate existing role data
UPDATE drivers SET role_id = (SELECT id FROM roles WHERE name = 'superadmin') WHERE role = 'superadmin';
UPDATE drivers SET role_id = (SELECT id FROM roles WHERE name = 'admin') WHERE role = 'admin';
UPDATE drivers SET role_id = (SELECT id FROM roles WHERE name = 'driver') WHERE role = 'driver';
UPDATE drivers SET role_id = (SELECT id FROM roles WHERE name = 'customer') WHERE role = 'customer';

-- 12. Set default role_id for any NULL values
UPDATE drivers SET role_id = (SELECT id FROM roles WHERE name = 'customer') WHERE role_id IS NULL;

-- 13. Create indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_drivers_role_id ON drivers(role_id);
CREATE INDEX IF NOT EXISTS idx_drivers_agent_id ON drivers(agent_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);

-- 14. Rename table drivers to users
ALTER TABLE drivers RENAME TO users;

-- 15. Update foreign key references in orders table
-- (orders.user_id already references drivers, will auto-update with rename)

-- 16. Update indexes with new table name
DROP INDEX IF EXISTS idx_drivers_role_id;
DROP INDEX IF EXISTS idx_drivers_agent_id;
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_agent_id ON users(agent_id);

-- 17. Drop old role column (optional - keep for backward compatibility during transition)
-- ALTER TABLE users DROP COLUMN role;
