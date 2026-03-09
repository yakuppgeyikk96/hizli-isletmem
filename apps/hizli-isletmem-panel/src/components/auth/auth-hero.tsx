import Image from "next/image";

export function AuthHero() {
  return (
    <aside className="relative hidden h-full min-h-screen lg:block" aria-hidden="true">
      <Image
        src="/images/login-page-img.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-4xl font-bold tracking-tight text-white xl:text-5xl">
          Hızlı İşletmem
        </p>
        <p className="mt-2 text-lg text-white/80">
          Verimlilik İşinizi Büyütün
        </p>
      </div>
    </aside>
  );
}
