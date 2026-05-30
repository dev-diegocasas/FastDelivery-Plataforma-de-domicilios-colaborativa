"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { changePassword, deleteAccount } from "@/features/auth/auth.actions";
import { Button, Modal, useToast } from "@/components/ui";

export default function ConfiguracionPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwNew.length < 6) {
      addToast("error", "La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (pwNew !== pwConfirm) {
      addToast("error", "Las contraseñas no coinciden");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(pwCurrent, pwNew);
      addToast("success", "Contraseña actualizada exitosamente");
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al cambiar la contraseña");
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      addToast("error", "Ingresa tu contraseña para confirmar");
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
      await signOut({ redirect: true, callbackUrl: "/login" });
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al eliminar la cuenta");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
        Configuración
      </h1>

      {/* Notifications */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
        <h3 className="font-title-lg text-on-surface font-title-lg font-semibold">
          Notificaciones
        </h3>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-body-md text-on-surface font-body-md">Recibir notificaciones</p>
            <p className="text-body-sm text-secondary font-body-sm">
              Recibe actualizaciones sobre tus pedidos
            </p>
          </div>
          <input
            type="checkbox"
            checked={notificationsOn}
            onChange={() => setNotificationsOn(!notificationsOn)}
            className="w-5 h-5 accent-primary-container"
          />
        </label>
      </div>

      {/* Password change */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
        <h3 className="font-title-lg text-on-surface font-title-lg font-semibold">
          Seguridad
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="current-pw" className="text-label-md text-on-surface-variant font-label-md block">
              CONTRASEÑA ACTUAL
            </label>
            <input
              id="current-pw"
              type="password"
              required
              value={pwCurrent}
              onChange={(e) => setPwCurrent(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="new-pw" className="text-label-md text-on-surface-variant font-label-md block">
                NUEVA CONTRASEÑA
              </label>
              <input
                id="new-pw"
                type="password"
                required
                minLength={6}
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-pw" className="text-label-md text-on-surface-variant font-label-md block">
                CONFIRMAR
              </label>
              <input
                id="confirm-pw"
                type="password"
                required
                minLength={6}
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
              />
            </div>
          </div>
          <Button type="submit" loading={pwSaving}>
            Actualizar contraseña
          </Button>
        </form>
      </div>

      {/* Zona peligrosa */}
      <div className="bg-error-container/10 border border-error/20 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px] text-error">warning</span>
          <div>
            <h3 className="font-title-lg text-error font-title-lg font-semibold">
              Zona peligrosa
            </h3>
            <p className="text-body-sm text-on-surface-variant font-body-sm">
              Estas acciones son irreversibles. Procede con precaución.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-error text-error hover:bg-error-container/20 w-full sm:w-auto"
          onClick={() => setShowDeleteModal(true)}
        >
          <span className="material-symbols-outlined text-[18px]">delete_forever</span>
          Eliminar mi cuenta
        </Button>
      </div>

      {/* Delete account modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletePassword(""); }}
        title="Eliminar cuenta"
        size="sm"
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="ghost" className="flex-1" onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }} disabled={deleting}>
              Cancelar
            </Button>
            <Button className="flex-1 bg-error text-on-error hover:bg-error/90" onClick={handleDeleteAccount} loading={deleting}>
              Eliminar cuenta
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-error-container/10 border border-error/20 rounded-lg p-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-error shrink-0 mt-0.5">warning</span>
            <div className="text-body-sm text-on-surface-variant font-body-sm">
              <p className="font-semibold text-on-surface">Esta acción es irreversible.</p>
              <p>Tu cuenta, direcciones y datos personales serán eliminados permanentemente.</p>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="delete-pw" className="text-label-md text-on-surface-variant font-label-md block">
              CONTRASEÑA PARA CONFIRMAR
            </label>
            <input
              id="delete-pw"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-error outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
