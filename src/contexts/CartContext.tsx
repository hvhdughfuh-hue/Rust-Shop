"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  PRIVILEGES,
  formatCredits,
  formatUsd,
  getPrivilegeDefinition,
  type PrivilegeTier,
} from "@/lib/constants";

interface CartItem {
  tier: PrivilegeTier;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalCoins: number;
  totalUsd: number;
  addItem: (tier: PrivilegeTier) => void;
  removeItem: (tier: PrivilegeTier) => void;
  setQuantity: (tier: PrivilegeTier, quantity: number) => void;
  clearCart: () => void;
  getCartLabel: () => string;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "rust-store-cart";

function normalizeItems(items: CartItem[]) {
  return items.filter((item) => {
    return (
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      Boolean(getPrivilegeDefinition(item.tier))
    );
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        setItems(normalizeItems(JSON.parse(raw) as CartItem[]));
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((tier: PrivilegeTier) => {
    setItems((current) => {
      const existing = current.find((item) => item.tier === tier);

      if (existing) {
        return current.map((item) =>
          item.tier === tier ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...current, { tier, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((tier: PrivilegeTier) => {
    setItems((current) => current.filter((item) => item.tier !== tier));
  }, []);

  const setQuantity = useCallback((tier: PrivilegeTier, quantity: number) => {
    setItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.tier !== tier);
      }

      return current.map((item) =>
        item.tier === tier
          ? { ...item, quantity: Math.min(9, Math.floor(quantity)) }
          : item,
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const privilege = PRIVILEGES.find((entry) => entry.tier === item.tier);

        if (!privilege) {
          return acc;
        }

        return {
          itemCount: acc.itemCount + item.quantity,
          totalCoins: acc.totalCoins + privilege.price * item.quantity,
          totalUsd: acc.totalUsd + privilege.usdPrice * item.quantity,
        };
      },
      { itemCount: 0, totalCoins: 0, totalUsd: 0 },
    );
  }, [items]);

  const getCartLabel = useCallback(() => {
    return `${formatCredits(totals.totalCoins)} · ${formatUsd(totals.totalUsd)}`;
  }, [totals.totalCoins, totals.totalUsd]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: totals.itemCount,
        totalCoins: totals.totalCoins,
        totalUsd: totals.totalUsd,
        addItem,
        removeItem,
        setQuantity,
        clearCart,
        getCartLabel,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
