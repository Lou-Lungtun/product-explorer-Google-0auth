# อธิบายระบบล็อกอินด้วย Google

เอกสารนี้สรุปไฟล์ที่เกี่ยวกับ Google login ในโปรเจกต์ `product-explorer` เพื่อใช้อ่านทบทวนและอธิบายการทำงาน

## ภาพรวมการทำงาน

```text
ผู้ใช้กด Login with Google
        ↓
Server Action เรียก Auth.js
        ↓
เบราว์เซอร์ไปเข้าสู่ระบบที่ Google
        ↓
Google ส่งผู้ใช้กลับมาที่ /api/auth/callback/google
        ↓
Auth.js ตรวจสอบผลและสร้าง session cookie
        ↓
หน้าแรกอ่าน session แล้วแสดงชื่อผู้ใช้และปุ่ม Logout
```

## 1. ตั้งค่า Auth.js และ Google provider

**ไฟล์:** `src/auth.ts`

ไฟล์นี้เป็นจุดตั้งค่าหลักของระบบยืนยันตัวตน โดยกำหนดให้ Google เป็นผู้ให้บริการล็อกอิน

- `Google` คือ provider ที่ใช้เชื่อมต่อกับ Google
- `providers: [Google]` บอก Auth.js ว่าโปรเจกต์นี้อนุญาตให้ล็อกอินผ่าน Google
- `handlers` ใช้รับคำขอจากเส้นทาง API
- `signIn` และ `signOut` ใช้เริ่มล็อกอินและออกจากระบบ
- `auth` ใช้อ่าน session ของผู้ใช้บน server

รหัส Client ID และ Client Secret อ่านจาก `.env.local` ฝั่ง server จึงไม่ควรนำ Secret ไปใส่ในโค้ดหน้าเว็บหรือส่งให้ browser

## 2. รับคำขอ Login และ callback จาก Google

**ไฟล์:** `src/app/api/auth/[...nextauth]/route.ts`

ไฟล์นี้เชื่อมเส้นทาง `/api/auth/*` เข้ากับ handlers ของ Auth.js เช่น การเริ่มล็อกอินและการรับ callback หลัง Google ตรวจสอบผู้ใช้แล้ว

หลังผู้ใช้ยืนยันตัวตนที่ Google แล้ว Google จะส่ง browser กลับมายัง callback ของแอปที่:

```text
/api/auth/callback/google
```

Auth.js ใช้ข้อมูล callback ตรวจสอบการล็อกอิน จากนั้นจัดการ session ให้แอป

## 3. ปุ่ม Login และ Logout

**ไฟล์:** `src/app/auth-buttons.tsx`

Component นี้เลือกแสดงปุ่มตามสถานะผู้ใช้:

- ถ้ายังไม่ล็อกอิน ฟอร์มจะเรียก `signIn("google")` ผ่าน Server Action แล้ว Auth.js พา browser ไป Google
- ถ้าล็อกอินแล้ว จะแสดงชื่อผู้ใช้และปุ่ม Logout
- เมื่อกด Logout ฟอร์มเรียก `signOut()` ให้ Auth.js ยกเลิก session แล้วกลับหน้าแรก

Server Action ทำให้การเริ่มและจบการล็อกอินถูกเรียกผ่าน server โดยตรง

## 4. อ่าน session และแสดงปุ่มบนหน้าแรก

**ไฟล์:** `src/app/page.tsx`

หน้าแรกเรียก `auth()` บน server เพื่อดูว่ามีผู้ใช้ล็อกอินอยู่หรือไม่ แล้วส่งสถานะและชื่อไปให้ `AuthButtons` แสดงผล

`ProductExplorer` ยังคงแสดงรายการสินค้าเดิม โดยวางไว้ต่อจากปุ่ม Login

## 5. ตั้งค่าความลับและ URL ในเครื่อง

**ไฟล์:** `.env.local` ที่โฟลเดอร์หลักของ `product-explorer` (ระดับเดียวกับ `package.json`)

ไฟล์นี้เก็บค่าที่ Auth.js ต้องใช้:

- `AUTH_SECRET` ใช้ปกป้องข้อมูล session
- `AUTH_GOOGLE_ID` และ `AUTH_GOOGLE_SECRET` ใช้ยืนยันแอปกับ Google

ใน Google Cloud Console ต้องตั้ง Authorized redirect URI ให้ตรงกับ:

```text
http://localhost:3000/api/auth/callback/google
```

ห้าม commit `.env.local` ขึ้น Git หรือเปิดเผยค่า Client Secret

## อธิบายสั้น ๆ ให้อาจารย์ฟัง

> โปรเจกต์นี้ใช้ Auth.js เชื่อม Google OAuth โดยตั้ง Google provider ไว้ใน `auth.ts` และเปิด Route Handler สำหรับรับคำขอ login กับ callback ปุ่ม Login เรียก Server Action ให้ Auth.js พาผู้ใช้ไป Google เมื่อ Google ยืนยันตัวตนแล้ว Auth.js สร้าง session cookie จากนั้นหน้าแรกอ่าน session ด้วย `auth()` เพื่อแสดงชื่อผู้ใช้และปุ่ม Logout

## ขอบเขตของส่วนนี้

โค้ดที่เพิ่มมาทำหน้าที่ล็อกอินและออกจากระบบ พร้อมแสดงสถานะผู้ใช้เท่านั้น ยังไม่ได้ใช้ session เพื่อจำกัดสิทธิ์การแก้ไขหรือลบสินค้า
