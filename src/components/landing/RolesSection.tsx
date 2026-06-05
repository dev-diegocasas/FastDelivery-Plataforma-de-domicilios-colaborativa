const roles = [
  {
    icon: "person",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary",
    title: "Cliente",
    description:
      "Explora restaurantes, arma tu pedido, paga de forma segura y sigue tu entrega en tiempo real.",
    items: [
      "Explorar restaurantes por categoría",
      "Agregar platos al carrito",
      "Pagar con tarjeta o PSE",
      "Tracking en vivo del repartidor",
      "Calificar y reseñar pedidos",
    ],
    action: "/registro",
    actionLabel: "Quiero pedir",
  },
  {
    icon: "store",
    iconBg: "bg-secondary-container/20",
    iconColor: "text-secondary",
    title: "Administrador",
    description:
      "Gestiona tu restaurante, publica tu menú y recibe pedidos directamente desde la plataforma.",
    items: [
      "Registrar y editar tu restaurante",
      "CRUD completo de platos",
      "Aceptar o rechazar pedidos",
      "Dashboard con KPIs y estadísticas",
      "Gestionar disponibilidad",
    ],
    action: "/registro",
    actionLabel: "Quiero vender",
  },
  {
    icon: "motorcycle",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary",
    title: "Repartidor",
    description:
      "Encuentra pedidos disponibles, acepta entregas y gana por cada pedido completado exitosamente.",
    items: [
      "Ver pedidos disponibles en tu zona",
      "Aceptar o rechazar entregas",
      "Validar entrega con token de compra",
      "Historial de entregas realizadas",
      "Control de disponibilidad",
    ],
    action: "/registro",
    actionLabel: "Quiero repartir",
  },
];

export default function RolesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-container-max-width px-4 sm:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
            Para todos los roles
          </h2>
          <p className="mt-3 text-body-lg text-secondary font-body-lg max-w-2xl mx-auto">
            FastDelivery conecta a tres actores clave en un ecosistema
            colaborativo. Cada uno con su propio panel y herramientas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((role) => (
            <div
              key={role.title}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 sm:p-8 flex flex-col transition-shadow hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${role.iconBg}`}
                >
                  <span
                    className={`material-symbols-outlined text-[32px] ${role.iconColor}`}
                  >
                    {role.icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-headline-md font-bold text-on-surface">
                    {role.title}
                  </h3>
                  <p className="text-body-sm text-secondary font-body-sm">
                    {role.description}
                  </p>
                </div>
              </div>

              {/* Features list */}
              <ul className="space-y-3 flex-1">
                {role.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-body-md text-on-surface font-body-md"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${role.iconColor}`}
                    >
                      check
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
