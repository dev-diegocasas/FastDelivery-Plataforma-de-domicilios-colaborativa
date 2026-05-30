"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminDishes,
  getMyRestaurant,
  createDish,
  updateDish,
  toggleDishActive,
  deleteDish,
} from "@/features/menu/menu.actions";
import {
  Button,
  Modal,
  ConfirmModal,
  EmptyState,
  PageLoading,
  useToast,
} from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Dish } from "@/types";

interface DishForm {
  name: string;
  description: string;
  price: string;
}

const emptyForm: DishForm = { name: "", description: "", price: "" };

export default function AdminMenuPage() {
  const router = useRouter();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [noRestaurant, setNoRestaurant] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DishForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { addToast } = useToast();

  async function load() {
    try {
      const restaurant = await getMyRestaurant();
      if (!restaurant) {
        setNoRestaurant(true);
        setLoading(false);
        return;
      }
      const data = await getAdminDishes();
      setDishes(data as unknown as Dish[]);
    } catch {
      addToast("error", "Error al cargar el menú");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(dish: Dish) {
    setEditingId(dish.id);
    setForm({
      name: dish.name,
      description: dish.description ?? "",
      price: dish.price.toString(),
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      addToast("error", "Nombre y precio son obligatorios");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateDish(editingId, {
          name: form.name,
          description: form.description || undefined,
          price: Number(form.price),
        });
        addToast("success", "Plato actualizado exitosamente");
      } else {
        await createDish({
          name: form.name,
          description: form.description || undefined,
          price: Number(form.price),
        });
        addToast("success", "Plato creado exitosamente");
      }
      setModalOpen(false);
      load();
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al guardar el plato");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(dishId: string) {
    try {
      const updated = await toggleDishActive(dishId) as unknown as Dish;
      setDishes((prev) =>
        prev.map((d) => (d.id === dishId ? { ...d, isActive: updated.isActive } : d)),
      );
      addToast("success", updated.isActive ? "Plato activado" : "Plato desactivado");
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al cambiar el estado");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteDish(deleteId);
      setDishes((prev) => prev.filter((d) => d.id !== deleteId));
      addToast("success", "Plato eliminado");
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al eliminar el plato");
    } finally {
      setDeleteId(null);
    }
  }

  if (loading) return <PageLoading />;

  if (noRestaurant) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-8">
        <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[48px] text-primary">store</span>
        </div>
        <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">Menú</h1>
        <p className="text-body-lg text-secondary font-body-lg">
          Necesitas registrar tu negocio antes de gestionar el menú.
        </p>
        <Button size="lg" onClick={() => router.push("/admin/mi-negocio")}>
          <span className="material-symbols-outlined text-[20px]">add_business</span>
          Ir a mi negocio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">Menú</h1>
        <Button onClick={openCreate}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo plato
        </Button>
      </div>

      {dishes.length === 0 ? (
        <EmptyState
          icon="restaurant_menu"
          title="No tienes platos en tu menú"
          message="Agrega tu primer plato para empezar a recibir pedidos."
          action={{ label: "Crear plato", onClick: openCreate }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-lg bg-surface-variant flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] text-secondary">restaurant_menu</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-body-md font-semibold text-on-surface font-body-md">{dish.name}</h4>
                  <Badge variant={dish.isActive ? "success" : "error"}>
                    {dish.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                {dish.description && (
                  <p className="text-body-sm text-secondary font-body-sm mt-0.5 truncate">{dish.description}</p>
                )}
                <p className="text-body-md text-primary font-body-md font-semibold mt-0.5">
                  {formatCurrency(Number(dish.price))}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggle(dish.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    dish.isActive ? "text-green-600 hover:bg-green-50" : "text-secondary hover:bg-surface-container"
                  }`}
                  title={dish.isActive ? "Desactivar" : "Activar"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {dish.isActive ? "toggle_on" : "toggle_off"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(dish)}
                  className="p-2 rounded-lg text-secondary hover:bg-surface-container transition-colors"
                  title="Editar"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(dish.id)}
                  className="p-2 rounded-lg text-secondary hover:text-error hover:bg-error-container/20 transition-colors"
                  title="Eliminar"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar plato" : "Nuevo plato"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {editingId ? "Guardar cambios" : "Crear plato"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant font-label-md block">NOMBRE</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Clásica Burger"
              className="w-full h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md focus:ring-0 focus:border-primary-container outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant font-label-md block">DESCRIPCIÓN</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción del plato"
              rows={3}
              className="w-full px-4 py-3 bg-transparent border border-outline-variant rounded-lg font-body-md focus:ring-0 focus:border-primary-container outline-none resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant font-label-md block">PRECIO ($)</label>
            <input
              type="number"
              min={0}
              step={100}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="18500"
              className="w-full h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md focus:ring-0 focus:border-primary-container outline-none"
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar plato"
        message="¿Estás seguro de eliminar este plato? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="destructive"
      />
    </div>
  );
}
