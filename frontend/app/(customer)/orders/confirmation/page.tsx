"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("id");

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="card" style={{ maxWidth: "500px", width: "100%", textAlign: "center", padding: "48px 32px" }}>
        
        <CheckCircle size={64} color="var(--cams-success)" style={{ margin: "0 auto 24px auto" }} />
        
        <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Order Confirmed!</h1>
        <p style={{ color: "var(--cams-text-muted)", fontSize: "1.1rem", marginBottom: "32px" }}>
          Your order has been sent to the Chai Adda counter and is currently being prepared.
        </p>

        <div style={{ background: "var(--cams-surface-layered)", padding: "24px", borderRadius: "8px", marginBottom: "32px", border: "2px dashed var(--cams-primary)" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--cams-text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
            Your Pickup Order ID
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--cams-primary)", fontFamily: "monospace" }}>
            #{orderId?.split("-")[0].toUpperCase()}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--cams-text-muted)", marginTop: "12px" }}>
            Show this ID at the counter to pick up your order.
          </div>
        </div>

        <button 
          onClick={() => router.push("/orders")}
          className="btn btn-primary" 
          style={{ width: "100%", fontSize: "1.1rem", padding: "16px", display: "flex", justifyContent: "center", gap: "8px", alignItems: "center" }}
        >
          Track Order Status <ArrowRight size={20} />
        </button>

      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", padding: "100px" }}><div className="spinner" style={{ borderColor: 'var(--cams-primary)' }}/></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
