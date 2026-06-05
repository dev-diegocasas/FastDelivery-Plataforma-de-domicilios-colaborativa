"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

const steps = [
  { icon: "smartphone", label: "Pide" },
  { icon: "restaurant", label: "Prepara" },
  { icon: "motorcycle", label: "Entrega" },
  { icon: "check_circle", label: "Recibe" },
];

export default function HeroSection() {
  function scrollToHow() {
    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center bg-gradient-to-b from-primary-container/10 via-background to-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-container/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary-container/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-container-max-width px-4 sm:px-8 py-16 sm:py-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-20">
          {/* Texto */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface leading-tight tracking-tight">
              Domicilios{" "}
              <span className="text-primary">rápidos</span> y{" "}
              <span className="text-primary">seguros</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-body-lg sm:text-headline-md text-secondary font-body-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Conectamos clientes, restaurantes y repartidores en una sola
              plataforma. Pide tu comida favorita y recíbela en minutos.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/registro">
                <Button size="lg">
                  <span className="material-symbols-outlined text-[20px]">
                    person_add
                  </span>
                  Empezar ahora
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={scrollToHow}>
                <span className="material-symbols-outlined text-[20px]">
                  expand_circle_down
                </span>
                Cómo funciona
              </Button>
            </div>
          </div>

          {/* Diagrama abstracto minimalista */}
          <div className="flex-1 flex items-center justify-center">
            {/* Desktop: horizontal */}
            <div className="hidden sm:flex items-center justify-center">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-surface-container-lowest shadow-sm border border-outline-variant/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px] lg:text-[28px] text-primary">
                        {step.icon}
                      </span>
                    </div>
                    <span className="text-label-sm text-secondary font-medium whitespace-nowrap">
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-8 lg:w-12 h-px bg-outline-variant/60 mx-2 lg:mx-3" />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile: vertical */}
            <div className="flex sm:hidden flex-col items-center">
              {steps.map((step, i) => (
                <div key={step.label} className="flex flex-col items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container-lowest shadow-sm border border-outline-variant/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px] text-primary">
                        {step.icon}
                      </span>
                    </div>
                    <span className="text-body-md font-medium text-on-surface">
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-6 bg-outline-variant/60 my-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
