import { AuthHero } from "@/components/auth/auth-hero";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthFooter } from "@/components/auth/auth-footer";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthHero />

      <div className="relative flex flex-col bg-primary-light">
        <div className="absolute right-4 top-4 z-10">
          <LanguageSwitcher />
        </div>
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <RegisterForm />
        </main>
        <AuthFooter />
      </div>
    </div>
  );
}
