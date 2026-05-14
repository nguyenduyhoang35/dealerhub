import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const db = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // Get existing categories
  const { data: allCats } = await db.from("categories").select("id, name");
  const catMap: Record<string, number> = {};
  allCats?.forEach((c: any) => catMap[c.name] = c.id);
  console.log("Category map:", catMap);

  // Update products with null category_id
  const { data: nullProducts } = await db.from("products").select("id, name").is("category_id", null);
  console.log("Products with null category:", nullProducts?.length);

  if (nullProducts && nullProducts.length > 0) {
    for (const p of nullProducts) {
      let catId = null;
      const name = p.name.toLowerCase();
      
      if (name.includes("coca") || name.includes("pepsi") || name.includes("7up") || 
          name.includes("fanta") || name.includes("sprite") || name.includes("trà") || 
          name.includes("nước") || name.includes("red bull") || name.includes("sữa") || 
          name.includes("milo") || name.includes("ovaltine") || name.includes("yakult") ||
          name.includes("dutch lady") || name.includes("vinamilk") || name.includes("fami")) {
        catId = catMap["Sữa & Đồ uống"];
      } else if (name.includes("mì") || name.includes("phở") || name.includes("hủ tiếu")) {
        catId = catMap["Mì & Thực phẩm khô"];
      } else if (name.includes("bánh") || name.includes("kẹo") || name.includes("snack")) {
        catId = catMap["Bánh kẹo"];
      } else if (name.includes("nước mắm") || name.includes("dầu ăn") || name.includes("bột ngọt") || 
                 name.includes("hạt nêm") || name.includes("muối")) {
        catId = catMap["Gia vị & Nước chấm"];
      }
      
      if (catId) {
        await db.from("products").update({ category_id: catId }).eq("id", p.id);
        console.log(`Updated ${p.name} -> category ${catId}`);
      }
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

seed();
