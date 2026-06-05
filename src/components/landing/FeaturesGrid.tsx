const features = [
  {
    icon: "enhanced_encryption",
    title: "Token único de compra",
    description:
      "Cada pedido genera un token de seguridad que el repartidor debe validar para completar la entrega.",
  },
  {
    icon: "track_changes",
    title: "Tracking en tiempo real",
    description:
      "Sigue tu pedido desde que el restaurante lo acepta hasta que el repartidor lo entrega en tu puerta.",
  },
  {
    icon: "notifications_active",
    title: "Notificaciones automáticas",
    description:
      "Recibe alertas al instante sobre cada cambio de estado de tu pedido: aceptado, pagado, en camino, entregado.",
  },
  {
    icon: "verified_user",
    title: "Verificación de identidad",
    description:
      "Registro seguro con verificación de correo electrónico. Solo usuarios verificados pueden hacer pedidos.",
  },
  {
    icon: "credit_score",
    title: "Pagos seguros",
    description:
      "El pago solo se habilita después de que el restaurante acepta tu pedido. Sin cargos anticipados.",
  },
  {
    icon: "star_rate",
    title: "Calificaciones y reseñas",
    description:
      "Califica tus pedidos y comparte tu experiencia. Ayuda a otros a elegir los mejores lugares.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-surface-container-low/50">
      <div className="mx-auto w-full max-w-container-max-width px-4 sm:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
            ¿Por qué FastDelivery?
          </h2>
          <p className="mt-3 text-body-lg text-secondary font-body-lg max-w-2xl mx-auto">
            Una plataforma completa diseñada para que cada entrega sea rápida,
            segura y sin complicaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 sm:p-8 space-y-4 transition-shadow hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-primary">
                  {f.icon}
                </span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface">
                {f.title}
              </h3>
              <p className="text-body-md text-secondary font-body-md leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
