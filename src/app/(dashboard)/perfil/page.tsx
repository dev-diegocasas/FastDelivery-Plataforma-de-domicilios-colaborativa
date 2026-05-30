"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { USER_ROLE_LABELS } from "@/config/constants";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/features/addresses/addresses.actions";
import { Button, Modal, ConfirmModal, useToast, PageLoading } from "@/components/ui";
import type { Address } from "@/types";

export default function PerfilPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", address: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await getUserAddresses();
      setAddresses(data as unknown as Address[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingAddr(null);
    setForm({ label: "", address: "" });
    setModalOpen(true);
  }

  function openEdit(addr: Address) {
    setEditingAddr(addr);
    setForm({ label: addr.label ?? "", address: addr.address });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.address) {
      addToast("error", "La dirección es obligatoria");
      return;
    }
    setSaving(true);
    try {
      if (editingAddr) {
        await updateAddress(editingAddr.id, form);
        addToast("success", "Dirección actualizada");
      } else {
        await createAddress(form);
        addToast("success", "Dirección agregada");
      }
      setModalOpen(false);
      load();
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(addr: Address) {
    try {
      await updateAddress(addr.id, { isDefault: true });
      addToast("success", "Dirección predeterminada actualizada");
      load();
    } catch {
      addToast("error", "Error al actualizar");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteAddress(deleteId);
      setAddresses((prev) => prev.filter((a) => a.id !== deleteId));
      addToast("success", "Dirección eliminada");
    } catch {
      addToast("error", "Error al eliminar");
    } finally {
      setDeleteId(null);
    }
  }

  if (loading) return <PageLoading />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
        Mi perfil
      </h1>

      {/* Profile info */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary text-2xl font-bold flex items-center justify-center">
            {session?.user?.name?.charAt(0) ?? "?"}
          </div>
          <div>
            <h2 className="text-title-lg font-semibold text-on-surface font-title-lg">
              {session?.user?.name}
            </h2>
            <p className="text-body-md text-secondary font-body-md">
              {session?.user?.email}
            </p>
            <span className="inline-block mt-1 px-3 py-1 bg-secondary-container text-on-secondary-container text-label-sm rounded-full font-label-sm">
              {session?.user?.role
                ? USER_ROLE_LABELS[session.user.role]
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-title-lg text-on-surface font-title-lg font-semibold">
            Mis direcciones
          </h3>
          <Button size="sm" onClick={openCreate}>
            <span className="material-symbols-outlined text-[16px]">add</span>
            Agregar
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-[48px] text-secondary block mb-2">
              location_off
            </span>
            <p className="text-body-md text-secondary font-body-md">
              No tienes direcciones guardadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-start gap-4"
              >
                <span className="material-symbols-outlined text-[24px] text-primary shrink-0 mt-0.5">
                  {addr.isDefault ? "home" : "location_on"}
                </span>
                <div className="flex-1 min-w-0">
                  {addr.label && (
                    <p className="text-body-sm font-semibold text-on-surface font-body-sm">
                      {addr.label}
                      {addr.isDefault && (
                        <span className="ml-2 text-label-sm text-primary font-label-sm">
                          Predeterminada
                        </span>
                      )}
                    </p>
                  )}
                  <p className="text-body-md text-on-surface font-body-md">
                    {addr.address}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr)}
                      className="p-2 rounded-lg text-secondary hover:bg-surface-container transition-colors"
                      title="Marcar como predeterminada"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(addr)}
                    className="p-2 rounded-lg text-secondary hover:bg-surface-container transition-colors"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(addr.id)}
                    className="p-2 rounded-lg text-secondary hover:text-error hover:bg-error-container/20 transition-colors"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address form modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAddr ? "Editar dirección" : "Nueva dirección"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingAddr ? "Guardar" : "Agregar"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant font-label-md block">
              NOMBRE (OPCIONAL)
            </label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Ej: Casa, Oficina"
              className="w-full h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md focus:ring-0 focus:border-primary-container outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant font-label-md block">
              DIRECCIÓN
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Ej: Carrera 15 # 80-20, Bogotá"
              className="w-full h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md focus:ring-0 focus:border-primary-container outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* Delete address confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar dirección"
        message="¿Estás seguro de eliminar esta dirección?"
        confirmText="Eliminar"
        variant="destructive"
      />
    </div>
  );
}
