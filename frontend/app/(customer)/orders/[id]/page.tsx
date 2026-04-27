"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getErrorMessage } from "../../../lib/api";
import { ArrowLeft, Clock, ShoppingBag } from "lucide-react";
import { useToast } from "../../../components/Toast";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      api.get(`/orders/${params.id}`)
        .then((res) => setOrder(res.data.order))
        .catch((err) => toast.error("Failed to load order details: " + getErrorMessage(err)))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) return <div className="container" style={{ padding: "40px" }}>Loading...</div>;
  if (!order) return <div className="container" style={{ padding: "40px" }}>Order not found.</div>;

  return (
    <div className="container" style={{ maxWidth: "800px", padding: "40px 24px" }}>
      <button className="btn btn-outline" style={{ marginBottom: "24px" }} onClick={() => router.back()}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--cams-border)", paddingBottom: "16px", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Order #{order.id.split('-')[0]}</h1>
            <div style={{ color: "var(--cams-text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={14} /> {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className={`badge ${order.status === 'READY' ? 'badge-success' : order.status === 'PENDING' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: "1rem", padding: "6px 12px" }}>
              {order.status}
            </span>
          </div>
        </div>

        <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><ShoppingBag size={18} /> Items</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {order.items.map((item: any) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--cams-surface-layered)", borderRadius: "var(--radius-md)" }}>
              <div>
                <strong style={{ fontSize: "1.1rem" }}>{item.quantity}× {item.menuItem.name}</strong>
              </div>
              <div style={{ fontWeight: 600 }}>₹{item.priceAtTime} each</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--cams-border)", paddingTop: "16px", marginTop: "24px", fontSize: "1.2rem", fontWeight: "bold" }}>
          <span>Total</span>
          <span style={{ color: "var(--cams-primary)" }}>₹{order.totalAmount}</span>
        </div>
      </div>
    </div>
  );
}
