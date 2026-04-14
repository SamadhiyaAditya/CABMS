"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../lib/api";
import { UserCircle, Mail, Key, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Pull both auth info and order historicals purely for the summary panel
      const [profileRes, orderRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/orders/history")
      ]);
      
      const orders = orderRes.data.orders || [];
      const completedOrders = orders.filter((o: any) => o.status === 'PICKED_UP');
      const totalSpent = completedOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);

      setProfile({
        ...profileRes.data.user,
        stats: {
          totalOrders: completedOrders.length,
          totalSpent
        }
      });
    } catch (err) {
      console.error(err);
      alert("Session expired or invalid. Please login.");
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

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}><div className="spinner" style={{ borderColor: 'var(--cams-primary)' }}/></div>;
  }

  if (!profile) return <div className="card">Failed to load local profile context.</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <UserCircle color="var(--cams-primary)" size={32} /> My Profile
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        
        {/* User Standard Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Account Credentials</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--cams-text-muted)" }}>
              <UserCircle size={18} /> {profile.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--cams-text-muted)" }}>
              <Mail size={18} /> {profile.email}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--cams-text-muted)" }}>
              <Key size={18} /> Role: {profile.role}
            </div>
          </div>
          
          <button onClick={handleLogout} className="btn" style={{ padding: "8px", marginTop: "24px", color: "var(--cams-danger)", border: "1px solid var(--cams-danger)", backgroundColor: "transparent" }}>
            <LogOut size={16} /> Secure Logout
          </button>
        </div>

        {/* User Analytics Summary */}
        <div className="card" style={{ background: "var(--cams-surface-layered)" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Historical Activity</h2>
          
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--cams-text-muted)", marginBottom: "4px" }}>Total Successfully Picked Up</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--cams-text)" }}>{profile.stats.totalOrders} Orders</div>
          </div>
          
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--cams-text-muted)", marginBottom: "4px" }}>Lifetime Platform Spend</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--cams-primary)" }}>₹{profile.stats.totalSpent}</div>
          </div>
        </div>

      </div>

    </div>
  );
}
