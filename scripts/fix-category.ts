import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const db = createClient(supabaseUrl, supabaseKey);

async function fix() {
  // Fix nước mắm -> Gia vị
  await db.from("products").update({ category_id: 12 }).ilike("name", "%nước mắm%");
  console.log("Fixed nước mắm products");
  process.exit(0);
}

fix();
