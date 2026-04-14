"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Global Error Component (Next.js 16)
 * Prevents "White Screen of Death" and provides a premium recovery path.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Professional logging of the error can happen here
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "60vh",
      padding: "24px",
      textAlign: "center"
    }}>
      <div style={{ 
        background: "#FFF0F0", 
        padding: "24px", 
        borderRadius: "16px",
        border: "1px solid var(--cams-danger)",
        maxWidth: "400px"
      }}>
        <AlertCircle size={48} color="var(--cams-danger)" style={{ marginBottom: "16px" }} />
        <h2 style={{ color: "var(--cams-danger)", marginBottom: "8px" }}>Something went wrong!</h2>
        <p style={{ color: "var(--cams-text-muted)", marginBottom: "24px", fontSize: "0.95rem" }}>
          The application encountered an unexpected error. Don't worry, your data is safe.
        </p>
        
        <button 
          onClick={reset}
          className="btn btn-primary"
          style={{ width: "100%", gap: "12px" }}
        >
          <RefreshCw size={18} /> Try Again
        </button>

        <a 
          href="/" 
          className="btn" 
          style={{ marginTop: "12px", color: "var(--cams-primary)", fontSize: "0.9rem" }}
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
