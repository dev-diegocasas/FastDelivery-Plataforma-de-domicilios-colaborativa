export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full h-16 flex items-center px-8 bg-surface z-50 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[32px]">
            local_shipping
          </span>
          <span className="text-headline-lg font-bold text-primary tracking-tight font-headline-lg">
            FastDelivery
          </span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
