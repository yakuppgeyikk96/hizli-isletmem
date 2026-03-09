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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-16 left-10 right-10 text-center">
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
