//ฟังก์ชันสำเร็จรูปจาก Auth.js ใช้สั่งเริ่มเข้าสู่ระบบ หรือสั่งออกจากระบบ
import { signIn, signOut } from "@/auth";

//กำหนดชนิดข้อมูลที่หน้านี้ต้องการ
type AuthButtonsProps = {
  isLoggedIn: boolean;
  //ชื่อของคนที่ล็อกอิน (จะมีหรือไม่มีก็ได้)
  userName?: string | null;
};

export function AuthButtons({ isLoggedIn, userName }: AuthButtonsProps) {
  if (isLoggedIn) {
    //เมื่อผู้ใช้ล็อกอินแล้ว ให้แสดงปุ่ม Logout และข้อความต้อนรับ
    return (
      <div className="auth-toolbar">
        <span className="auth-greeting">
          <span className="auth-status-dot" aria-hidden="true" />
          สวัสดี {userName ?? "ผู้ใช้งาน"}
        </span>
        <form
          action={async () => {
            "use server";
            // คำขอ Logout วิ่งจากฟอร์มไปยัง Server Action แล้ว Auth.js ลบ session cookie
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="auth-button auth-logout-button" type="submit">
            Logout
          </button>
        </form>
      </div>
    );
  }
  //เมื่อผู้ใช้ยังไม่ได้ล็อกอิน ให้แสดงปุ่ม Login with Google
  return (
    <div className="auth-toolbar">
      <form
        action={async () => {
          "use server";
          //เมื่อกดปุ่ม "Login with Google" คำสั่งนี้จะบอกให้ Server พาเบราว์เซอร์วิ่งไปหน้าล็อกอินของ Google
          await signIn("google", { redirectTo: "/" });
          //{ redirectTo: "/" } ระบุว่าหลังจากล็อกอินที่ Google เสร็จเรียบร้อยแล้ว ให้พากลับมาที่หน้าแรก (/) ของเว็บเรา
        }}
      >
        <button className="auth-button auth-login-button" type="submit">
          <span className="google-mark" aria-hidden="true">G</span>
          Login with Google
        </button>
      </form>
    </div>
  );
}
