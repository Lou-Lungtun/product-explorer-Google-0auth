import { handlers } from "@/auth";

// ส่งคำขอ /api/auth/* เช่นเริ่ม Login และ callback จาก Google ให้ Auth.js จัดการ
export const { GET, POST } = handlers;
//รอรับคำขอจากผู้ใช้เมื่อกดปุ่ม