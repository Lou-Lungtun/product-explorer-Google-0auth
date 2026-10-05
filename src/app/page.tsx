//ดึงฟังก์ชันตรวจสอบผู้ใช้มาจากไฟล์ auth.ts
import { auth } from "@/auth";
//ดึง Component ปุ่มล็อกอิน/ออกจากระบบมาเตรียมวางบนหน้าเว็บ
import { AuthButtons } from "./auth-buttons";
import ProductExplorer from "@/component/ProductExplorer";

export default async function Home() {
  //ตรวจสอบว่าผู้ใช้ล็อกอินหรือยังไม่ล็อกอิน
  const session = await auth();

  return (
    <div>
      <AuthButtons
      //ถ้า isLoggedIn เป็น true: ตัว <AuthButtons/> จะแปลงร่างเป็น ชื่อผู้ใช้ + ปุ่ม Logout
        isLoggedIn={Boolean(session?.user)}
      //ถ้า isLoggedIn เป็น false: ตัว <AuthButtons/> จะแปลงร่างเป็น ปุ่ม Login with Google
        userName={session?.user?.name}
      />
      {/* ProductExplorer เป็นหน้ารายการเดิม ส่วน Google login แยกอยู่ด้านบน */}
      {/* ส่งสถานะ session จาก server ให้หน้าจัดการสินค้าตัดสินใจว่าจะอนุญาตการเปลี่ยนแปลงหรือไม่ */}
      <ProductExplorer isLoggedIn={Boolean(session?.user)} />
    </div>
  );
}
