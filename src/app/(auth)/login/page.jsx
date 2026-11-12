import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "เข้าสู่ระบบ | Commi Backoffice",
  description: "เข้าสู่ระบบเพื่อจัดการระบบ Commi Backoffice",
};

export default function LoginPage() {
  return <AuthForm />;
}
