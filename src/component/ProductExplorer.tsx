"use client";

import { defaultQuery, fetchProducts } from "@/lib/products";
import type { Product, ProductDraft, ProductList, SearchQuery } from "@/lib/products";
import ProductSearchForm from "./ProductSearchForm";
import ProductForm from "./ProductForm";
import { useEffect, useRef, useState } from "react";

type LoadState = "idle" | "loading" | "error" | "ready";

type ProductExplorerProps = {
  isLoggedIn: boolean;
};

export default function ProductExplorer({ isLoggedIn }: ProductExplorerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState<LoadState>("loading");
  const productFormPanel = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
    // เติม: สิ่งที่กำหนดให้ทำงานเพียงครั้งเดียวตอนแสดงผลครั้งแรก
  }, []);


  // บันทึก: ถ้าเป็นแก้ไข จะ map หา id เดิมแล้วแทนที่ด้วยค่าใหม่
  // ถ้าเป็นเพิ่มใหม่ จะคัดลอกรายการเดิมทั้งหมดแล้วนำชิ้นใหม่ไปต่อท้าย
  function saveProduct(draft: ProductDraft) {
    // เพิ่ม/บันทึกสินค้าได้เฉพาะเมื่อหน้า server ส่งสถานะว่าผู้ใช้ล็อกอินแล้ว
    if (!isLoggedIn) return;

    if (editingProduct) {
      setProducts((current) => current.map((product) => product.id === editingProduct.id
        ? { ...product, ...draft }
        : product));
      setEditingProduct(null);
      return;
    }

    setProducts((current) => [...current, {
      ...draft,
      id: Date.now(),
      thumbnail: draft.thumbnail ?? "https://placehold.co/400x300?text=No+image",
    }]);
  }

  // ลบ: ใช้ filter คัดเลือกเฉพาะสินค้าที่ id ไม่ตรงกับตัวที่เลือกเก็บไว้ ส่วนชิ้นที่ id ตรงกันจะถูกตัดออกไป
  function removeProduct(id: number) {
    // ตรวจซ้ำใน handler ด้วย เผื่อมีการเรียกฟังก์ชันโดยตรงจากหน้าเว็บ
    if (!isLoggedIn) return;

    setProducts((current) => current.filter((product) => product.id !== id));
    setEditingProduct((current) => current?.id === id ? null : current);
  }

  // แก้ไข: รับข้อมูลแถวนั้นไปเก็บใน editingProduct
  // เพื่อเปิดแผงฟอร์มและดึงค่าเดิม (ชื่อ, ราคา ฯลฯ) มาแสดงทันที
  function editProduct(product: Product) {
    setEditingProduct(product);
    if (productFormPanel.current) productFormPanel.current.open = true;
  }

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
    console.log(`พบ ${list.total} รายการ`, list.products);
  }

  function showError(error: unknown) {
    setErrorMessage(error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ");
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");
    try { showResult(await fetchProducts(query)); } catch (error) { showError(error); }
  }

  return <main>
    <h1>รายการสินค้า</h1>
    <button type="button" onClick={() => loadProducts(defaultQuery)} disabled={status === "loading"}>{status === "loading" ? "กำลังโหลด" : "โหลดข้อมูล"}</button>
    <ProductSearchForm onSearch={loadProducts} />
    <section aria-live="polite">
      {status === "idle" && <p>คลิกปุ่มโหลดข้อมูลเพื่อเริ่ม</p>}
      {status === "loading" && <p>กำลังโหลดข้อมูล</p>}
      {status === "error" && <p role="alert">{errorMessage}</p>}
      {status === "ready" && products.length === 0 && <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>}
      {status === "ready" && products.length > 0 && <table><thead><tr><th>ชื่อสินค้า</th><th>ราคา</th><th>คงเหลือ</th><th>หมวดหมู่</th><th>รูปสินค้า</th>{isLoggedIn && <th>จัดการ</th>}</tr></thead><tbody>{products.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.price}</td><td>{item.stock}</td><td>{item.category}</td><td><img src={item.thumbnail} alt={item.title} width={100} height={100} /></td>{isLoggedIn && <td>
        {/* แสดงปุ่มจัดการสินค้าเฉพาะผู้ที่ล็อกอินแล้ว */}
        <div className="product-actions">
          {/* แก้ไข: ส่ง item ของแถวนี้ให้ editProduct; ข้อมูลจะไปที่ ProductForm ผ่าน prop editing */}
          <button className="edit-button" type="button" onClick={() => editProduct(item)}>แก้ไข</button>
          {/* ลบ: ส่ง id ของแถวนี้ให้ removeProduct เพื่อกรองสินค้านี้ออกจาก state products */}
          {/* ปิดปุ่มลบเมื่อยังไม่ล็อกอิน และ handler ด้านบนตรวจซ้ำก่อนลบข้อมูล */}
          <button className="delete-button" type="button" onClick={() => removeProduct(item.id)} disabled={!isLoggedIn} title={!isLoggedIn ? "เข้าสู่ระบบก่อนจึงจะลบสินค้าได้" : undefined}>ลบ</button>
        </div></td>}
      </tr>)}</tbody></table>}
    </section>
    {/* แสดงฟอร์มเพิ่ม/แก้ไขเฉพาะผู้ล็อกอิน; หากยังไม่ล็อกอินแสดงคำแนะนำแทน */}
    {/* เช็กว่าถ้าล็อกอินแล้ว ให้แสดงกล่องฟอร์ม */}
    {isLoggedIn ? <details className="add-product-panel" ref={productFormPanel}>
      <summary>{editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}<span>{editingProduct ? `กำลังแก้ไข: ${editingProduct.title}` : "กรอกข้อมูลสินค้าเพื่อเพิ่มเข้าร้าน"}</span></summary>
      {/* แก้ไข: ส่งสินค้าเข้า ProductForm ทาง prop editing; เปลี่ยน key ตาม id เพื่อสร้างฟอร์มใหม่และโหลดค่า defaultValues ของแถวนั้น */}
      {/* ยกเลิก: callback นี้ล้าง editingProduct ใน Parent ให้ ProductForm กลับไปโหมดเพิ่มสินค้า */}
      <div><ProductForm key={editingProduct?.id ?? "new-product"} editing={editingProduct} onSave={saveProduct} onCancel={() => setEditingProduct(null)} /></div>
      {/* ถ้ายังไม่ล็อกอิน ให้ซ่อนกล่องฟอร์มทิ้ง แล้วแสดงข้อความแจ้งเตือนนี้แทนครับ */}
    </details> : <p className="add-product-auth-note">เข้าสู่ระบบด้วย Google ก่อนจึงจะเพิ่มสินค้าได้</p>}
  </main>;
}
