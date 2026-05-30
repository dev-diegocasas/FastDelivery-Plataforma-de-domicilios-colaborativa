"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  className?: string;
}

export default function LoginForm({ className }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Correo o contraseña inválidos");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Ocurrió un error. Intenta nuevamente.");
      setLoading(false);
    }
  }

  return (
    <div className={cn("w-full max-w-[440px] flex flex-col gap-8", className)}>
      <div className="text-center space-y-2">
        <h1 className="text-display-md font-bold text-on-surface">
          Bienvenido de nuevo
        </h1>
        <p className="text-body-lg text-secondary font-body-lg">
          Gestiona tus entregas con la mayor eficiencia.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-container text-on-error-container rounded-lg p-3 text-sm font-body-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-label-md text-on-surface-variant font-label-md block"
            >
              CORREO ELECTRÓNICO
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
                mail
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="ejemplo@fastdelivery.com"
                className="w-full h-10 pl-10 pr-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-label-md text-on-surface-variant font-label-md"
              >
                CONTRASEÑA
              </label>
              <a
                href="/recuperar-contrasena"
                className="text-label-md text-primary hover:underline transition-all font-label-md"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
                lock
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-12 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-primary-container text-on-primary font-title-lg rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Cargando…</span>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink mx-4 text-label-sm text-secondary font-label-sm">
              O CONTINÚA CON
            </span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 h-10 border border-outline-variant rounded-lg opacity-50 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[#1877F2]">
                social_leaderboard
              </span>
              <span className="text-label-md text-on-surface font-label-md">
                Google
              </span>
            </button>
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 h-10 border border-outline-variant rounded-lg opacity-50 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[#1877F2]">
                lock
              </span>
              <span className="text-label-md text-on-surface font-label-md">
                Facebook
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="text-center">
        <p className="text-body-md text-secondary font-body-md">
          ¿No tienes una cuenta?{" "}
          <a
            href="/registro"
            className="text-primary font-bold hover:underline transition-all"
          >
            Regístrate gratis
          </a>
        </p>
      </div>
    </div>
  );
}
