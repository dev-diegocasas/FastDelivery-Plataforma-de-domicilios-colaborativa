import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row">
      {/* Brand panel — solo desktop */}
      <aside className="hidden lg:flex lg:w-[45%] xl:w-[40%] h-screen bg-gradient-to-br from-primary/70 via-primary/50 to-primary/30 flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Top */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[36px] text-white">
              local_shipping
            </span>
            <span className="text-headline-lg font-bold text-white tracking-tight font-headline-lg">
              FastDelivery
            </span>
          </Link>
        </div>

        {/* Center */}
        <div className="relative z-10 text-center -mt-16">
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Domicilios rápidos <br />y seguros
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-sm mx-auto leading-relaxed">
            Conectamos clientes, restaurantes y repartidores en un ecosistema
            colaborativo.
          </p>
          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-sm text-white/60 mt-1">Roles</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10+</p>
              <p className="text-sm text-white/60 mt-1">Categorías</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">6</p>
              <p className="text-sm text-white/60 mt-1">Estados</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-sm text-white/40 text-center">
            &copy; {new Date().getFullYear()} FastDelivery
          </p>
        </div>
      </aside>

      {/* Right panel — form centrado */}
      <div className="flex-1 flex flex-col lg:h-screen">
        {/* Header solo visible en móvil (en desktop el logo está en panel izquierdo) */}
        <header className="w-full h-16 flex items-center px-4 sm:px-6 bg-surface z-50 border-b border-outline-variant shrink-0 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">
              local_shipping
            </span>
            <span className="text-headline-lg font-bold text-primary tracking-tight font-headline-lg">
              FastDelivery
            </span>
          </Link>
        </header>

        {/* Form centrado, sin scroll en desktop */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:px-10 xl:px-12">
          <div className="w-full max-w-[460px] lg:max-w-[520px] flex items-center justify-center">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
