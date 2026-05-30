"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { Dish } from "@/types";

interface CartItem {
  dish: Dish;
  quantity: number;
  observations: string;
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; dish: Dish; restaurantName: string }
  | { type: "REMOVE_ITEM"; dishId: string }
  | { type: "UPDATE_QUANTITY"; dishId: string; quantity: number }
  | { type: "UPDATE_OBSERVATIONS"; dishId: string; observations: string }
  | { type: "CLEAR" };

interface CartContextType {
  state: CartState;
  addItem: (dish: Dish, restaurantName: string) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  updateObservations: (dishId: string, observations: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "fastdelivery-cart";

function loadCart(): CartState {
  if (typeof window === "undefined") {
    return { restaurantId: null, restaurantName: null, items: [] };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return { restaurantId: null, restaurantName: null, items: [] };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.dish.id === action.dish.id,
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.dish.id === action.dish.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      const newRestaurantId = action.dish.restaurantId;
      if (state.restaurantId && state.restaurantId !== newRestaurantId) {
        return {
          restaurantId: newRestaurantId,
          restaurantName: action.restaurantName,
          items: [
            {
              dish: action.dish,
              quantity: 1,
              observations: "",
            },
          ],
        };
      }
      return {
        restaurantId: newRestaurantId,
        restaurantName:
          state.restaurantName ?? action.restaurantName,
        items: [
          ...state.items,
          { dish: action.dish, quantity: 1, observations: "" },
        ],
      };
    }
    case "REMOVE_ITEM": {
      const filtered = state.items.filter(
        (i) => i.dish.id !== action.dishId,
      );
      if (filtered.length === 0) {
        return { restaurantId: null, restaurantName: null, items: [] };
      }
      return { ...state, items: filtered };
    }
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        const filtered = state.items.filter(
          (i) => i.dish.id !== action.dishId,
        );
        if (filtered.length === 0) {
          return { restaurantId: null, restaurantName: null, items: [] };
        }
        return { ...state, items: filtered };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.dish.id === action.dishId
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      };
    }
    case "UPDATE_OBSERVATIONS":
      return {
        ...state,
        items: state.items.map((i) =>
          i.dish.id === action.dishId
            ? { ...i, observations: action.observations }
            : i,
        ),
      };
    case "CLEAR":
      return { restaurantId: null, restaurantName: null, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, null, loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addItem = useCallback(
    (dish: Dish, restaurantName: string) =>
      dispatch({ type: "ADD_ITEM", dish, restaurantName }),
    [],
  );
  const removeItem = useCallback(
    (dishId: string) => dispatch({ type: "REMOVE_ITEM", dishId }),
    [],
  );
  const updateQuantity = useCallback(
    (dishId: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", dishId, quantity }),
    [],
  );
  const updateObservations = useCallback(
    (dishId: string, observations: string) =>
      dispatch({ type: "UPDATE_OBSERVATIONS", dishId, observations }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + Number(i.dish.price) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        updateObservations,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
