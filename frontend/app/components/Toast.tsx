"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CheckCircle, AlertTriangle, X, Info } from "lucide-react";

/**
 * Toast Notification System
 * Replaces all alert() calls with smooth, auto-dismissing toast notifications.
 * 
 * Usage:
 *   const toast = useToast();
 *   toast.success("Order placed!");
 *   toast.error("Something went wrong");
 *   toast.info("Refreshing data...");
 */

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if used outside provider — use alert
    return {
      success: (msg) => console.log("[Toast]", msg),
      error: (msg) => console.error("[Toast]", msg),
      info: (msg) => console.info("[Toast]", msg),
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now() + (counter++);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const value: ToastContextType = {
    success: (msg) => addToast("success", msg),
    error: (msg) => addToast("error", msg),
    info: (msg) => addToast("info", msg),
  };

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success": return <CheckCircle size={18} />;
      case "error": return <AlertTriangle size={18} />;
      case "info": return <Info size={18} />;
    }
  };

  const getColor = (type: Toast["type"]) => {
    switch (type) {
      case "success": return { bg: "#E8F5E9", border: "#238551", text: "#238551" };
      case "error": return { bg: "#FFEBEE", border: "#D34141", text: "#D34141" };
      case "info": return { bg: "#E3F2FD", border: "#1976D2", text: "#1976D2" };
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container — fixed bottom right */}
      <div style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "400px",
      }}>
        {toasts.map((toast) => {
          const colors = getColor(toast.type);
          return (
            <div
              key={toast.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 20px",
                background: colors.bg,
                border: `1.5px solid ${colors.border}`,
                borderRadius: "12px",
                color: colors.text,
                fontSize: "0.9rem",
                fontWeight: 500,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                animation: "toastSlideIn 0.3s ease-out",
              }}
            >
              {getIcon(toast.type)}
              <span style={{ flex: 1 }}>{toast.message}</span>
              <X
                size={16}
                style={{ cursor: "pointer", opacity: 0.6, flexShrink: 0 }}
                onClick={() => dismiss(toast.id)}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
