import { z } from "zod";

// รายชื่อหมวดหมู่ คัดลอกจาก
// https://dummyjson.com/products/category-list
export const CATEGORIES = [
    "beauty", "fragrances", "furniture", "groceries",
    "home-decoration", "kitchen-accessories", "laptops",
    "mens-shirts", "mens-shoes", "mens-watches",
    "mobile-accessories", "motorcycle", "skin-care",
    "smartphones", "sports-accessories", "sunglasses",
    "tablets", "tops", "vehicle", "womens-bags",
    "womens-dresses", "womens-jewellery", "womens-shoes", "womens-watches",
] as const;

export const ProductSchema = z.object({
    id: z.number(),
    // เติม: เงื่อนไขที่บังคับว่าข้อความต้องยาวอย่างน้อยเท่าใด
    title: z.string().trim().min(2, "กรุณากรอกชื่อสินค้า"),
    price: z.number({ error: "กรุณากรอกราคา" }).min(0, "ราคาต้องไม่ติดลบ"),
    stock: z
        .number({ error: "กรุณากรอกจำนวนคงเหลือ" })
        .int("จำนวนคงเหลือต้องเป็นจำนวนเต็ม")
        .min(0, "จำนวนคงเหลือต้องไม่ติดลบ"),
    category: z.enum(CATEGORIES, { error: "กรุณาเลือกหมวดหมู่" }),
    description: z.string().trim().optional(),
    //ตัวตรวจจับลิงก์รูปภาพ ต้องเป็นลิงก์เว็บจริงๆ (ต้องขึ้นต้นด้วย http:// หรือ https://)
    thumbnail: z.string().url(),
});

export const ProductListSchema = z.object({
    products: z.array(ProductSchema),
    total: z.number(),
    skip: z.number(),
    limit: z.number(),
});

// เติม: ตัวช่วยของ Zod ที่อ่าน Type ออกมาจาก Schema
export type Product     = z.infer<typeof ProductSchema>;
export type ProductList = z.infer<typeof ProductListSchema>;

const API_BASE = "https://dummyjson.com";

export const SORT_FIELDS = ["title", "price", "stock"] as const;

// export type SearchQuery = {
//   q: string;
//   limit: number;
//   sortBy: (typeof SORT_FIELDS)[number];
// };

export const SearchQuerySchema = z.object({
  q: z.string().trim(),
  limit: z
    .number({ error: "กรุณากรอกจำนวนรายการ" })
    .int("จำนวนรายการต้องเป็นจำนวนเต็ม")
    .min(1, "อย่างน้อย 1 รายการ")
    .max(30, "ไม่เกิน 30 รายการ"),
  sortBy: z.enum(SORT_FIELDS),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;


export const defaultQuery: SearchQuery = {
  q: "",
  limit: 10,
  sortBy: "title",
};

export function buildProductUrl(query: SearchQuery): string {
  const params = new URLSearchParams();
  params.set("q", query.q);
  // เติม: เมธอดที่กำหนดค่าให้พารามิเตอร์หนึ่งตัว
  params.set("limit", String(query.limit));
  params.set("sortBy", query.sortBy);
  params.set("order", "asc");
  // ขอข้อมูลกลับมาแค่ ชื่อสินค้า (title),
  // ราคา (price), จำนวนคงเหลือ (stock), หมวดหมู่ (category), และรูป (thumbnail) พอ ฟิลด์อื่นๆ ไม่ต้องส่งมา
  params.set("select", "title,price,stock,category,thumbnail");
  
  console.log(`เรียกข้อมูลด้วย URL: ${API_BASE}/products/search?${params.toString()}`);
  return `${API_BASE}/products/search?${params.toString()}`;
}

export async function fetchProducts(
  query: SearchQuery
): Promise<ProductList> {
    //ถ้ามี await ต้องมี async ด้วย 
  const response = await fetch(buildProductUrl(query));
  console.log("สถานะการตอบกลับ:", response);

  // เติม: ค่าที่บอกว่าสถานะการตอบกลับอยู่ในช่วง 200 ถึง 299 หรือไม่
  if (!response.ok) {
    throw new Error(`เรียกข้อมูลไม่สำเร็จ สถานะ ${response.status}`);
  }

  // เติม: เมธอดที่อ่านเนื้อหาการตอบกลับเป็น JSON
  const data = await response.json();
  console.log("ข้อมูลที่ได้รับจาก API", data);

  // เติม: เมธอดที่ตรวจข้อมูลแล้วคืนผลลัพธ์แทนการโยน Error
  const result = ProductListSchema.safeParse(data);

  if (!result.success) {
    throw new Error("รูปแบบข้อมูลที่ได้รับไม่ตรงกับที่กำหนดไว้");
  }

  return result.data;
}

// รูปภาพไม่ได้เป็นช่องที่ผู้ใช้กรอกในฟอร์มเพิ่มสินค้า จึงเป็นข้อมูลเสริมของ draft
export const ProductDraftSchema = ProductSchema.omit({ id: true, thumbnail: true }).extend({
    thumbnail: z.string().url("กรุณากรอก URL รูปภาพให้ถูกต้อง").optional(),
});

export type ProductDraft = z.infer<typeof ProductDraftSchema>;
