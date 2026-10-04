//นำเข้าระบบล็อกอินสำเร็จรูป Auth.js
import NextAuth from "next-auth";
//คือปลั๊กอินสำเร็จรูปสำหรับเชื่อมต่อกับบัญชี Google
import Google from "next-auth/providers/google";

//ฝั่ง server; ไปอ่านไฟล์ .env.local
//เพื่อ "ใช้ยืนยันตัวตนระหว่างเว็บของเรากับ Google" และ "รักษาความปลอดภัยของระบบ"
export const { handlers, auth, signIn, signOut } = NextAuth({
  // providers กำหนดว่าผู้ใช้จะยืนยันตัวตนผ่านบริการใด
  providers: [Google],
});
