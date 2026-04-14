"use client";

import { useState, useEffect, useRef } from "react";
import { api, getErrorMessage } from "../lib/api";

interface QuantityPillProps {
  initialQty: number;
  itemId: string;
  cartItemId?: string;
  stockCount: number;
  onUpdate: (newQty: number, cartItemId?: string) => void;
  onError?: (msg: string) => void;
}

/**
 * Premium Quantity Selector Pill
 * Mimics Zomato/Swiggy behavior: Snappy local state + Debounced background sync.
 */
export default function QuantityPill({
  initialQty,
  itemId,
  cartItemId: initialCartItemId,
  stockCount,
  onUpdate,
  onError
}: QuantityPillProps) {
  const [qty, setQty] = useState(initialQty);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cartId, setCartId] = useState<string | undefined>(initialCartItemId);
  
  // Use refs to track values for the debounced sync without re-triggering effects unnecessarily
  const qtyRef = useRef(qty);
  const cartIdRef = useRef(cartId);
  const isFirstMount = useRef(true);

  // Sync refs with state
  useEffect(() => { qtyRef.current = qty; }, [qty]);
  useEffect(() => { cartIdRef.current = cartId; }, [cartId]);

  // Debounced Sync Effect
  useEffect(() => {
    // Skip sync on initial mount
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      // If quantity is unchanged since last sync, skip
      if (qtyRef.current === initialQty && cartIdRef.current) return;

      setIsSyncing(true);
      try {
        if (qtyRef.current === 0 && cartIdRef.current) {
          // DELETE
          await api.delete(`/cart/items/${cartIdRef.current}`);
          setCartId(undefined);
          onUpdate(0, undefined);
        } else if (qtyRef.current > 0) {
          if (cartIdRef.current) {
            // PATCH
            await api.patch(`/cart/items/${cartIdRef.current}`, { quantity: qtyRef.current });
            onUpdate(qtyRef.current, cartIdRef.current);
          } else {
            // POST (New item to cart)
            const res = await api.post("/cart/items", { menuItemId: itemId, quantity: qtyRef.current });
            const newId = res.data?.cartItem?.id;
            setCartId(newId);
            onUpdate(qtyRef.current, newId);
          }
        }
      } catch (err) {
        // Rollback on error
        const msg = getErrorMessage(err);
        setQty(initialQty);
        if (onError) onError(msg);
      } finally {
        setIsSyncing(false);
      }
    }, 600); // 600ms debounce for premium feel

    return () => clearTimeout(timer);
  }, [qty]);

  const handleIncrement = () => {
    if (qty < stockCount) {
      const next = qty + 1;
      setQty(next);
      // Immediately notify parent of the "optimistic" change
      onUpdate(next, cartId);
    }
  };

  const handleDecrement = () => {
    if (qty > 0) {
      const next = qty - 1;
      setQty(next);
      // Immediately notify parent of the "optimistic" change
      onUpdate(next, cartId);
    }
  };

  if (qty === 0) {
    return (
      <button className="add-pill" onClick={handleIncrement}>
        ADD <span className="add-pill-plus">+</span>
      </button>
    );
  }

  return (
    <div className={`qty-pill ${isSyncing ? "syncing" : ""}`}>
      <button className="qty-btn" onClick={handleDecrement}>−</button>
      <span className="qty-count">{qty}</span>
      <button className="qty-btn" onClick={handleIncrement} disabled={qty >= stockCount}>+</button>
    </div>
  );
}
