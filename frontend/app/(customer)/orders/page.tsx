"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "../../lib/api";
import { Clock, RefreshCw, CheckCircle, Package, ChefHat, ShoppingBag } from "lucide-react";
import { useToast } from "../../components/Toast";
import Link from "next/link";

// ─── Status Timeline Component ───────────────────────────
const StatusTimeline = ({ status }: { status: string }) => {
  const steps = [
    { key: "PENDING", label: "Placed", icon: <ShoppingBag size={16} /> },
    { key: "PREPARING", label: "Preparing", icon: <Clock size={16} /> },
    { key: "READY", label: "Ready", icon: <Package size={16} /> },
    { key: "PICKED_UP", label: "Picked Up", icon: <CheckCircle size={16} /> },
  ];

  // Map current status to step index
  const statusIdx = status === "PENDING" ? 1 : status === "READY" ? 2 : status === "PICKED_UP" ? 3 : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", margin: "16px 0 8px 0" }}>
      {steps.map((step, i) => {
        const isCompleted = i <= statusIdx;
        const isActive = i === statusIdx;
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            {/* Step circle */}
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isCompleted ? "var(--cams-primary)" : "var(--cams-surface-layered)",
              color: isCompleted ? "white" : "var(--cams-text-muted)",
              border: isActive ? "2px solid var(--cams-primary)" : "2px solid transparent",
              boxShadow: isActive ? "0 0 0 3px rgba(43, 89, 63, 0.15)" : "none",
              transition: "all 0.3s",
              flexShrink: 0,
            }}>
              {step.icon}
            </div>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: "3px", minWidth: "20px",
                background: i < statusIdx ? "var(--cams-primary)" : "var(--cams-border)",
                borderRadius: "2px",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const prevOrdersRef = useRef<any[]>([]);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [pastVisible, setPastVisible] = useState(5); // Pagination: show 5 initially

  useEffect(() => {
    fetchOrders();
    // Auto-poll every 2 seconds for live order tracking
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 2000);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1>My Orders</h1>
        <button onClick={() => fetchOrders()} className="btn btn-outline" style={{ padding: "6px 12px" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottom: "2px solid var(--cams-border)" }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            padding: "10px 24px", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
            background: "none", border: "none",
            borderBottom: activeTab === "active" ? "3px solid var(--cams-primary)" : "3px solid transparent",
            color: activeTab === "active" ? "var(--cams-primary)" : "var(--cams-text-muted)",
            marginBottom: "-2px",
          }}
        >
          Active {activeOrders.length > 0 && <span style={{ background: "var(--cams-warning)", color: "white", borderRadius: "100px", padding: "1px 8px", fontSize: "0.75rem", marginLeft: "6px" }}>{activeOrders.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab("past")}
          style={{
            padding: "10px 24px", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
            background: "none", border: "none",
            borderBottom: activeTab === "past" ? "3px solid var(--cams-primary)" : "3px solid transparent",
            color: activeTab === "past" ? "var(--cams-primary)" : "var(--cams-text-muted)",
            marginBottom: "-2px",
          }}
        >
          Past Orders ({pastOrders.length})
        </button>
      </div>

      {/* Active Orders Tab */}
      {activeTab === "active" && (
        <div>
          {activeOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--cams-text-muted)" }}>
              <Package size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
              <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>No active orders</div>
              <p style={{ fontSize: "0.9rem" }}>Your current orders will appear here with live tracking.</p>
              <Link href="/menu" className="btn btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
                Browse Menu
              </Link>
            </div>
          ) : (
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
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                            {status.icon}
                            <h3 style={{ margin: 0 }}>Order #{order.id.slice(0, 8)}</h3>
                            {status.badge}
                          </div>
                          <p style={{ color: status.color, fontSize: "0.85rem", fontWeight: 500, margin: "4px 0 0 0" }}>
                            {status.message}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "16px" }}>
                          <div style={{ fontSize: "0.75rem", color: "var(--cams-text-muted)", marginBottom: "4px" }}>
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>₹{order.totalAmount}</div>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <StatusTimeline status={order.status} />

                      {/* Items preview */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {order.items.map((i: any) => (
                          <span key={i.id} style={{ fontSize: "0.78rem", color: "var(--cams-text-muted)", background: "var(--cams-surface-layered)", padding: "3px 8px", borderRadius: "6px" }}>
                            {i.quantity}× {i.menuItem.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Past Orders Tab */}
      {activeTab === "past" && (
        <div>
          {pastOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--cams-text-muted)" }}>
              <CheckCircle size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
              <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>No past orders</div>
              <p style={{ fontSize: "0.9rem" }}>Completed orders will show up here.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pastOrders.slice(0, pastVisible).map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div className="card" style={{ opacity: 0.85, cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <h3 style={{ margin: 0, fontSize: "1rem" }}>Order #{order.id.slice(0, 8)}</h3>
                            <span className="badge badge-neutral">Completed</span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {order.items.map((i: any) => (
                              <span key={i.id} style={{ fontSize: "0.78rem", color: "var(--cams-text-muted)", background: "var(--cams-surface-layered)", padding: "3px 8px", borderRadius: "6px" }}>
                                {i.quantity}× {i.menuItem.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "16px" }}>
                          <div style={{ fontSize: "0.75rem", color: "var(--cams-text-muted)", marginBottom: "4px" }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>₹{order.totalAmount}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {pastVisible < pastOrders.length && (
                <button 
                  onClick={() => setPastVisible(prev => prev + 5)} 
                  className="btn btn-outline" 
                  style={{ width: "100%", marginTop: "16px" }}
                >
                  Load More ({pastOrders.length - pastVisible} remaining)
                </button>
              )}
            </>
          )}
        </div>
      )}

      {orders.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--cams-text-muted)" }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
          <div style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "8px" }}>No orders yet</div>
          <p style={{ fontSize: "0.9rem" }}>Start by browsing our menu!</p>
          <Link href="/menu" className="btn btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
            Browse Menu
          </Link>
        </div>
      )}
    </div>
  );
}
