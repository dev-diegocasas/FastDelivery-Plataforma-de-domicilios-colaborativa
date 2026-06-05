import Link from "next/link";
import Button from "@/components/ui/Button";

const footerLinks = [
  {
    title: "FastDelivery",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Cómo funciona", href: "/#como-funciona" },
      { label: "Crear cuenta", href: "/registro" },
      { label: "Iniciar sesión", href: "/login" },
    ],
  },
  {
    title: "Información",
    links: [
      { label: "Términos y condiciones", href: "/" },
      { label: "Política de privacidad", href: "/" },
      { label: "Contacto", href: "/" },
    ],
  },
];

export default function CTASection() {
  return (
    <>
      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background to-primary-container/5">
        <div className="mx-auto w-full max-w-container-max-width px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-[48px] sm:text-[56px] text-primary block mb-4">
              local_shipping
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
              ¿Listo para empezar?
            </h2>
            <p className="mt-3 text-body-lg sm:text-headline-md text-secondary font-body-lg leading-relaxed">
              Únete a FastDelivery hoy y descubre lo fácil que es pedir, vender
              o repartir. Sin compromisos, sin complicaciones.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/registro">
                <Button size="lg">
                  <span className="material-symbols-outlined text-[20px]">
                    person_add
                  </span>
                  Crear cuenta gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  <span className="material-symbols-outlined text-[20px]">
                    login
                  </span>
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer elaborado */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant">
        <div className="mx-auto w-full max-w-container-max-width px-4 sm:px-8 py-12 sm:py-16">
          {/* Grid de enlaces */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[28px]">
                  local_shipping
                </span>
                <span className="text-headline-lg font-bold text-primary tracking-tight font-headline-lg">
                  FastDelivery
                </span>
              </Link>
              <p className="text-body-md text-secondary font-body-md leading-relaxed max-w-sm">
                Conectamos clientes, restaurantes y repartidores en un
                ecosistema colaborativo para la gestión completa de pedidos a
                domicilio.
              </p>
            </div>

            {/* Link columns */}
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="text-label-md text-on-surface font-label-md uppercase tracking-wider mb-4">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-body-md text-secondary font-body-md hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Separador */}
          <div className="mt-12 pt-8 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-body-sm text-secondary font-body-sm">
              &copy; {new Date().getFullYear()} FastDelivery. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-body-sm text-secondary font-body-sm hover:text-primary cursor-pointer transition-colors">
                Términos y condiciones
              </span>
              <span className="text-body-sm text-secondary font-body-sm hover:text-primary cursor-pointer transition-colors">
                Política de privacidad
              </span>
              <span className="text-body-sm text-secondary font-body-sm hover:text-primary cursor-pointer transition-colors">
                Contacto
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
