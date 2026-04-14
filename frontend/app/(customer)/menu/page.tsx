"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../lib/api";
import Cookies from "js-cookie";
import { Plus, Star, Search } from "lucide-react";
import QuantityPill from "../../components/QuantityPill";
import Skeleton from "../../components/Skeleton";

// Inline helper component for writing reviews purely local-state mapped
const ReviewForm = ({ itemId, onCloser }: { itemId: string, onCloser: ()=>void }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/reviews/${itemId}`).then(res => setReviews(res.data.reviews)).catch(err => console.error(err));
  }, [itemId]);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post(`/reviews/${itemId}`, { rating, comment });
      alert("Successfully published your review!");
      onCloser();
    } catch (e) {
      alert("Error: " + getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "16px", padding: "16px", background: "var(--cams-surface-layered)", borderRadius: "8px" }}>
      {reviews.length > 0 && (
        <div style={{ marginBottom: "24px", borderBottom: "1px solid var(--cams-border)", paddingBottom: "16px" }}>
          <h4 style={{ fontSize: "0.9rem", marginBottom: "12px", color: "var(--cams-text-muted)" }}>Recent Reviews</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reviews.map(r => (
              <div key={r.id} style={{ fontSize: "0.85rem" }}>
                <span style={{ color: "var(--cams-warning)", fontWeight: "bold", marginRight: "8px" }}>{"⭐".repeat(r.rating)}</span>
                <span style={{ fontWeight: 600, marginRight: "4px" }}>{r.customer.name}:</span>
                <span style={{ color: "var(--cams-text-muted)" }}>{r.comment || "No comment provided."}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>Drop a Rating!</label>
      <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="form-input" style={{ marginBottom: "12px", padding: "8px" }}>
        <option value={5}>⭐⭐⭐⭐⭐ (5) Perfect!</option>
        <option value={4}>⭐⭐⭐⭐ (4) Good</option>
        <option value={3}>⭐⭐⭐ (3) Okay</option>
        <option value={2}>⭐⭐ (2) Disappointed</option>
        <option value={1}>⭐ (1) Bad</option>
      </select>
      <input 
        className="form-input" 
        style={{ padding: "8px", marginBottom: "12px", fontSize: "0.9rem" }}
        placeholder="Brief feedback (optional)..."
        value={comment} onChange={(e)=>setComment(e.target.value)} 
      />
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button onClick={onCloser} className="btn" style={{ padding: "6px 12px" }}>Cancel</button>
        <button onClick={submit} className="btn btn-primary" style={{ padding: "6px 12px" }} disabled={loading}>Submit</button>
      </div>
    </div>
  );
};

export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openReviewId, setOpenReviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, cartRes] = await Promise.all([
        api.get("/menu"),
        api.get("/cart").catch(() => ({ data: { cart: null } }))
      ]);
      setCategories(menuRes.data.menu);
      setCart(cartRes.data.cart);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Snappy Local State Sync
   * Updates the global cart totals so they react instantly to QuantityPill changes.
   */
  const syncCartState = (itemId: string, newQty: number, cartItemId?: string) => {
    setCart((prev: any) => {
      const items = prev?.items ? [...prev.items] : [];
      const itemIndex = items.findIndex((i: any) => i.menuItemId === itemId);
      
      const allItems = categories.flatMap(c => c.items);
      const itemData = allItems.find(i => i.id === itemId);
      const price = itemData?.price || 0;

      if (itemIndex > -1) {
        if (newQty === 0) {
          items.splice(itemIndex, 1);
        } else {
          items[itemIndex] = { ...items[itemIndex], quantity: newQty, id: cartItemId || items[itemIndex].id };
        }
      } else if (newQty > 0) {
        items.push({ id: cartItemId || `temp-${itemId}`, menuItemId: itemId, quantity: newQty, price, name: itemData?.name });
      }

      const totalAmount = items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0);
      return { ...prev, items, totalAmount };
    });
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px", paddingTop: "40px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ height: "200px", padding: "24px" }}>
            <Skeleton width="60%" height="24px" />
            <Skeleton width="40%" height="16px" className="mt-2" />
            <div style={{ marginTop: "auto" }}>
              <Skeleton height="36px" borderRadius="8px" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Explore the Menu</h1>
          <p style={{ color: "var(--cams-text-muted)", margin: 0 }}>Direct from our kitchen to your table.</p>
        </div>
        <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--cams-text-muted)" }} />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input" 
            style={{ paddingLeft: "40px", borderRadius: "100px" }} 
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {categories.map(cat => {
          // Filter items within category based on search
          const filteredItems = cat.items.filter((i: any) => 
            i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );

          if (filteredItems.length === 0) return null; // hide empty categories during search

          return (
            <div key={cat.id}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", borderBottom: "2px solid var(--cams-border)", paddingBottom: "12px" }}>
                {cat.name}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                
                {filteredItems.map((item: any) => {
                  const cartItem = cart?.items?.find((ci: any) => ci.menuItemId === item.id);
                
                return (
                  <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <h3 style={{ fontSize: "1.1rem" }}>{item.name}</h3>
                        <span style={{ fontWeight: 700 }}>₹{item.price}</span>
                      </div>
                      <p style={{ color: "var(--cams-text-muted)", fontSize: "0.9rem", marginBottom: "16px", minHeight: "40px" }}>
                        {item.description || "Freshly made standard offering."}
                      </p>
                      
                      <button 
                        className="btn" 
                        onClick={() => setOpenReviewId(openReviewId === item.id ? null : item.id)}
                        style={{ padding: "4px 8px", fontSize: "0.75rem", marginBottom: "16px", color: "var(--cams-secondary-dark)", border: "1px dashed var(--cams-border)" }}
                      >
                        <Star size={12} style={{ marginRight: "4px" }} /> Rate this
                      </button>
                    </div>

                    {openReviewId === item.id && (
                       <ReviewForm itemId={item.id} onCloser={() => setOpenReviewId(null)} />
                    )}

                    {/* Premium Quantity Selector Integration */}
                    {item.isAvailable && openReviewId !== item.id ? (
                      <div style={{ width: "100px", marginTop: "12px" }}>
                        <QuantityPill 
                          itemId={item.id}
                          cartItemId={cartItem?.id}
                          initialQty={cartItem?.quantity || 0}
                          stockCount={item.stockCount}
                          onUpdate={(qty, cid) => syncCartState(item.id, qty, cid)}
                          onError={(msg) => alert(msg)}
                        />
                      </div>
                    ) : openReviewId !== item.id ? (
                      <button className="btn" disabled style={{ width: "100%", opacity: 0.5 }}>
                        Out of Stock
                      </button>
                    ) : null}
                  </div>
                );
              })}
              
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
