"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../lib/api";
import Cookies from "js-cookie";
import { Plus, Star, Search, ShoppingCart, ArrowRight, SlidersHorizontal } from "lucide-react";
import QuantityPill from "../../components/QuantityPill";
import Skeleton from "../../components/Skeleton";
import { useToast } from "../../components/Toast";
import Link from "next/link";

// ─── Review Form (inline) ────────────────────────────────
const ReviewForm = ({ itemId, onClose, onReviewSubmitted }: { itemId: string; onClose: () => void; onReviewSubmitted: () => void }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    api.get(`/reviews/${itemId}`).then(res => setReviews(res.data.reviews || [])).catch(() => {});
  }, [itemId]);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/reviews/${itemId}`, { rating, comment });
      toast.success("Review published successfully!");
      // Refresh the reviews list to show the new review immediately
      const updatedReviews = await api.get(`/reviews/${itemId}`);
      setReviews(updatedReviews.data.reviews || []);
      // Notify parent to refresh this item's rating badge
      onReviewSubmitted();
      setComment("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px", background: "var(--cams-surface-layered)", borderTop: "1px solid var(--cams-border)" }}>
      {reviews.length > 0 && (
        <div style={{ marginBottom: "16px", borderBottom: "1px solid var(--cams-border)", paddingBottom: "12px" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "10px", color: "var(--cams-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer Reviews</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "140px", overflowY: "auto" }}>
            {reviews.map(r => (
              <div key={r.id} style={{ fontSize: "0.85rem", padding: "8px 10px", background: "var(--cams-surface)", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ 
                    display: "inline-flex", alignItems: "center", gap: "2px",
                    background: r.rating >= 4 ? "#E8F5E9" : r.rating >= 3 ? "#FFF3E0" : "#FFEBEE",
                    color: r.rating >= 4 ? "var(--cams-success)" : r.rating >= 3 ? "var(--cams-warning)" : "var(--cams-danger)",
                    padding: "1px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 700
                  }}>
                    <Star size={9} fill="currentColor" /> {r.rating}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.8rem" }}>{r.customer.name}</span>
                </div>
                {r.comment && <span style={{ color: "var(--cams-text-muted)", fontSize: "0.8rem" }}>{r.comment}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>Rate this item</label>
      <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "4px",
            transition: "transform 0.15s"
          }}>
            <Star size={22} fill={n <= rating ? "#F59E0B" : "none"} color={n <= rating ? "#F59E0B" : "#D1D5DB"} />
          </button>
        ))}
      </div>
      <input 
        className="form-input" 
        style={{ padding: "8px 12px", marginBottom: "12px", fontSize: "0.9rem" }}
        placeholder="Share your experience (optional)..."
        value={comment} onChange={(e) => setComment(e.target.value)} 
      />
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button onClick={onClose} className="btn" style={{ padding: "6px 14px", fontSize: "0.85rem" }}>Cancel</button>
        <button onClick={submit} className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "0.85rem" }} disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
};

// ─── Main Menu Page ──────────────────────────────────────
export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openReviewId, setOpenReviewId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [itemRatings, setItemRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating" | "popularity">("default");
  const toast = useToast();

  useEffect(() => {
    fetchData();

    // Connect to Live Inventory Stream
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/inventory/stream`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'STOCK_UPDATED' && data.item) {
          setCategories(prevCats => {
            const nextCats = [...prevCats];
            for (let c = 0; c < nextCats.length; c++) {
              const items = [...nextCats[c].items];
              const idx = items.findIndex((i: any) => i.id === data.item.id);
              if (idx > -1) {
                items[idx] = { ...items[idx], stockCount: data.item.stockCount, isAvailable: data.item.isAvailable };
                nextCats[c] = { ...nextCats[c], items };
              }
            }
            return nextCats;
          });
        }
      } catch (e) {}
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, cartRes] = await Promise.all([
        api.get("/menu"),
        api.get("/cart").catch(() => ({ data: { cart: null } }))
      ]);
      setCategories(menuRes.data.menu);
      setCart(cartRes.data.cart);

      // Fetch average ratings for all items
      const allItems = menuRes.data.menu.flatMap((c: any) => c.items);
      fetchAllRatings(allItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRatings = async (allItems: any[]) => {
    const ratingPromises = allItems.map(async (item: any) => {
      try {
        const res = await api.get(`/reviews/${item.id}`);
        const reviews = res.data.reviews || [];
        if (reviews.length > 0) {
          const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
          return { id: item.id, avg: Math.round(avg * 10) / 10, count: reviews.length };
        }
        return { id: item.id, avg: 0, count: 0 };
      } catch {
        return { id: item.id, avg: 0, count: 0 };
      }
    });

    const ratings = await Promise.all(ratingPromises);
    const ratingsMap: Record<string, { avg: number; count: number }> = {};
    ratings.forEach((r) => { ratingsMap[r.id] = { avg: r.avg, count: r.count }; });
    setItemRatings(ratingsMap);
  };

  /**
   * Refresh a single item's rating after review submit (Bug fix #1)
   */
  const refreshItemRating = async (itemId: string) => {
    try {
      const res = await api.get(`/reviews/${itemId}`);
      const reviews = res.data.reviews || [];
      const avg = reviews.length > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length : 0;
      setItemRatings(prev => ({
        ...prev,
        [itemId]: { avg: Math.round(avg * 10) / 10, count: reviews.length }
      }));
    } catch {}
  };

  /**
   * Snappy Local State Sync
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
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="card" style={{ height: "280px", padding: "24px" }}>
            <Skeleton width="100%" height="120px" borderRadius="8px" />
            <div style={{ marginTop: "16px" }}>
              <Skeleton width="60%" height="20px" />
              <Skeleton width="40%" height="16px" className="mt-2" />
            </div>
            <div style={{ marginTop: "auto" }}>
              <Skeleton height="36px" borderRadius="8px" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Filtering + Sorting ───────────────────────────
  const getFilteredCategories = () => {
    let filtered = categories
      .filter((cat) => activeCategory === "ALL" || cat.id === activeCategory)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((i: any) =>
          i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
      }))
      .filter((cat) => cat.items.length > 0);

    // Apply sorting within each category
    if (sortBy !== "default") {
      filtered = filtered.map(cat => ({
        ...cat,
        items: [...cat.items].sort((a: any, b: any) => {
          if (sortBy === "price-asc") return a.price - b.price;
          if (sortBy === "price-desc") return b.price - a.price;
          if (sortBy === "rating") {
            const rA = itemRatings[a.id]?.avg || 0;
            const rB = itemRatings[b.id]?.avg || 0;
            return rB - rA;
          }
          if (sortBy === "popularity") {
            const pA = itemRatings[a.id]?.count || 0;
            const pB = itemRatings[b.id]?.count || 0;
            return pB - pA;
          }
          return 0;
        })
      }));
    }

    return filtered;
  };

  const filteredCategories = getFilteredCategories();

  // Cart summary for floating bar
  const cartItemCount = cart?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;
  const cartTotal = cart?.totalAmount || 0;

  return (
    <div style={{ paddingBottom: cartItemCount > 0 ? "80px" : "0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Explore the Menu</h1>
          <p style={{ color: "var(--cams-text-muted)", margin: 0 }}>Direct from our kitchen to your table.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", width: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--cams-text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input" 
              style={{ paddingLeft: "36px", borderRadius: "100px", fontSize: "0.85rem", padding: "8px 12px 8px 36px" }} 
            />
          </div>
          {/* Sort Dropdown */}
          <div style={{ position: "relative" }}>
            <SlidersHorizontal size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--cams-text-muted)", pointerEvents: "none" }} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="form-input"
              style={{ paddingLeft: "32px", borderRadius: "100px", fontSize: "0.85rem", padding: "8px 12px 8px 32px", appearance: "auto", cursor: "pointer", minWidth: "160px" }}
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ 
        display: "flex", 
        gap: "8px", 
        marginBottom: "32px", 
        overflowX: "auto",
        paddingBottom: "8px",
      }}>
        <button
          onClick={() => setActiveCategory("ALL")}
          className="btn"
          style={{
            padding: "8px 20px",
            borderRadius: "100px",
            fontSize: "0.85rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            background: activeCategory === "ALL" ? "var(--cams-primary)" : "var(--cams-surface)",
            color: activeCategory === "ALL" ? "white" : "var(--cams-text)",
            border: `1.5px solid ${activeCategory === "ALL" ? "var(--cams-primary)" : "var(--cams-border)"}`,
          }}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="btn"
            style={{
              padding: "8px 20px",
              borderRadius: "100px",
              fontSize: "0.85rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              background: activeCategory === cat.id ? "var(--cams-primary)" : "var(--cams-surface)",
              color: activeCategory === cat.id ? "white" : "var(--cams-text)",
              border: `1.5px solid ${activeCategory === cat.id ? "var(--cams-primary)" : "var(--cams-border)"}`,
            }}
          >
            {cat.name} ({cat.items.length})
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {filteredCategories.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--cams-text-muted)" }}>
            No items match your search.
          </div>
        )}
        {filteredCategories.map(cat => (
          <div key={cat.id}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", borderBottom: "2px solid var(--cams-border)", paddingBottom: "12px" }}>
              {cat.name}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
              {cat.items.map((item: any) => {
                const cartItem = cart?.items?.find((ci: any) => ci.menuItemId === item.id);
                const rating = itemRatings[item.id];
                const isReviewOpen = openReviewId === item.id;
                return (
                  <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", position: "relative", padding: 0, overflow: "hidden" }}>
                    {/* Image */}
                    {item.imageUrl ? (
                      <div style={{ width: "100%", height: "160px", backgroundColor: "#f0ede8" }}>
                        <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ) : (
                      <div style={{ width: "100%", height: "100px", background: "linear-gradient(135deg, var(--cams-surface-layered) 0%, #E8E5DF 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "2rem", opacity: 0.3 }}>☕</span>
                      </div>
                    )}

                    {/* Stock chip — top right */}
                    {item.isAvailable && item.stockCount <= 10 && item.stockCount > 0 && (
                      <span style={{
                        position: "absolute", top: "8px", right: "8px",
                        background: "rgba(211, 65, 65, 0.9)", color: "white",
                        padding: "2px 8px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700,
                        backdropFilter: "blur(4px)"
                      }}>
                        Only {item.stockCount} left
                      </span>
                    )}

                    {/* Content */}
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                          <h3 style={{ fontSize: "1.05rem", margin: 0 }}>{item.name}</h3>
                          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--cams-primary)", flexShrink: 0, marginLeft: "12px" }}>₹{item.price}</span>
                        </div>
                        <p style={{ color: "var(--cams-text-muted)", fontSize: "0.85rem", marginBottom: "12px", lineHeight: "1.4", minHeight: "36px" }}>
                          {item.description || "Freshly made standard offering."}
                        </p>
                        {/* Rating Badge */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {rating && rating.count > 0 ? (
                            <>
                              <span style={{ 
                                display: "inline-flex", alignItems: "center", gap: "3px",
                                background: rating.avg >= 4 ? "#E8F5E9" : rating.avg >= 3 ? "#FFF3E0" : "#FFEBEE",
                                color: rating.avg >= 4 ? "var(--cams-success)" : rating.avg >= 3 ? "var(--cams-warning)" : "var(--cams-danger)",
                                padding: "2px 8px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700,
                              }}>
                                <Star size={11} fill="currentColor" /> {rating.avg}
                              </span>
                              <span style={{ fontSize: "0.73rem", color: "var(--cams-text-muted)" }}>
                                ({rating.count})
                              </span>
                            </>
                          ) : (
                            <span style={{ fontSize: "0.73rem", color: "var(--cams-text-muted)", fontStyle: "italic" }}>No reviews yet</span>
                          )}
                          <button 
                            className="btn" 
                            onClick={() => setOpenReviewId(isReviewOpen ? null : item.id)}
                            style={{ padding: "2px 8px", fontSize: "0.7rem", marginLeft: "auto", color: "var(--cams-secondary-dark)", border: "1px dashed var(--cams-border)" }}
                          >
                            <Star size={10} style={{ marginRight: "2px" }} /> Rate
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Review Form */}
                    {isReviewOpen && (
                      <ReviewForm 
                        itemId={item.id} 
                        onClose={() => setOpenReviewId(null)} 
                        onReviewSubmitted={() => refreshItemRating(item.id)}
                      />
                    )}

                    {/* Action Footer */}
                    {!isReviewOpen && (
                      <div style={{ padding: "0 16px 16px 16px" }}>
                        {item.isAvailable ? (
                          <div style={{ width: "110px" }}>
                            <QuantityPill 
                              itemId={item.id}
                              cartItemId={cartItem?.id}
                              initialQty={cartItem?.quantity || 0}
                              stockCount={item.stockCount}
                              onUpdate={(qty, cid) => syncCartState(item.id, qty, cid)}
                              onError={(msg) => toast.error(msg)}
                            />
                          </div>
                        ) : (
                          <button className="btn" disabled style={{ width: "100%", opacity: 0.5, background: "var(--cams-surface-layered)", border: "1px solid var(--cams-border)", color: "var(--cams-text-muted)" }}>
                            Out of Stock
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Floating Cart Summary Bar (Swiggy-style) ─── */}
      {cartItemCount > 0 && (
        <Link href="/cart" style={{ textDecoration: "none" }}>
          <div style={{
            position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
            background: "var(--cams-primary)", color: "white",
            borderRadius: "var(--radius-lg)", padding: "14px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px",
            boxShadow: "0 8px 32px rgba(43, 89, 63, 0.3)",
            minWidth: "340px", maxWidth: "480px", width: "90%",
            cursor: "pointer", zIndex: 50,
            transition: "transform 0.2s, box-shadow 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <ShoppingCart size={20} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{cartItemCount} {cartItemCount === 1 ? "item" : "items"}</div>
                <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>₹{cartTotal}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
              View Cart <ArrowRight size={18} />
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
