"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import RoleSelector from "./RoleSelector";
import type { UserRole } from "@/config/constants";

interface RegisterFormProps {
  className?: string;
}

export default function RegisterForm({ className }: RegisterFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError("Selecciona un rol para continuar");
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);
    const userData = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      password: form.get("password") as string,
      role,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Ocurrió un error al registrarte");
        setLoading(false);
        return;
      }

      setRegistered(true);
      setLoading(false);
    } catch {
      setError("Ocurrió un error. Intenta nuevamente.");
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className={cn("w-full flex flex-col gap-5", className)}>
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px] text-primary">
              mark_email_read
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
            Revisa tu correo
          </h1>
          <p className="text-body-md text-secondary font-body-md">
            Te enviamos un enlace de verificación. Revisa tu bandeja de entrada
            para activar tu cuenta.
          </p>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-primary font-semibold hover:underline transition-all"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full flex flex-col gap-4 sm:gap-5", className)}>
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-3xl font-bold text-on-surface">
          Crear cuenta
        </h1>
        <p className="text-body-sm sm:text-body-md text-secondary font-body-sm sm:font-body-md">
          Únete a FastDelivery y empieza a disfrutar.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 sm:p-6 shadow-sm lg:shadow-md">
        <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-container text-on-error-container rounded-lg p-2.5 text-sm font-body-md">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            <p className="text-label-md text-on-surface-variant font-label-md">
              SELECCIONA TU ROL
            </p>
            <RoleSelector value={role} onChange={setRole} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-label-md text-on-surface-variant font-label-md block">
                NOMBRE
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
                  person
                </span>
                <input
                  id="name" name="name" type="text" required
                  placeholder="Ana García"
                  className="w-full h-11 sm:h-10 pl-10 pr-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-label-md text-on-surface-variant font-label-md block">
                TELÉFONO
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
                  phone
                </span>
                <input
                  id="phone" name="phone" type="tel" required
                  placeholder="3001234567"
                  className="w-full h-11 sm:h-10 pl-10 pr-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-label-md text-on-surface-variant font-label-md block">
                CORREO
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
                  mail
                </span>
                <input
                  id="reg-email" name="email" type="email" required
                  placeholder="ejemplo@fastdelivery.com"
                  className="w-full h-11 sm:h-10 pl-10 pr-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-label-md text-on-surface-variant font-label-md block">
                CONTRASEÑA
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full h-11 sm:h-10 pl-10 pr-12 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2.5">
            <input type="checkbox" required className="w-4 h-4 border-outline-variant rounded accent-primary-container shrink-0" />
            <span className="text-body-sm text-on-surface-variant font-body-sm">
              Acepto los{" "}
              <a href="#" className="text-primary hover:underline">Términos</a>{" "}
              y{" "}
              <a href="#" className="text-primary hover:underline">Privacidad</a>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 sm:h-10 bg-primary-container text-on-primary font-title-lg rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Cargando…</span>
            ) : (
              <>
                <span>Crear cuenta</span>
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="text-center -mt-1">
        <p className="text-body-sm text-secondary font-body-sm">
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className="text-primary font-semibold hover:underline transition-all">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
