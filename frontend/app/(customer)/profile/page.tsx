"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../lib/api";
import { UserCircle, Mail, LogOut, ShoppingBag, Heart, Calendar } from "lucide-react";
import { useToast } from "../../components/Toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<"today" | "week" | "month" | "all">("all");
  const [statsFilter, setStatsFilter] = useState<"week" | "month" | "all">("all");
  const [ordersVisible, setOrdersVisible] = useState(5);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, orderRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/orders/history")
      ]);
      
      const allOrders = orderRes.data.orders || [];
      const completedOrders = allOrders.filter((o: any) => o.status === 'PICKED_UP');
      const totalSpent = completedOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);

      // Calculate favorite items
      const itemCounts: Record<string, { name: string; count: number }> = {};
      completedOrders.forEach((o: any) => {
        o.items.forEach((i: any) => {
          const name = i.menuItem?.name || 'Unknown';
          if (!itemCounts[name]) itemCounts[name] = { name, count: 0 };
          itemCounts[name].count += i.quantity;
        });
      });
      const favorites = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);

      setOrders(allOrders);
      setProfile({
        ...profileRes.data.user,
        favorites
      });
    } catch (err) {
      toast.error("Session expired or invalid. Please login.");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("cams_token");
    Cookies.remove("cams_role");
    router.push("/");
  };

  const now = new Date();
  const filterDate = (d: string) => {
    const date = new Date(d);
    if (orderFilter === 'today') return date.toDateString() === now.toDateString();
    if (orderFilter === 'week') return (now.getTime() - date.getTime()) < 7 * 86400000;
    if (orderFilter === 'month') return (now.getTime() - date.getTime()) < 30 * 86400000;
    return true;
  };
  const filteredOrders = orders.filter(o => filterDate(o.createdAt));

  const filterStatsDate = (d: string) => {
    const date = new Date(d);
    if (statsFilter === 'week') return (now.getTime() - date.getTime()) < 7 * 86400000;
    if (statsFilter === 'month') return (now.getTime() - date.getTime()) < 30 * 86400000;
    return true;
  };
  const completedStatsOrders = orders.filter(o => o.status === 'PICKED_UP' && filterStatsDate(o.createdAt));
  const dynamicTotalSpent = completedStatsOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);
  const dynamicTotalOrders = completedStatsOrders.length;

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}><div className="spinner" style={{ borderColor: 'var(--cams-primary)' }}/></div>;
  }

  if (!profile) return <div className="card">Failed to load profile.</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <UserCircle color="var(--cams-primary)" size={32} /> My Profile
      </h1>

      {/* Top Stats Row */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px", gap: "6px" }}>
        {(["week", "month", "all"] as const).map(f => (
          <button key={f} onClick={() => setStatsFilter(f)} className="btn" style={{ padding: "4px 10px", fontSize: "0.75rem", background: statsFilter === f ? "var(--cams-primary)" : "transparent", color: statsFilter === f ? "white" : "var(--cams-text-muted)", border: "1px solid var(--cams-border)", borderRadius: "6px" }}>
            {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "32px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--cams-text-muted)", marginBottom: "8px" }}>Total Orders</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--cams-primary)" }}>{dynamicTotalOrders}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--cams-text-muted)", marginBottom: "8px" }}>Total Spent</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--cams-success)" }}>₹{dynamicTotalSpent}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--cams-text-muted)", marginBottom: "8px" }}>Member Since</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        {/* Account Info */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Account</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", color: "var(--cams-text-muted)" }}>
            <UserCircle size={18} /> {profile.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "var(--cams-text-muted)" }}>
            <Mail size={18} /> {profile.email}
          </div>
          <button onClick={handleLogout} className="btn" style={{ padding: "8px 16px", color: "var(--cams-danger)", border: "1px solid var(--cams-danger)", backgroundColor: "transparent", width: "100%" }}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Favorite Items */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Heart size={18} color="var(--cams-danger)" /> Your Favorites
          </h2>
          {profile.favorites.length === 0 ? (
            <div style={{ color: "var(--cams-text-muted)", fontSize: "0.9rem" }}>Place some orders to see your favorites!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {profile.favorites.map((fav: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--cams-surface-layered)", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontWeight: 500 }}>{fav.name}</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--cams-text-muted)" }}>Ordered {fav.count}×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <ShoppingBag size={18} /> Order History
          </h2>
          <div style={{ display: "flex", gap: "6px" }}>
            {(["today", "week", "month", "all"] as const).map(f => (
              <button key={f} onClick={() => setOrderFilter(f)} className="btn" style={{ padding: "4px 10px", fontSize: "0.75rem", background: orderFilter === f ? "var(--cams-primary)" : "transparent", color: orderFilter === f ? "white" : "var(--cams-text-muted)", border: "1px solid var(--cams-border)", borderRadius: "6px" }}>
                {f === 'today' ? 'Today' : f === 'week' ? 'Week' : f === 'month' ? 'Month' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--cams-text-muted)" }}>No orders for this period.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredOrders.slice(0, ordersVisible).map((order: any) => (
              <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--cams-surface-layered)", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "transform 0.15s" }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>Order #{order.id.slice(0, 8)}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--cams-text-muted)" }}>
                      {order.items.map((i: any) => `${i.quantity}× ${i.menuItem.name}`).join(", ")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700 }}>₹{order.totalAmount}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--cams-text-muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {ordersVisible < filteredOrders.length && (
            <button 
              onClick={() => setOrdersVisible(prev => prev + 5)} 
              className="btn btn-outline" 
              style={{ width: "100%", marginTop: "12px" }}
            >
              Load More ({filteredOrders.length - ordersVisible} remaining)
            </button>
          )}
        )}
      </div>
    </div>
  );
}
