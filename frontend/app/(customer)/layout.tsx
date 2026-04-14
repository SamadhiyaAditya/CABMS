"use client";

import { Coffee, ShoppingCart, Clock, UserCircle } from "lucide-react";
import Link from "next/link";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
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
