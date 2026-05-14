# DealerHub

Hệ thống quản lý giao hàng đại lý - Vietnamese SMB delivery management system.

## Tính năng

### Dành cho Đại lý (Customer)
- Đặt hàng online - duyệt sản phẩm, thêm vào giỏ hàng
- Đặt hàng theo Excel - tải mẫu, điền số lượng, upload
- Theo dõi đơn hàng và trạng thái giao hàng
- Quản lý công nợ minh bạch
- Thanh toán QR Bank Transfer (VietQR) - tự động ghi nhận

### Dành cho Admin
- Quản lý đại lý (agents)
- Quản lý sản phẩm và danh mục
- Quản lý đơn hàng, gán tài xế
- Lên tuyến giao hàng (drag & drop)
- Quản lý tài khoản và phân quyền
- Xuất Excel (đơn hàng, phiếu giao hàng)

### Dành cho Tài xế (Driver)
- Xem tuyến giao hàng được gán
- Cập nhật trạng thái đơn (đang giao, đã giao)
- Ghi nhận số tiền thu được

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Runtime | Node.js 24 LTS |
| UI | React 19, Ant Design 6 |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL) |
| State | TanStack Query |
| Auth | Custom PIN + Cookie Session |
| Excel | ExcelJS |
| Payment | VietQR + SePay (webhook) |

## Cài đặt

### Yêu cầu
- Node.js 20+
- pnpm 9+
- Supabase project

### Setup

```bash
# Clone repo
git clone <repo-url>
cd dealerhub

# Cài đặt dependencies
pnpm install

# Copy env file
cp .env.example .env.local

# Điền thông tin Supabase vào .env.local
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=

# Chạy seed data (optional)
pnpm seed

# Chạy dev server
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Chạy development server |
| `pnpm build` | Build production |
| `pnpm start` | Chạy production server |
| `pnpm seed` | Seed dữ liệu mẫu |
| `pnpm seed:reset` | Reset và seed lại dữ liệu |

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (site)/          # Customer pages
│   │   ├── page.tsx     # Landing page
│   │   ├── products/    # Sản phẩm & giỏ hàng
│   │   ├── orders/      # Đơn hàng
│   │   └── debt/        # Công nợ
│   ├── admin/           # Admin pages
│   │   ├── agents/      # Quản lý đại lý
│   │   ├── products/    # Quản lý sản phẩm
│   │   ├── orders/      # Quản lý đơn hàng
│   │   ├── routes/      # Lên tuyến
│   │   └── users/       # Quản lý tài khoản
│   ├── my-route/        # Driver mobile flow
│   ├── api/             # API routes
│   └── login/           # Đăng nhập
├── components/          # Shared components
├── hooks/               # React hooks (TanStack Query)
└── lib/                 # Utilities (auth, db, format)
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Payment (SePay + VietQR)
SEPAY_BANK_ID=MB                    # MB, VCB, TCB, ACB, TPB, VPB, BIDV...
SEPAY_ACCOUNT_NUMBER=0123456789     # Số tài khoản nhận tiền
SEPAY_ACCOUNT_NAME=NGUYEN VAN A     # Tên chủ tài khoản
SEPAY_API_KEY=                      # API key từ my.sepay.vn (để xác thực webhook)
```

## Tài khoản mẫu

Sau khi chạy `pnpm seed`:

| Role | Phone | PIN |
|------|-------|-----|
| Admin | 0901234567 | 1234 |
| Driver | 0912345678 | 1234 |

## License

Private - All rights reserved.
