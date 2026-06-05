"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail, resendVerification } from "@/features/auth/auth.actions";

function VerificarCorreoForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado.");
      return;
    }

    verifyEmail(token)
      .then((result) => {
        setMessage(result.message);
        setStatus("success");
      })
      .catch((err) => {
        setMessage((err as Error).message ?? "Error al verificar el correo.");
        setStatus("error");
      });
  }, [token]);

  async function handleResend() {
    if (!resendEmail) return;
    setResending(true);
    try {
      const result = await resendVerification(resendEmail);
      setMessage(result.message);
      setStatus("success");
    } catch {
      setMessage("Error al reenviar el correo.");
      setStatus("error");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full px-4 sm:px-0 sm:max-w-[440px] text-center space-y-6">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[40px] text-primary animate-spin">
                sync
              </span>
            </div>
            <h1 className="text-display-md font-bold text-on-surface">
              Verificando…
            </h1>
            <p className="text-body-lg text-secondary font-body-lg">
              Estamos verificando tu correo electrónico.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[40px] text-primary">check_circle</span>
            </div>
            <h1 className="text-display-md font-bold text-on-surface">
              ¡Correo verificado!
            </h1>
            <p className="text-body-lg text-secondary font-body-lg">
              {message}
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex h-11 sm:h-10 px-6 bg-primary-container text-on-primary font-title-lg rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Iniciar sesión
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[40px] text-error">
                error_outline
              </span>
            </div>
            <h1 className="text-display-md font-bold text-on-surface">
              Error de verificación
            </h1>
            <p className="text-body-lg text-secondary font-body-lg">
              {message}
            </p>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4 mx-4 sm:mx-auto sm:max-w-sm">
              <p className="text-body-md text-secondary font-body-md">
                Ingresa tu correo para reenviar el enlace de verificación:
              </p>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full h-11 sm:h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container outline-none"
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || !resendEmail}
                className="w-full h-11 sm:h-10 bg-primary-container text-on-primary font-title-lg rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resending ? "Enviando…" : "Reenviar correo"}
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-label-md text-primary font-label-md hover:underline"
              >
                Volver a iniciar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerificarCorreoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-[40px] text-primary animate-spin inline-block">sync</span>
          <p className="text-body-lg text-secondary font-body-lg mt-4">Cargando…</p>
        </div>
      </div>
    }>
      <VerificarCorreoForm />
    </Suspense>
  );
}
