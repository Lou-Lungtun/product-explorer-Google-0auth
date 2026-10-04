"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CATEGORIES, ProductDraftSchema } from "@/lib/products";
import type { Product, ProductDraft } from "@/lib/products";

//ส่วนการรับคำสั่งจากภายนอก
//(แก้ไข): รับข้อมูลสินค้าเดิมเข้ามา ถ้ามีค่าเข้ามาแสดงว่าอยู่ในโหมดแก้ไข
// แต่ถ้าเป็น null คือโหมดเพิ่มสินค้าใหม่
type ProductFormProps = {
  editing: Product | null;
  //(บันทึก): ฟังก์ชันส่งข้อมูลที่กรอกเสร็จกลับไปบันทึกที่หน้าหลัก
  onSave: (draft: ProductDraft) => void;
  //(ยกเลิก): ฟังก์ชันแจ้งหน้าหลักเมื่อผู้ใช้กดยกเลิก
  onCancel: () => void
};

//เรียกใช้เครื่องมือ useForm จาก React Hook Form ร่วมกับ zodResolver เพื่อใช้จัดการแบบฟอร์มและการตรวจสอบความถูกต้องของข้อมูล
export default function ProductForm({ editing, onSave, onCancel }: ProductFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductDraft>({
    resolver: zodResolver(ProductDraftSchema), mode: "onChange",

    //ส่วนดึงค่าเดิมมาแสดงในฟอร์ม (แก้ไข)
    //การทำงาน: ถ้ามีค่า editing ส่งเข้ามา ให้เอาชื่อ ราคา สต็อก และหมวดหมู่เดิมไปหยอดใส่ช่องกรอกทันทีเพื่อให้ผู้ใช้แก้ไขได้
    defaultValues: editing ? { title: editing.title, price: editing.price, stock: editing.stock, category: editing.category } :
    { title: "", price: undefined, stock: undefined }
  });

  //ส่วนการสั่งบันทึกข้อมูล (บันทึก)
  // ผ่านการตรวจ (Zod) แล้วส่งค่าไป onSave() เพื่อบันทึก พร้อมสั่ง reset() ล้างฟอร์ม
  function saveProduct(values: ProductDraft) { onSave(values); reset(); }

  // เมื่อส่งฟอร์ม handleSubmit จะตรวจค่าด้วย Zod ก่อนเรียก saveProduct
  return <form onSubmit={handleSubmit(saveProduct)} noValidate>
    <label htmlFor="title">ชื่อสินค้า</label><input id="title" required {...register("title")} aria-invalid={!!errors.title} aria-describedby="title-error" /><span id="title-error" role="alert">{errors.title?.message}</span>
    <label htmlFor="price">ราคา</label><input id="price" type="number" step="0.01" required {...register("price", { valueAsNumber: true })} aria-invalid={!!errors.price} aria-describedby="price-error" /><span id="price-error" role="alert">{errors.price?.message}</span>
    <label htmlFor="stock">จำนวนคงเหลือ</label><input id="stock" type="number" required {...register("stock", { valueAsNumber: true })} aria-invalid={!!errors.stock} aria-describedby="stock-error" /><span id="stock-error" role="alert">{errors.stock?.message}</span>
    <label htmlFor="category">หมวดหมู่</label><select id="category" required {...register("category")} aria-invalid={!!errors.category} aria-describedby="category-error"><option value="">กรุณาเลือกหมวดหมู่</option>{CATEGORIES.map((name) => <option key={name} value={name}>{name}</option>)}</select><span id="category-error" role="alert">{errors.category?.message}</span>
    {/* บันทึก: ปุ่มนี้ส่งฟอร์มให้ handleSubmit ตรวจด้วย Zod แล้วส่งค่าที่ผ่านไปยัง saveProduct */}
    <button type="submit">{editing ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}</button>
    {/* ยกเลิก: ปุ่มนี้เรียก onCancel เพื่อให้ Parent ล้างรายการที่กำลังแก้ โดยไม่บันทึก */}
    {editing && <button type="button" onClick={onCancel}>ยกเลิก</button>}
  </form>;
}
