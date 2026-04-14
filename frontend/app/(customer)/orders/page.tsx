"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/history");
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="badge badge-warning">Preparing</span>;
      case 'READY': return <span className="badge badge-success">Ready for Pickup</span>;
      case 'PICKED_UP': return <span className="badge badge-neutral">Picked Up</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}><div className="spinner" style={{ borderColor: 'var(--cams-primary)' }}/></div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "32px" }}>Order History</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--cams-text-muted)" }}>
          You haven't placed any orders yet!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ display: "flex", justifyContent: "space-between" }}>
              
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0 }}>Order #{order.id.slice(0,8)}</h3>
                  {getStatusBadge(order.status)}
                </div>
                
                <ul style={{ listStyle: "none", padding: 0, color: "var(--cams-text-muted)", fontSize: "0.95rem" }}>
                  {order.items.map((i: any) => (
                    <li key={i.id} style={{ marginBottom: "4px" }}>
                      {i.quantity}x {i.menuItem.name} 
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--cams-text-muted)", fontSize: "0.85rem", marginBottom: "8px" }}>
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                  ₹{order.totalAmount}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
