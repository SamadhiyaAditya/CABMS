"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../lib/api";
import { Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import QuantityPill from "../../components/QuantityPill";
import Skeleton from "../../components/Skeleton";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data.cart);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Snappy Local Sync
   */
  const syncCartState = (cartItemId: string, newQty: number) => {
    setCart((prev: any) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((i: any) => 
        i.id === cartItemId ? { ...i, quantity: newQty, itemTotal: newQty * Number(i.price) } : i
      );
      const newTotal = updatedItems.reduce((acc: number, item: any) => acc + (item.quantity * Number(item.price)), 0);
      return { 
        ...prev, 
        items: newQty === 0 ? updatedItems.filter((i: any) => i.id !== cartItemId) : updatedItems, 
        totalAmount: newTotal 
      };
    });
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await api.post("/orders/checkout");
      router.push(`/orders/confirmation?id=${res.data.order.id}`); // Kick them to success screen
    } catch (err) {
      alert(`Checkout Failed: ${getErrorMessage(err)}`);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 0" }}>
        {[1, 2].map(i => (
          <div key={i} className="card" style={{ marginBottom: "16px", height: "80px", display: "flex", alignItems: "center", gap: "20px" }}>
            <Skeleton width="40%" height="24px" />
            <Skeleton width="20%" height="20px" />
            <Skeleton width="100px" height="36px" borderRadius="100px" />
          </div>
        ))}
      </div>
    );
  } return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <ShoppingBag color="var(--cams-primary)" /> My Cart
      </h1>

      {!cart || cart.items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>Your cart is entirely empty!</h2>
          <button className="btn btn-primary" onClick={() => router.push("/menu")} style={{ marginTop: "20px" }}>
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          
          {/* Cart Item Loop */}
          {cart.items.map((item: any) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid var(--cams-border)` }}>
              
              <div>
                <strong style={{ fontSize: "1.1rem", display: "block", marginBottom: "4px" }}>{item.name}</strong>
                <span style={{ color: "var(--cams-text-muted)" }}>₹{item.price} each</span>
                {!item.isAvailable && <div style={{ color: "var(--cams-danger)", fontSize: "0.85rem", marginTop: "4px" }}>Currently Unavailable</div>}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                
                {/* Premium Quantity Manager */}
                <div style={{ width: "100px" }}>
                  <QuantityPill 
                    itemId={item.menuItemId}
                    cartItemId={item.id}
                    initialQty={item.quantity}
                    stockCount={item.stockCount}
                    onUpdate={(qty) => syncCartState(item.id, qty)}
                    onError={(msg) => alert(msg)}
                  />
                </div>

                <div style={{ width: "80px", textAlign: "right", fontWeight: 700 }}>
                  ₹{item.itemTotal}
                </div>

                <button 
                  onClick={() => syncCartState(item.id, 0)} 
                  className="btn btn-danger" style={{ padding: "8px" }}>
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}

          {/* Cart Footer */}
          <div style={{ padding: "32px 24px", background: "var(--cams-surface-layered)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.9rem", color: "var(--cams-text-muted)", marginBottom: "4px" }}>Total Amount</div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--cams-primary)" }}>₹{cart.totalAmount}</div>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ fontSize: "1.1rem", padding: "16px 40px" }}
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
