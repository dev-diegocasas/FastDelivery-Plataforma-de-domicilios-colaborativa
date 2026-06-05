"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  requestPasswordReset,
  resetPassword,
} from "@/features/auth/auth.actions";

function RecuperarContrasenaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [step, setStep] = useState<"email" | "reset" | "success">(
    token ? "reset" : "email",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      setStep("reset");
    }
  }, [token]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Ingresa tu correo electrónico");
      return;
    }
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
      setStep("success");
    } catch (err) {
      setError((err as Error).message ?? "Error al enviar");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(token!, password);
      setMessage(result.message);
      setStep("success");
    } catch (err) {
      setError((err as Error).message ?? "Error al restablecer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full px-4 sm:px-0 sm:max-w-[440px] space-y-6 sm:space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-display-md font-bold text-on-surface">
            {step === "email" && "Recuperar contraseña"}
            {step === "reset" && "Nueva contraseña"}
            {step === "success" && "Revisa tu correo"}
          </h1>
          <p className="text-body-lg text-secondary font-body-lg">
            {step === "email" &&
              "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."}
            {step === "reset" && "Elige una nueva contraseña para tu cuenta."}
            {step === "success" && message}
          </p>
        </div>

        {step === "email" && (
          <form
            onSubmit={handleEmailSubmit}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 sm:p-8 space-y-6"
          >
            {error && (
              <div className="bg-error-container text-on-error-container rounded-lg p-3 text-sm font-body-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="reset-email"
                className="text-label-md text-on-surface-variant font-label-md block"
              >
                CORREO ELECTRÓNICO
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
                  mail
                </span>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full h-11 sm:h-10 pl-10 pr-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-10 bg-primary-container text-on-primary font-title-lg rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando…" : "Enviar enlace"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-label-md text-primary font-label-md hover:underline"
              >
                Volver a iniciar sesión
              </button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form
            onSubmit={handleResetSubmit}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 sm:p-8 space-y-6"
          >
            {error && (
              <div className="bg-error-container text-on-error-container rounded-lg p-3 text-sm font-body-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-label-md text-on-surface-variant font-label-md block">
                NUEVA CONTRASEÑA
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-label-md text-on-surface-variant font-label-md block">
                CONFIRMAR CONTRASEÑA
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full h-11 sm:h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-10 bg-primary-container text-on-primary font-title-lg rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}

        {step === "success" && !token && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[40px] text-primary">mark_email_read</span>
            </div>
            <p className="text-body-md text-secondary font-body-md">{message}</p>
            <div>
              <button type="button" onClick={() => router.push("/login")} className="text-label-md text-primary font-label-md hover:underline">
                Volver a iniciar sesión
              </button>
            </div>
          </div>
        )}

        {step === "success" && token && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[40px] text-primary">check_circle</span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full h-11 sm:h-10 bg-primary-container text-on-primary font-title-lg rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecuperarContrasenaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-[40px] text-primary animate-spin inline-block">sync</span>
          <p className="text-body-lg text-secondary font-body-lg mt-4">Cargando…</p>
        </div>
      </div>
    }>
      <RecuperarContrasenaForm />
    </Suspense>
  );
}
