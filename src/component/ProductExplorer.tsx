"use client";

import { defaultQuery, fetchProducts } from "@/lib/products";
import type { Product, ProductDraft, ProductList, SearchQuery } from "@/lib/products";
import ProductSearchForm from "./ProductSearchForm";
import ProductForm from "./ProductForm";
import { useEffect, useState } from "react";

type LoadState = "idle" | "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState<LoadState>("loading");

  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
    // เติม: สิ่งที่กำหนดให้ทำงานเพียงครั้งเดียวตอนแสดงผลครั้งแรก
  }, []);


  function saveProduct(draft: ProductDraft) {
    setProducts([...products, { ...draft, id: Date.now() }]);
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
      {status === "ready" && products.length > 0 && <table><thead><tr><th>ชื่อสินค้า</th><th>ราคา</th><th>คงเหลือ</th><th>หมวดหมู่</th><th>รูปสินค้า</th></tr></thead><tbody>{products.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.price}</td><td>{item.stock}</td><td>{item.category}</td><td><img src={item.thumbnail} alt={item.title} width={100} height={100} /></td></tr>)}</tbody></table>}
    </section>
    <details className="add-product-panel">
      <summary>เพิ่มสินค้าใหม่ <span>กรอกข้อมูลสินค้าเพื่อเพิ่มเข้าร้าน</span></summary>
      <div><ProductForm editing={null} onSave={saveProduct} onCancel={() => {}} /></div>
    </details>
  </main>;
}
