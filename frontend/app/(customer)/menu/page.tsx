"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../lib/api";
import Cookies from "js-cookie";
import { Plus, Star, Search } from "lucide-react";
import QuantityPill from "../../components/QuantityPill";
import Skeleton from "../../components/Skeleton";
import { useToast } from "../../components/Toast";

// Inline helper component for writing reviews
const ReviewForm = ({ itemId, onCloser }: { itemId: string, onCloser: ()=>void }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    api.get(`/reviews/${itemId}`).then(res => setReviews(res.data.reviews || [])).catch(err => console.error(err));
  }, [itemId]);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post(`/reviews/${itemId}`, { rating, comment });
      toast.success("Review published successfully!");
      onCloser();
    } catch (e) {
      toast.error(getErrorMessage(e));
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
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [itemRatings, setItemRatings] = useState<Record<string, { avg: number; count: number }>>({});
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

  // Filter items based on active category and search
  const getFilteredCategories = () => {
    return categories
      .filter((cat) => activeCategory === "ALL" || cat.id === activeCategory)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((i: any) =>
          i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
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

      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {filteredCategories.map(cat => (
          <div key={cat.id}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", borderBottom: "2px solid var(--cams-border)", paddingBottom: "12px" }}>
              {cat.name}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
              {cat.items.map((item: any) => {
                const cartItem = cart?.items?.find((ci: any) => ci.menuItemId === item.id);
                const rating = itemRatings[item.id];
                return (
                  <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", padding: 0, overflow: "hidden" }}>
                    {item.imageUrl && (
                      <div style={{ width: "100%", height: "160px", backgroundColor: "#eee" }}>
                        <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <h3 style={{ fontSize: "1.1rem" }}>{item.name}</h3>
                        <span style={{ fontWeight: 700 }}>₹{item.price}</span>
                      </div>
                      <p style={{ color: "var(--cams-text-muted)", fontSize: "0.9rem", marginBottom: "12px", minHeight: "40px" }}>
                        {item.description || "Freshly made standard offering."}
                      </p>
                      {/* Average Rating Display */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        {rating && rating.count > 0 ? (
                          <>
                            <span style={{ 
                              display: "inline-flex", alignItems: "center", gap: "4px",
                              background: rating.avg >= 4 ? "#E8F5E9" : rating.avg >= 3 ? "#FFF3E0" : "#FFEBEE",
                              color: rating.avg >= 4 ? "var(--cams-success)" : rating.avg >= 3 ? "var(--cams-warning)" : "var(--cams-danger)",
                              padding: "3px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700,
                            }}>
                              <Star size={12} fill="currentColor" /> {rating.avg}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "var(--cams-text-muted)" }}>
                              ({rating.count} {rating.count === 1 ? "review" : "reviews"})
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--cams-text-muted)", fontStyle: "italic" }}>No reviews yet</span>
                        )}
                        <button 
                          className="btn" 
                          onClick={() => setOpenReviewId(openReviewId === item.id ? null : item.id)}
                          style={{ padding: "2px 8px", fontSize: "0.7rem", marginLeft: "auto", color: "var(--cams-secondary-dark)", border: "1px dashed var(--cams-border)" }}
                        >
                          <Star size={10} style={{ marginRight: "2px" }} /> Rate
                        </button>
                      </div>
                    </div>
                    {openReviewId === item.id && (
                      <ReviewForm itemId={item.id} onCloser={() => setOpenReviewId(null)} />
                    )}
                    {item.isAvailable && openReviewId !== item.id ? (
                      <div style={{ width: "100px", marginTop: "12px" }}>
                        <QuantityPill 
                          itemId={item.id}
                          cartItemId={cartItem?.id}
                          initialQty={cartItem?.quantity || 0}
                          stockCount={item.stockCount}
                          onUpdate={(qty, cid) => syncCartState(item.id, qty, cid)}
                          onError={(msg) => toast.error(msg)}
                        />
                      </div>
                    ) : openReviewId !== item.id ? (
                      <button className="btn" disabled style={{ width: "100%", opacity: 0.5, marginTop: "12px" }}>
                        Out of Stock
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
