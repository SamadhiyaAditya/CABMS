"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "../../lib/api";
import { Clock, RefreshCw, CheckCircle, Package } from "lucide-react";
import { useToast } from "../../components/Toast";

import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const prevOrdersRef = useRef<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
    // Auto-poll every 10 seconds for live order tracking
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get("/orders/history");
      const newOrders = res.data.orders || [];
      
      // Detect status changes and notify the customer
      if (prevOrdersRef.current.length > 0) {
        newOrders.forEach((order: any) => {
          const prev = prevOrdersRef.current.find((o: any) => o.id === order.id);
          if (prev && prev.status !== order.status) {
            if (order.status === "READY") {
              toast.success(`🎉 Order #${order.id.slice(0, 8)} is READY for pickup!`);
            } else if (order.status === "PICKED_UP") {
              toast.info(`Order #${order.id.slice(0, 8)} marked as picked up.`);
            }
          }
        });
      }
      
      prevOrdersRef.current = newOrders;
      setOrders(newOrders);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          badge: <span className="badge badge-warning">🔥 Preparing</span>,
          icon: <Clock size={20} color="var(--cams-warning)" />,
          message: "Your order is being prepared by the kitchen.",
          color: "var(--cams-warning)",
          isActive: true,
        };
      case "READY":
        return {
          badge: <span className="badge badge-success">✅ Ready for Pickup</span>,
          icon: <Package size={20} color="var(--cams-success)" />,
          message: "Head to the counter — your order is ready!",
          color: "var(--cams-success)",
          isActive: true,
        };
      case "PICKED_UP":
        return {
          badge: <span className="badge badge-neutral">Completed</span>,
          icon: <CheckCircle size={20} color="var(--cams-text-muted)" />,
          message: "Order completed.",
          color: "var(--cams-text-muted)",
          isActive: false,
        };
      default:
        return {
          badge: <span className="badge badge-neutral">{status}</span>,
          icon: null,
          message: "",
          color: "var(--cams-text-muted)",
          isActive: false,
        };
    }
  };

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
        <div className="spinner" style={{ borderColor: "var(--cams-primary)" }} />
      </div>
    );

  const activeOrders = orders.filter((o) => o.status !== "PICKED_UP");
  const pastOrders = orders.filter((o) => o.status === "PICKED_UP");

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1>My Orders</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--cams-text-muted)" }}>
            Auto-refreshes every 10s · Last: {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button onClick={() => fetchOrders()} className="btn btn-outline" style={{ padding: "6px 12px" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Active Orders — with live status */}
      {activeOrders.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--cams-warning)" }}>
            🔴 Active Orders ({activeOrders.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {activeOrders.map((order) => {
              const status = getStatusInfo(order.status);
              return (
              <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div
                  className="card"
                  style={{
                    borderLeft: `4px solid ${status.color}`,
                    animation: order.status === "READY" ? "pulse-sync 2s infinite" : undefined,
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        {status.icon}
                        <h3 style={{ margin: 0 }}>Order #{order.id.slice(0, 8)}</h3>
                        {status.badge}
                      </div>
                      <p style={{ color: status.color, fontSize: "0.9rem", fontWeight: 500, marginBottom: "12px" }}>
                        {status.message}
                      </p>
                      <ul style={{ listStyle: "none", padding: 0, color: "var(--cams-text-muted)", fontSize: "0.9rem" }}>
                        {order.items.map((i: any) => (
                          <li key={i.id}>{i.quantity}× {i.menuItem.name}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.8rem", color: "var(--cams-text-muted)", marginBottom: "4px" }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>₹{order.totalAmount}</div>
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Orders */}
      {pastOrders.length > 0 && (
        <div>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--cams-text-muted)" }}>
            Past Orders ({pastOrders.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {pastOrders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="card" style={{ opacity: 0.7, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <h3 style={{ margin: 0 }}>Order #{order.id.slice(0, 8)}</h3>
                      <span className="badge badge-neutral">Completed</span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, color: "var(--cams-text-muted)", fontSize: "0.9rem" }}>
                      {order.items.map((i: any) => (
                        <li key={i.id}>{i.quantity}× {i.menuItem.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--cams-text-muted)", marginBottom: "4px" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>₹{order.totalAmount}</div>
                  </div>
                </div>
              </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--cams-text-muted)" }}>
          You haven't placed any orders yet!
        </div>
      )}
    </div>
  );
}
