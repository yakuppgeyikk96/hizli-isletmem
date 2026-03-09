import { AuthHero } from "@/components/auth/auth-hero";
import { LoginForm } from "@/components/auth/login-form";
import { AuthFooter } from "@/components/auth/auth-footer";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthHero />

      <div className="flex flex-col bg-primary-light">
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <LoginForm />
        </main>
        <AuthFooter />
      </div>
    </div>
  );
}
