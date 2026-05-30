"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getMyRestaurant,
  createRestaurant,
  updateRestaurant,
} from "@/features/menu/menu.actions";
import {
  Button,
  Input,
  Select,
  PageLoading,
  useToast,
} from "@/components/ui";
import { RESTAURANT_CATEGORIES } from "@/config/constants";

interface RestaurantData {
  id?: string;
  name: string;
  description: string;
  category: string;
  address: string;
  estimatedTime: number;
  minOrder: number;
  isOpen: boolean;
}

const emptyForm: RestaurantData = {
  name: "",
  description: "",
  category: "",
  address: "",
  estimatedTime: 30,
  minOrder: 0,
  isOpen: true,
};

export default function MiNegocioPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [form, setForm] = useState<RestaurantData>(emptyForm);

  useEffect(() => {
    getMyRestaurant()
      .then((data: any) => {
        if (data) {
          const r: RestaurantData = {
            id: data.id,
            name: data.name,
            description: data.description ?? "",
            category: data.category,
            address: data.address,
            estimatedTime: data.estimatedTime ?? 30,
            minOrder: Number(data.minOrder) || 0,
            isOpen: data.isOpen ?? true,
          };
          setRestaurant(r);
          setForm(r);
        }
      })
      .catch(() => setRestaurant(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.category || !form.address) {
      addToast("error", "Completa los campos obligatorios");
      return;
    }
    setSaving(true);
    try {
      if (restaurant?.id) {
        await updateRestaurant({
          name: form.name,
          description: form.description || undefined,
          category: form.category,
          address: form.address,
          estimatedTime: form.estimatedTime,
          minOrder: form.minOrder,
        });
        addToast("success", "Negocio actualizado exitosamente");
      } else {
        await createRestaurant({
          name: form.name,
          description: form.description || undefined,
          category: form.category,
          address: form.address,
          estimatedTime: form.estimatedTime,
          minOrder: form.minOrder || undefined,
        });
        addToast("success", "¡Negocio creado exitosamente!");
        router.push("/admin/panel");
      }
      router.refresh();
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoading />;

  const isEditing = !!restaurant?.id;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
          {isEditing ? "Mi negocio" : "Crear mi negocio"}
        </h1>
        <p className="text-body-md text-secondary font-body-md mt-1">
          {isEditing
            ? "Administra la información de tu restaurante"
            : "Registra tu restaurante para empezar a recibir pedidos"}
        </p>
      </div>

      {!isEditing && (
        <div className="bg-primary-fixed/20 border border-primary-container/30 rounded-xl p-4 text-body-sm text-primary font-body-md flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px] shrink-0">
            info
          </span>
          <span>
            Antes de gestionar tu menú y pedidos, necesitas registrar la
            información de tu negocio. Compléta los campos y crea tu
            restaurante.
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-5"
      >
        <Input
          id="name"
          label="NOMBRE DEL NEGOCIO"
          icon="store"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ej: Burger House"
          required
        />

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-label-md text-on-surface-variant font-label-md"
          >
            DESCRIPCIÓN
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Descripción de tu restaurante"
            rows={3}
            maxLength={1000}
            className="w-full px-4 py-3 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none resize-none"
          />
        </div>

        <Select
          id="category"
          label="CATEGORÍA"
          icon="category"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          options={RESTAURANT_CATEGORIES.map((c) => ({
            value: c,
            label: c,
          }))}
          placeholder="Selecciona una categoría"
          required
        />

        <Input
          id="address"
          label="DIRECCIÓN"
          icon="location_on"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Ej: Calle 85 # 15-20, Bogotá"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="estimatedTime"
            label="TIEMPO ESTIMADO (min)"
            icon="schedule"
            type="number"
            value={form.estimatedTime.toString()}
            onChange={(e) =>
              setForm({
                ...form,
                estimatedTime: Number(e.target.value) || 30,
              })
            }
            min={1}
            max={180}
          />
          <Input
            id="minOrder"
            label="PEDIDO MÍNIMO ($)"
            icon="payments"
            type="number"
            value={form.minOrder.toString()}
            onChange={(e) =>
              setForm({
                ...form,
                minOrder: Number(e.target.value) || 0,
              })
            }
            min={0}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="flex-1"
            size="lg"
            loading={saving}
          >
            {isEditing ? "Guardar cambios" : "Crear negocio"}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/admin/panel")}
            >
              Volver al panel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
