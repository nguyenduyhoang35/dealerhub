import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) {
  console.error("❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("🌱 Đang nạp dữ liệu mẫu...");

  // Get role IDs
  const { data: roles } = await db.from("roles").select("id, name");
  const roleMap = Object.fromEntries(roles!.map((r) => [r.name, r.id]));

  const today = new Date();
  const addDays = (n: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() + n);
    return x;
  };
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  // Categories
  const categories = [
    { name: "Mì & Thực phẩm khô", sort_order: 1 },
    { name: "Gia vị & Nước chấm", sort_order: 2 },
    { name: "Sữa & Đồ uống", sort_order: 3 },
    { name: "Bánh kẹo", sort_order: 4 },
    { name: "Đồ dùng gia đình", sort_order: 5 },
  ];

  console.log(`  + ${categories.length} danh mục`);
  const { data: catRows, error: catErr } = await db.from("categories").insert(categories).select("id, name");
  if (catErr) throw catErr;
  const catMap = Object.fromEntries(catRows!.map((c) => [c.name, c.id]));

  // Agents
  const agents = [
    { name: "Tạp hóa Cô Ba", phone: "0901111111", address: "123 Lê Lợi, Q.1, TP.HCM", note: "Khách quen, trả nhanh" },
    { name: "Cửa hàng Anh Tú", phone: "0902222222", address: "45 Trần Hưng Đạo, Q.5, TP.HCM" },
    { name: "Tạp hóa Bà Bảy", phone: "0903333333", address: "78 Nguyễn Trãi, Q.5, TP.HCM", note: "Hay nợ vài hôm" },
    { name: "Mini mart 24h", phone: "0904444444", address: "12 Cao Thắng, Q.3, TP.HCM", note: "Giao trước 8h sáng" },
    { name: "Tiệm chú Hùng", phone: "0905555555", address: "89 Võ Văn Tần, Q.3, TP.HCM" },
    { name: "Đại lý Phúc Long", phone: "0906666666", address: "200 CMT8, Q.10, TP.HCM", note: "Lấy số lượng lớn" },
    { name: "Tạp hóa Chị Lan", phone: "0907777777", address: "56 Lý Thái Tổ, Q.10, TP.HCM" },
    { name: "Cửa hàng Hồng Phát", phone: "0908888888", address: "33 Sư Vạn Hạnh, Q.10, TP.HCM" },
    { name: "Tiệm Thanh Mai", phone: "0909999999", address: "101 Lạc Long Quân, Q.11, TP.HCM" },
    { name: "Mart Bình Dân", phone: "0910101010", address: "67 Âu Cơ, Tân Bình, TP.HCM" },
  ];

  console.log(`  + ${agents.length} đại lý`);
  const { data: agentRows, error: agentErr } = await db.from("agents").insert(agents).select("id");
  if (agentErr) throw agentErr;
  const agentIds = agentRows!.map((r) => r.id);

  // Products with categories
  const products = [
    { name: "Mì tôm Hảo Hảo", unit: "thùng", price: 120000, stock: 200, category_id: catMap["Mì & Thực phẩm khô"] },
    { name: "Mì tôm Omachi", unit: "thùng", price: 180000, stock: 150, category_id: catMap["Mì & Thực phẩm khô"] },
    { name: "Phở bò Vifon", unit: "thùng", price: 150000, stock: 100, category_id: catMap["Mì & Thực phẩm khô"] },
    { name: "Cháo gà Cháo Tức Thì", unit: "thùng", price: 95000, stock: 80, category_id: catMap["Mì & Thực phẩm khô"] },
    { name: "Nước tương Maggi", unit: "chai", price: 28000, stock: 500, category_id: catMap["Gia vị & Nước chấm"] },
    { name: "Nước mắm Nam Ngư", unit: "chai", price: 45000, stock: 300, category_id: catMap["Gia vị & Nước chấm"] },
    { name: "Dầu ăn Tường An 1L", unit: "chai", price: 55000, stock: 400, category_id: catMap["Gia vị & Nước chấm"] },
    { name: "Đường cát trắng 1kg", unit: "bịch", price: 22000, stock: 600, category_id: catMap["Gia vị & Nước chấm"] },
    { name: "Bột ngọt Ajinomoto 400g", unit: "gói", price: 35000, stock: 300, category_id: catMap["Gia vị & Nước chấm"] },
    { name: "Hạt nêm Knorr 900g", unit: "gói", price: 85000, stock: 200, category_id: catMap["Gia vị & Nước chấm"] },
    { name: "Sữa Ông Thọ", unit: "thùng", price: 320000, stock: 80, category_id: catMap["Sữa & Đồ uống"] },
    { name: "Sữa Vinamilk 1L", unit: "thùng", price: 280000, stock: 90, category_id: catMap["Sữa & Đồ uống"] },
    { name: "Bia Tiger lon", unit: "thùng", price: 380000, stock: 100, category_id: catMap["Sữa & Đồ uống"] },
    { name: "Nước ngọt Coca", unit: "thùng", price: 230000, stock: 120, category_id: catMap["Sữa & Đồ uống"] },
    { name: "Nước suối Aquafina", unit: "thùng", price: 85000, stock: 150, category_id: catMap["Sữa & Đồ uống"] },
    { name: "Trà xanh Không Độ", unit: "thùng", price: 195000, stock: 80, category_id: catMap["Sữa & Đồ uống"] },
    { name: "Bánh Choco-pie", unit: "thùng", price: 280000, stock: 60, category_id: catMap["Bánh kẹo"] },
    { name: "Bánh Oreo", unit: "thùng", price: 240000, stock: 70, category_id: catMap["Bánh kẹo"] },
    { name: "Kẹo Alpenliebe", unit: "hộp", price: 65000, stock: 200, category_id: catMap["Bánh kẹo"] },
    { name: "Snack Oishi", unit: "thùng", price: 180000, stock: 90, category_id: catMap["Bánh kẹo"] },
    { name: "Kem đánh răng P/S", unit: "tuýp", price: 18000, stock: 500, category_id: catMap["Đồ dùng gia đình"] },
    { name: "Xà phòng Lifebuoy", unit: "lốc", price: 45000, stock: 300, category_id: catMap["Đồ dùng gia đình"] },
    { name: "Nước rửa chén Sunlight", unit: "chai", price: 38000, stock: 400, category_id: catMap["Đồ dùng gia đình"] },
    { name: "Bột giặt Omo 3kg", unit: "túi", price: 125000, stock: 150, category_id: catMap["Đồ dùng gia đình"] },
  ];

  console.log(`  + ${products.length} sản phẩm`);
  const { data: prodRows, error: prodErr } = await db
    .from("products")
    .insert(products)
    .select("id, price");
  if (prodErr) throw prodErr;
  const productData = prodRows!;

  // Drivers (role_id instead of role string)
  const drivers = [
    { name: "Anh Hùng", phone: "0911111111", password: "123456", vehicle_plate: "51A-12345", role_id: roleMap.driver },
    { name: "Anh Minh", phone: "0922222222", password: "123456", vehicle_plate: "51B-67890", role_id: roleMap.driver },
    { name: "Anh Tài", phone: "0933333333", password: "123456", vehicle_plate: "51C-11111", role_id: roleMap.driver },
  ];

  console.log(`  + ${drivers.length} tài xế`);
  const { data: driverRows, error: drvErr } = await db
    .from("users")
    .insert(drivers)
    .select("id");
  if (drvErr) throw drvErr;
  const driverIds = driverRows!.map((r) => r.id);

  // Customers (linked to agents, role_id instead of role string)
  const customers = agentIds.slice(0, 5).map((agentId, i) => ({
    name: `Khách hàng ${i + 1}`,
    phone: `098${i + 1}111111`,
    password: "123456",
    role_id: roleMap.customer,
    agent_id: agentId,
  }));

  console.log(`  + ${customers.length} khách hàng`);
  const { error: custErr } = await db.from("users").insert(customers);
  if (custErr) throw custErr;

  // Admin user
  const adminUser = {
    name: "Admin Kho",
    phone: "0900000001",
    password: "123456",
    role_id: roleMap.admin,
  };
  console.log(`  + 1 admin`);
  const { error: adminErr } = await db.from("users").insert(adminUser);
  if (adminErr) throw adminErr;

  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = <T>(arr: T[]) => arr[rand(0, arr.length - 1)];

  console.log(`  + Đơn hàng giả lập (3 ngày qua + hôm nay + 2 ngày tới)`);
  const orderInserts: any[] = [];
  const itemsByIdx: { product_id: number; quantity: number; price: number }[][] = [];

  for (let dayOffset = -3; dayOffset <= 2; dayOffset++) {
    const date = fmt(addDays(dayOffset));
    const numOrders = dayOffset < 0 ? rand(5, 8) : dayOffset === 0 ? 8 : rand(2, 4);

    for (let i = 0; i < numOrders; i++) {
      const used = new Set<number>();
      const items: { product_id: number; quantity: number; price: number }[] = [];
      const itemCount = rand(1, 4);
      for (let j = 0; j < itemCount; j++) {
        let p;
        do {
          p = pick(productData);
        } while (used.has(p.id));
        used.add(p.id);
        items.push({ product_id: p.id, quantity: rand(1, 5), price: p.price });
      }
      const total = items.reduce((s, it) => s + it.quantity * it.price, 0);

      let status = "pending";
      let userId: number | null = null;
      let routeOrder: number | null = null;
      let paid = 0;
      let collected = 0;
      let deliveredAt: string | null = null;

      if (dayOffset < 0) {
        if (Math.random() < 0.08) status = "cancelled";
        else {
          status = "delivered";
          userId = pick(driverIds);
          collected =
            Math.random() < 0.7 ? total : Math.floor(total * (0.4 + Math.random() * 0.5));
          paid = collected;
          deliveredAt = `${date}T${String(rand(8, 17)).padStart(2, "0")}:${String(rand(0, 59)).padStart(2, "0")}:00+07:00`;
        }
      } else if (dayOffset === 0) {
        const roll = Math.random();
        if (roll < 0.35) {
          status = "delivered";
          userId = pick(driverIds);
          routeOrder = i + 1;
          collected = total;
          paid = total;
          deliveredAt = `${date}T${String(rand(7, 11)).padStart(2, "0")}:${String(rand(0, 59)).padStart(2, "0")}:00+07:00`;
        } else if (roll < 0.6) {
          status = "delivering";
          userId = pick(driverIds);
          routeOrder = i + 1;
        } else {
          status = "pending";
          if (Math.random() < 0.7) {
            userId = pick(driverIds);
            routeOrder = i + 1;
          }
        }
      } else {
        status = "pending";
        if (Math.random() < 0.4) userId = pick(driverIds);
      }

      orderInserts.push({
        agent_id: pick(agentIds),
        user_id: userId,
        route_order: routeOrder,
        status,
        total,
        paid,
        collected_amount: collected,
        delivery_date: date,
        delivered_at: deliveredAt,
        note: Math.random() < 0.2 ? "Giao trước 10h sáng" : null,
      });
      itemsByIdx.push(items);
    }
  }

  const { data: orderRows, error: orderErr } = await db
    .from("orders")
    .insert(orderInserts)
    .select("id");
  if (orderErr) throw orderErr;

  const allItems = orderRows!.flatMap((row, i) =>
    itemsByIdx[i].map((it) => ({ ...it, order_id: row.id }))
  );
  const { error: itemsErr } = await db.from("order_items").insert(allItems);
  if (itemsErr) throw itemsErr;

  console.log(`  + ${orderRows!.length} đơn hàng, ${allItems.length} item`);

  console.log("\n✅ Xong! Đăng nhập:");
  console.log("   • Super Admin: 0900000000 / 123456");
  console.log("   • Admin:       0900000001 / 123456");
  console.log("   • Tài xế:      0911111111 / 123456");
  console.log("   • Khách hàng:  0981111111 / 123456");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
