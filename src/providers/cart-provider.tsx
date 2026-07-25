'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';

import type { Product } from '@/types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'mekfidel-cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
      };

    case 'ADD_ITEM': {
      const existing = state.items.findIndex(
        item => item.product.id === action.payload.product.id
      );

      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = {
          ...items[existing],
          quantity:
            items[existing].quantity + (action.payload.quantity || 1),
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
            quantity: action.payload.quantity || 1,
          },
        ],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          item => item.product.id !== action.payload.productId
        ),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items
          .map(item =>
            item.product.id === action.payload.productId
              ? {
                  ...item,
                  quantity: action.payload.quantity,
                }
              : item
          )
          .filter(item => item.quantity > 0),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };

    default:
      return state;
  }
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({
          type: 'LOAD_CART',
          payload: JSON.parse(saved),
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

 useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }
}, [state.items]);

  const totalItems = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const value: CartContextType = {
    items: state.items,
    isOpen: state.isOpen,
    totalItems,
    totalPrice,
    addItem: (product, quantity) =>
      dispatch({
        type: 'ADD_ITEM',
        payload: { product, quantity },
      }),
    removeItem: productId =>
      dispatch({
        type: 'REMOVE_ITEM',
        payload: { productId },
      }),
    updateQuantity: (productId, quantity) =>
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { productId, quantity },
      }),
    clearCart: () =>
      dispatch({
        type: 'CLEAR_CART',
      }),
    toggleCart: () =>
      dispatch({
        type: 'TOGGLE_CART',
      }),
    openCart: () =>
      dispatch({
        type: 'OPEN_CART',
      }),
    closeCart: () =>
      dispatch({
        type: 'CLOSE_CART',
      }),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
