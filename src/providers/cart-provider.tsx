"use client";
import { createClient } from "@/lib/supabase/client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import type { Product } from "@/types";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "REFRESH_PRODUCTS"; payload: Product[] }
  | { type: "ADD_ITEM"; payload: { product: Product; quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<boolean>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "mekfidel-cart";
function limitQuantity(product: Product, value: number) {
  return Math.max(
    0,
    Math.min(
      100,
      product.availability === "pre_order"
        ? 100
        : Math.max(0, Number(product.stock) || 0),
      Number.isFinite(value) ? Math.floor(value) : 0,
    ),
  );
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "REFRESH_PRODUCTS":
      return {
        ...state,
        items: state.items.flatMap((item) => {
          const product = action.payload.find(
            (product) => product.id === item.product.id,
          );
          if (
            !product ||
            !product.is_active ||
            product.availability === "out_of_stock"
          )
            return [];
          const quantity = limitQuantity(product, item.quantity);
          return quantity > 0 ? [{ product, quantity }] : [];
        }),
      };
    case "LOAD_CART":
      return {
        ...state,
        items: action.payload,
      };

    case "ADD_ITEM": {
      const existing = state.items.findIndex(
        (item) => item.product.id === action.payload.product.id,
      );

      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = {
          ...items[existing],
          quantity: limitQuantity(
            action.payload.product,
            items[existing].quantity + (action.payload.quantity || 1),
          ),
        };

        return {
          ...state,
          items,
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            product: action.payload.product,
            quantity: limitQuantity(
              action.payload.product,
              action.payload.quantity || 1,
            ),
          },
        ],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product.id !== action.payload.productId,
        ),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.product.id === action.payload.productId
              ? {
                  ...item,
                  quantity: limitQuantity(
                    item.product,
                    action.payload.quantity,
                  ),
                }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };

    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      };

    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({
          type: "LOAD_CART",
          payload: (() => {
            const rows: unknown = JSON.parse(saved);
            if (!Array.isArray(rows)) return [];
            return rows
              .filter(
                (row) =>
                  row &&
                  typeof row.product?.id === "string" &&
                  typeof row.product?.name === "string" &&
                  Number.isFinite(Number(row.product?.price)) &&
                  Number(row.product.price) >= 0 &&
                  Number.isInteger(row.quantity) &&
                  row.quantity > 0,
              )
              .slice(0, 50)
              .map((row) => ({
                ...row,
                quantity: limitQuantity(row.product, row.quantity),
              }))
              .filter((row) => row.quantity > 0);
          })(),
        });
      }
    } catch {
      console.warn("Saved cart could not be loaded");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* Cart remains usable when storage is full or unavailable. */
    }
  }, [state.items, hydrated]);

  const refreshCart = useCallback(async () => {
    if (!state.items.length) return false;
    const { data, error } = await createClient()
      .from("products")
      .select("*")
      .in(
        "id",
        state.items.map((item) => item.product.id),
      )
      .eq("is_active", true);
    if (error)
      throw new Error(
        "Could not verify current prices and stock. Please try again.",
      );
    const rows = (data || []) as Product[];
    const changed = state.items.some((item) => {
      const product = rows.find((row) => row.id === item.product.id);
      return (
        !product ||
        Number(product.price) !== Number(item.product.price) ||
        limitQuantity(product, item.quantity) !== item.quantity ||
        product.availability === "out_of_stock"
      );
    });
    dispatch({ type: "REFRESH_PRODUCTS", payload: rows });
    return changed;
  }, [state.items]);
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const value: CartContextType = {
    refreshCart,
    items: state.items,
    isOpen: state.isOpen,
    totalItems,
    totalPrice,
    addItem: (product, quantity) =>
      dispatch({
        type: "ADD_ITEM",
        payload: { product, quantity },
      }),
    removeItem: (productId) =>
      dispatch({
        type: "REMOVE_ITEM",
        payload: { productId },
      }),
    updateQuantity: (productId, quantity) =>
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { productId, quantity },
      }),
    clearCart: () =>
      dispatch({
        type: "CLEAR_CART",
      }),
    toggleCart: () =>
      dispatch({
        type: "TOGGLE_CART",
      }),
    openCart: () =>
      dispatch({
        type: "OPEN_CART",
      }),
    closeCart: () =>
      dispatch({
        type: "CLOSE_CART",
      }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
