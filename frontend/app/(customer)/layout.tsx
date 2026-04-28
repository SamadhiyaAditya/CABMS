"use client";

import { useState, useEffect, useRef } from "react";
import { Coffee, ShoppingCart, Clock, UserCircle, Bell, X } from "lucide-react";
import Link from "next/link";
import { api } from "../lib/api";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const prevOrdersRef = useRef<Record<string, string>>({});

  useEffect(() => {
    // Poll for order changes to generate notifications
    const pollOrders = async () => {
      try {
        const res = await api.get("/orders/history");
        const orders = res.data.orders || [];
        
        const newNotifs: any[] = [];
        const newStatusMap: Record<string, string> = {};
        
        orders.forEach((o: any) => {
          newStatusMap[o.id] = o.status;
          const prevStatus = prevOrdersRef.current[o.id];
          
          if (prevStatus && prevStatus !== o.status) {
            if (o.status === 'READY') {
              newNotifs.push({ id: Date.now() + Math.random(), message: `Order #${o.id.slice(0,6)} is ready for pickup!`, time: new Date() });
            } else if (o.status === 'PICKED_UP') {
              newNotifs.push({ id: Date.now() + Math.random(), message: `Order #${o.id.slice(0,6)} has been picked up.`, time: new Date() });
            }
          }
        });
        
        if (newNotifs.length > 0) {
          setNotifications(prev => [...newNotifs, ...prev].slice(0, 20)); // Keep last 20
        }
        
        prevOrdersRef.current = newStatusMap;
      } catch (err) {
        // silently fail polling
      }
    };

    pollOrders(); // initial fetch
    const interval = setInterval(pollOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: "var(--cams-background)", minHeight: "100vh" }}>
      {/* Customer Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/menu" className="navbar-logo">
            <Coffee color="var(--cams-primary)" size={24} />
            Chai Adda
          </Link>
          
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Link href="/menu" style={{ fontWeight: 500 }}>Menu</Link>
            <Link href="/orders" style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={18} /> Orders
            </Link>
            <Link href="/cart" style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
              <ShoppingCart size={18} /> Cart
            </Link>
            
            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setShowNotif(!showNotif)}
                style={{ background: "none", border: "none", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", marginLeft: "12px" }}
              >
                <Bell size={20} color="var(--cams-text)" />
                {notifications.length > 0 && (
                  <span style={{
                    position: "absolute", top: "-5px", right: "-5px",
                    background: "var(--cams-danger)", color: "white",
                    borderRadius: "50%", width: "16px", height: "16px",
                    fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotif && (
                <div style={{
                  position: "absolute", top: "100%", right: "0", marginTop: "12px",
                  background: "var(--cams-surface)", border: "1px solid var(--cams-border)",
                  borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)",
                  width: "300px", zIndex: 100, overflow: "hidden"
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--cams-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--cams-surface-layered)" }}>
                    <h3 style={{ margin: 0, fontSize: "0.95rem" }}>Notifications</h3>
                    <button onClick={() => { setNotifications([]); setShowNotif(false); }} className="btn" style={{ padding: "4px 8px", fontSize: "0.75rem", background: "transparent", color: "var(--cams-text-muted)" }}>
                      Clear All
                    </button>
                  </div>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "24px", textAlign: "center", color: "var(--cams-text-muted)", fontSize: "0.85rem" }}>No new notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--cams-border)", display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: 500 }}>{n.message}</p>
                            <span style={{ fontSize: "0.7rem", color: "var(--cams-text-muted)" }}>{n.time.toLocaleTimeString()}</span>
                          </div>
                          <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--cams-text-muted)" }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/profile" style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "6px", marginLeft: "12px" }}>
              <UserCircle size={18} /> Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Page Render */}
      <div className="container" style={{ padding: "40px 24px" }}>
        {children}
      </div>
    </div>
  );
}
