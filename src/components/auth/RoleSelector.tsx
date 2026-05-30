"use client";

import type { UserRole } from "@/config/constants";
import { USER_ROLES, USER_ROLE_LABELS } from "@/config/constants";

interface RoleSelectorProps {
  value: UserRole | null;
  onChange: (role: UserRole) => void;
}

const ROLE_ICONS: Record<UserRole, string> = {
  cliente: "person",
  admin: "restaurant",
  repartidor: "motorcycle",
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  cliente: "Ordena comida de tus restaurantes favoritos",
  admin: "Gestiona tu restaurante y recibe pedidos",
  repartidor: "Realiza entregas y gana dinero",
};

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {(Object.values(USER_ROLES) as UserRole[]).map((role) => {
        const isSelected = value === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center ${
              isSelected
                ? "border-primary-container bg-primary-fixed/20"
                : "border-outline-variant bg-surface-container-lowest hover:border-primary-container/50"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[40px] ${
                isSelected ? "text-primary" : "text-secondary"
              }`}
            >
              {ROLE_ICONS[role]}
            </span>
            <div>
              <p
                className={`font-title-lg text-title-lg ${
                  isSelected ? "text-primary" : "text-on-surface"
                }`}
              >
                {USER_ROLE_LABELS[role]}
              </p>
              <p className="text-body-sm text-secondary font-body-sm mt-1">
                {ROLE_DESCRIPTIONS[role]}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
