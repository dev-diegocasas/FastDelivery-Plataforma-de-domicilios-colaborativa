const steps = [
  {
    number: "1",
    icon: "smartphone",
    title: "Pide",
    description:
      "Explora restaurantes, elige tus platos favoritos y haz tu pedido en segundos.",
    color: "text-primary bg-primary-container/20",
  },
  {
    number: "2",
    icon: "restaurant_menu",
    title: "Prepara",
    description:
      "El restaurante recibe tu pedido, lo acepta y comienza a prepararlo con los mejores ingredientes.",
    color: "text-secondary bg-secondary-container/20",
  },
  {
    number: "3",
    icon: "motorcycle",
    title: "Recibe",
    description:
      "Un repartidor recoge tu pedido y lo lleva hasta tu puerta. Rastreo en tiempo real.",
    color: "text-primary bg-primary-container/20",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-container-max-width px-4 sm:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
            ¿Cómo funciona?
          </h2>
          <p className="mt-3 text-body-lg text-secondary font-body-lg max-w-2xl mx-auto">
            Tres simples pasos para disfrutar tu comida favorita desde la
            comodidad de tu hogar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
          {steps.map((step, i) => (
            <div key={step.number} className="flex flex-col items-center text-center relative">
              {/* Número e icono */}
              <div
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center mb-5 ${step.color}`}
              >
                <span className="material-symbols-outlined text-[32px] sm:text-[40px]">
                  {step.icon}
                </span>
                {/* Badge numérico */}
                <span className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-on-primary text-label-sm font-bold flex items-center justify-center shadow-md">
                  {step.number}
                </span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface mb-2">
                {step.title}
              </h3>
              <p className="text-body-md text-secondary font-body-md max-w-xs">
                {step.description}
              </p>

              {/* Flecha conectora entre pasos (solo desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-10 -right-4 lg:-right-5 w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant shadow-sm items-center justify-center z-10">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    arrow_forward
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
