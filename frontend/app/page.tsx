"use client";

import { useState } from "react";
import { Coffee, ArrowRight, UserPlus } from "lucide-react";
import { api, getErrorMessage } from "./lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await api.post("/auth/login", { email, password });
      } else {
        res = await api.post("/auth/register", { 
          name, 
          email, 
          password, 
          role: "CUSTOMER" // Public registrations are customers by default
        });
      }
      
      Cookies.set("cams_token", res.data.token, { expires: 1 });
      Cookies.set("cams_role", res.data.user.role, { expires: 1 });

      if (res.data.user.role === "SHOPKEEPER") {
        router.push("/dashboard");
      } else {
        router.push("/menu"); // Customer flow
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-logo">
            <Coffee color="var(--cams-primary)" size={28} />
            CAMS
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          
          {/* Hero Section */}
          <div style={{ paddingRight: "40px" }}>
            <div className="badge badge-warning" style={{ marginBottom: "16px" }}>Campus Special</div>
            <h1 style={{ fontSize: "3.5rem", lineHeight: "1.1", marginBottom: "24px" }}>
              Chai Adda <br />
              <span style={{ color: "var(--cams-text)" }}>Management System</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "var(--cams-text-muted)", marginBottom: "32px", lineHeight: "1.6" }}>
              Experience seamless ordering and management. A complete system designed specifically for our local campus chai shop.
            </p>
          </div>

          {/* Auth Card */}
          <div className="card" style={{ maxWidth: "420px", width: "100%" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "24px", textAlign: "center" }}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            
            {error && (
              <div style={{ background: "#FFEBEE", color: "var(--cams-danger)", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth}>
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Aditya S"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin} 
                  />
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder={isLogin ? "shopkeeper@chaiadda.com" : "you@college.edu"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: "100%", justifyContent: "space-between", marginTop: "12px" }}
                disabled={loading}
              >
                {loading ? <div className="spinner" /> : (isLogin ? "Sign In" : "Register")}
                {!loading && (isLogin ? <ArrowRight size={20} /> : <UserPlus size={20} />)}
              </button>
            </form>
            
            <div style={{ textAlign: "center", marginTop: "24px", color: "var(--cams-text-muted)", fontSize: "0.9rem" }}>
              {isLogin ? (
                <>
                  Don't have an account? <span style={{ color: "var(--cams-primary)", cursor: "pointer", fontWeight: 600 }} onClick={() => setIsLogin(false)}>Sign up</span><br/><br/>
                  <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    Demo Credentials:<br/>
                    Shopkeeper: <code>shopkeeper@chaiadda.com</code><br/>
                    Customer: <code>test@customer.com</code><br/>
                    Password: <code>password123</code>
                  </span>
                </>
              ) : (
                <>
                  Already have an account? <span style={{ color: "var(--cams-primary)", cursor: "pointer", fontWeight: 600 }} onClick={() => setIsLogin(true)}>Sign in</span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
