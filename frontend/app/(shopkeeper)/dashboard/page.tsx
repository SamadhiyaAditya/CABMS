"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../lib/api";
import { Coffee, Tag, Plus, AlertTriangle, LogOut, BarChart3, X, Save, ClipboardList } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Trash2, Edit2 } from "lucide-react";

// ─── Modal: Create Category ───
const CreateCategoryModal = ({ onClose, onRefresh }: { onClose: ()=>void, onRefresh: ()=>void }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/menu/categories", { name, description: desc });
      onRefresh();
      onClose();
    } catch (e) {
      alert("Error: " + getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: "400px" }}>
        <h3 style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>Add Category <X onClick={onClose} style={{cursor:"pointer", opacity: 0.5}}/></h3>
        <input className="form-input" style={{marginBottom: "12px"}} placeholder="Category Name (e.g. Cold Drinks)" value={name} onChange={e=>setName(e.target.value)} />
        <input className="form-input" style={{marginBottom: "16px"}} placeholder="Description (optional)" value={desc} onChange={e=>setDesc(e.target.value)} />
        <button onClick={submit} className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>{loading ? 'Creating...' : 'Confirm Category'}</button>
      </div>
    </div>
  );
};



// ─── Modal: Edit Item ───
const EditItemModal = ({ item, onClose, onRefresh }: { item: any, onClose: ()=>void, onRefresh: ()=>void }) => {
  const [name, setName] = useState(item.name);
  const [desc, setDesc] = useState(item.description || "");
  const [price, setPrice] = useState(item.price);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.put(`/menu/items/${item.id}`, { name, description: desc, price: Number(price) });
      onRefresh();
      onClose();
    } catch (e) {
      alert("Error: " + getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: "400px" }}>
        <h3 style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>Edit Menu Item <X onClick={onClose} style={{cursor:"pointer", opacity: 0.5}}/></h3>
        <input className="form-input" style={{marginBottom: "12px"}} placeholder="Item Name" value={name} onChange={e=>setName(e.target.value)} />
        <input type="number" className="form-input" style={{marginBottom: "12px"}} placeholder="Price (₹)" value={price} onChange={e=>setPrice(e.target.value)} />
        <input className="form-input" style={{marginBottom: "16px"}} placeholder="Description (optional)" value={desc} onChange={e=>setDesc(e.target.value)} />
        <button onClick={submit} className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>{loading ? 'Saving...' : 'Update Item'}</button>
      </div>
    </div>
  );
};

// ─── Inline Inventory Editor ───
const InlineInventoryEditor = ({ item, onSaved }: { item: any, onSaved: ()=>void }) => {
  const [stock, setStock] = useState(item.stockCount);
  const [saving, setSaving] = useState(false);

  const executeSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/inventory/${item.menuItemId}`, { stockCount: Number(stock), lowStockThreshold: item.lowStockThreshold });
      onSaved();
    } catch(e) {
      alert("Failed updating stock: " + getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <input type="number" value={stock} onChange={e=>setStock(Number(e.target.value))} style={{ width: "60px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }} />
      <button onClick={executeSave} disabled={saving} className="btn" style={{ padding: "4px 8px", background: "var(--cams-success)", color: "white" }}>
        <Save size={14} />
      </button>
    </div>
  )
}

// ─── Main Dashboard ───
export default function ShopkeeperDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ORDERS" | "KITCHEN" | "MENU" | "INVENTORY" | "REPORTS">("ORDERS");
  const [categories, setCategories] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [inventoryReport, setInventoryReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState<string | null>(null);
  const [editItemModalData, setEditItemModalData] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, invRes, ordersRes, salesRes, invRepRes, topItemsRes] = await Promise.all([
        api.get("/menu"),
        api.get("/inventory"),
        api.get("/orders/all"),
        api.get("/reports?type=sales").catch((err) => { console.error(err); return {data:{report:null}}; }),
        api.get("/reports?type=inventory").catch((err) => { console.error(err); return {data:{report:null}}; }),
        api.get("/reports?type=top-items").catch((err) => { console.error(err); return {data:{report:null}}; })
      ]);
      setCategories(menuRes.data.menu);
      setInventory(invRes.data.inventory);
      setOrders(ordersRes.data.orders);
      
      // Inject topItems logic into salesReport
      const sales = salesRes.data.report;
      if (sales && topItemsRes.data.report) {
         sales.breakdown = topItemsRes.data.report.topItems;
      }
      setSalesReport(sales);
      setInventoryReport(invRepRes.data.report);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Cookies.get('cams_token')) {
      router.push('/');
    } else {
      fetchData();

      // SSE Connection for Live Updates
      const token = Cookies.get('cams_token');
      const eventSource = new EventSource(`http://localhost:3001/orders/stream?token=${token}`, { withCredentials: true });
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.message === "connected") return;
          console.log("SSE Event!", data);
          fetchData(); // Trigger re-render to reflect new list locally
        } catch (e) { }
      };

      return () => {
        eventSource.close();
      };
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("cams_token");
    Cookies.remove("cams_role");
    router.push("/");
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert("Failed: " + getErrorMessage(err));
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="badge badge-warning">Pending</span>;
      case 'READY': return <span className="badge badge-success">Ready</span>;
      case 'PICKED_UP': return <span className="badge badge-neutral">Picked Up</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const getNextAction = (status: string) => {
    switch(status) {
      case 'PENDING': return { label: 'Mark Ready', next: 'READY', color: 'var(--cams-success)' };
      case 'READY': return { label: 'Mark Picked Up', next: 'PICKED_UP', color: 'var(--cams-primary)' };
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--cams-surface-layered)" }}>
      
      {showCatModal && <CreateCategoryModal onClose={() => setShowCatModal(false)} onRefresh={fetchData} />}
      {showItemModal && <CreateItemModal categoryId={showItemModal} onClose={() => setShowItemModal(null)} onRefresh={fetchData} />}
      {editItemModalData && <EditItemModal item={editItemModalData} onClose={() => setEditItemModalData(null)} onRefresh={fetchData} />}

      <nav className="navbar" style={{ padding: "12px 0" }}>
        <div className="container navbar-inner">
          <div className="navbar-logo">
            <Coffee color="var(--cams-primary)" size={24} /> Administrator Panel
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: "8px 16px" }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="container" style={{ padding: "32px 24px", display: "grid", gridTemplateColumns: "240px 1fr", gap: "32px" }}>
        
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button className={`btn ${activeTab === "ORDERS" ? "btn-primary" : "btn-outline"}`} style={{ justifyContent: "flex-start", width: "100%", border: "none" }} onClick={() => setActiveTab("ORDERS")}>
            <ClipboardList size={18} /> Live Orders
          </button>
          <button className={`btn ${activeTab === "KITCHEN" ? "btn-primary" : "btn-outline"}`} style={{ justifyContent: "flex-start", width: "100%", border: "none", background: activeTab === "KITCHEN" ? "var(--cams-danger)" : "" }} onClick={() => setActiveTab("KITCHEN")}>
            <AlertTriangle size={18} /> Kitchen View
          </button>
          <button className={`btn ${activeTab === "MENU" ? "btn-primary" : "btn-outline"}`} style={{ justifyContent: "flex-start", width: "100%", border: "none" }} onClick={() => setActiveTab("MENU")}>
            <Tag size={18} /> Menu Management
          </button>
          <button className={`btn ${activeTab === "INVENTORY" ? "btn-primary" : "btn-outline"}`} style={{ justifyContent: "flex-start", width: "100%", border: "none" }} onClick={() => setActiveTab("INVENTORY")}>
            <Save size={18} /> Stock Tracking
          </button>
          <button className={`btn ${activeTab === "REPORTS" ? "btn-primary" : "btn-outline"}`} style={{ justifyContent: "flex-start", width: "100%", border: "none" }} onClick={() => setActiveTab("REPORTS")}>
            <BarChart3 size={18} /> Analytics
          </button>
        </div>

        {/* Main Content */}
        <div>
          {loading && !orders.length ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}><div className="spinner" style={{ borderColor: "var(--cams-primary)" }} /></div>
          ) : (
            <>
              {/* ─── ORDERS TAB ─── */}
              {activeTab === "ORDERS" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2>Live Orders</h2>
                    <button onClick={fetchData} className="btn btn-outline" style={{ padding: "6px 12px" }}>Refresh</button>
                  </div>

                  {orders.length === 0 && <div className="card" style={{color: "var(--cams-text-muted)"}}>No orders have been placed yet.</div>}

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {orders.map((order) => {
                      const action = getNextAction(order.status);
                      return (
                        <div key={order.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                              <h3 style={{ margin: 0, fontSize: "1rem" }}>Order #{order.id.slice(0, 8)}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "var(--cams-text-muted)", marginBottom: "8px" }}>
                              <strong>{order.customer.name}</strong> · {order.customer.email}
                            </div>
                            <ul style={{ listStyle: "none", padding: 0, fontSize: "0.9rem", color: "var(--cams-text-muted)" }}>
                              {order.items.map((i: any) => (
                                <li key={i.id} style={{ marginBottom: "2px" }}>
                                  {i.quantity}× {i.menuItem.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "24px" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--cams-text-muted)", marginBottom: "4px" }}>
                              {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px" }}>₹{order.totalAmount}</div>
                            {action && (
                              <button
                                onClick={() => handleStatusUpdate(order.id, action.next)}
                                className="btn"
                                style={{ padding: "8px 16px", background: action.color, color: "white", fontSize: "0.85rem" }}
                              >
                                {action.label}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── KITCHEN TAB ─── */}
              {activeTab === "KITCHEN" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{color: "var(--cams-danger)", fontSize: "2rem"}}>Kitchen Queue</h2>
                    <span className="badge badge-warning" style={{fontSize: "1rem"}}>Live Mode Active</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                    {orders.filter((o) => o.status === 'PENDING').map((order) => (
                      <div key={order.id} className="card" style={{ border: "2px solid var(--cams-warning)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                          <h3 style={{ margin: 0, fontSize: "1.5rem" }}>#{order.id.slice(0, 4)}</h3>
                          <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, fontSize: "1.2rem", fontWeight: 500, marginBottom: "24px" }}>
                          {order.items.map((i: any) => (
                            <li key={i.id} style={{ marginBottom: "8px", borderBottom: "1px dashed #eee", paddingBottom: "8px" }}>
                              {i.quantity}× <span style={{color: "var(--cams-primary)"}}>{i.menuItem.name}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'READY')}
                          className="btn"
                          style={{ padding: "16px", background: "var(--cams-success)", color: "white", width: "100%", fontSize: "1.2rem", fontWeight: "bold" }}
                        >
                          Mark Ready
                        </button>
                      </div>
                    ))}
                    {orders.filter((o) => o.status === 'PENDING').length === 0 && <h3 style={{color: "var(--cams-text-muted)"}}>No pending orders. Good job!</h3>}
                  </div>
                </div>
              )}

              {/* ─── MENU TAB ─── */}
              {activeTab === "MENU" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2>Menu Layout</h2>
                    <button onClick={()=>setShowCatModal(true)} className="btn btn-secondary"><Plus size={18} /> Add Category</button>
                  </div>

                  {categories.length === 0 && <div className="card" style={{color: "var(--cams-text-muted)"}}>No categories mapped. Build one!</div>}

                  {categories.map((cat) => (
                    <div key={cat.id} className="card" style={{ marginBottom: "24px" }}>
                      <h3 style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {cat.name}
                        <button onClick={()=>setShowItemModal(cat.id)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                          <Plus size={14} /> Assign Item
                        </button>
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                        {cat.items.length === 0 && <span style={{fontSize: "0.85rem", color: "var(--cams-text-muted)"}}>No items assigned here yet...</span>}
                        {cat.items.map((item: any) => (
                          <div key={item.id} style={{ padding: "16px", border: "1px solid var(--cams-border)", borderRadius: "var(--radius-md)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                              <strong style={{ color: "var(--cams-primary)" }}>{item.name}</strong>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span style={{ fontWeight: 600 }}>₹{item.price}</span>
                                <Edit2 size={16} style={{cursor:"pointer", color: "var(--cams-text-muted)"}} onClick={() => setEditItemModalData(item)} />
                                <Trash2 size={16} style={{cursor:"pointer", color: "var(--cams-danger)"}} onClick={async () => {
                                  if (confirm(`Delete ${item.name}?`)) {
                                    try {
                                      await api.delete(`/menu/items/${item.id}`);
                                      fetchData();
                                    } catch (e) { alert("Failed: " + getErrorMessage(e)) }
                                  }
                                }} />
                              </div>
                            </div>
                            <span className={`badge ${item.isAvailable ? "badge-success" : "badge-danger"}`}>
                              {item.isAvailable ? "Live & Ready" : "Stock Empty"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ─── INVENTORY TAB ─── */}
              {activeTab === "INVENTORY" && (
                <div className="card">
                  <h2 style={{ marginBottom: "24px" }}>Stock Control</h2>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--cams-border)", color: "var(--cams-text-muted)" }}>
                        <th style={{ padding: "12px" }}>Item</th>
                        <th style={{ padding: "12px" }}>Threshold</th>
                        <th style={{ padding: "12px" }}>Update Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((inv: any) => (
                        <tr key={inv.id} style={{ borderBottom: "1px solid var(--cams-border)" }}>
                          <td style={{ padding: "16px 12px", fontWeight: 500 }}>{inv.menuItem.name} <span style={{fontSize:"0.8rem", color: "var(--cams-text-muted)", marginLeft:"8px"}}>{inv.menuItem.category.name}</span></td>
                          <td style={{ padding: "16px 12px", color: "var(--cams-text-muted)" }}>{inv.lowStockThreshold} units</td>
                          <td style={{ padding: "16px 12px" }}>
                            <InlineInventoryEditor item={inv} onSaved={fetchData} />
                            {inv.stockCount <= inv.lowStockThreshold && (
                              <div style={{ color: "var(--cams-danger)", fontSize: "0.8rem", marginTop: "4px" }}>⚠ Low stock alert!</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ─── REPORTS TAB ─── */}
              {activeTab === "REPORTS" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  {salesReport && (
                    <div className="card">
                      <h2 style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><BarChart3 color="var(--cams-primary)" size={24}/> Sales Analytics</h2>
                      <div style={{ display: "flex", gap: "24px", margin: "24px 0" }}>
                        <div style={{ flex: 1, padding: "24px", background: "var(--cams-surface-layered)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ fontSize: "0.9rem", color: "var(--cams-text-muted)", marginBottom: "8px" }}>Total Revenue</div>
                          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--cams-primary)" }}>₹{salesReport.totalRevenue}</div>
                        </div>
                        <div style={{ flex: 1, padding: "24px", background: "var(--cams-surface-layered)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ fontSize: "0.9rem", color: "var(--cams-text-muted)", marginBottom: "8px" }}>Completed Orders</div>
                          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--cams-primary)" }}>{salesReport.totalOrders}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!salesReport && <div className="card" style={{color: "var(--cams-text-muted)"}}>No sales data yet. Reports will appear after orders are completed.</div>}
                  {salesReport && (
                    <div className="card" style={{ borderTop: "4px solid var(--cams-primary)" }}>
                      <h2 style={{ marginBottom: "24px" }}>Top Ordered Items</h2>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid var(--cams-border)", color: "var(--cams-text-muted)" }}>
                            <th style={{ padding: "12px" }}>Item Name</th>
                            <th style={{ padding: "12px" }}>Quantity Sold</th>
                            <th style={{ padding: "12px" }}>Revenue Generated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesReport.breakdown && salesReport.breakdown.slice(0, 5).map((item: any, i: number) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--cams-border)" }}>
                              <td style={{ padding: "16px 12px", fontWeight: 500 }}>#{i+1} {item.name}</td>
                              <td style={{ padding: "16px 12px", color: "var(--cams-text-muted)" }}>{item.qtySold} units</td>
                              <td style={{ padding: "16px 12px", fontWeight: "bold", color: "var(--cams-success)" }}>₹{item.revenue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {inventoryReport && (
                    <div className="card" style={{ borderTop: "4px solid var(--cams-secondary)" }}>
                      <h2 style={{ marginBottom: "24px" }}>Inventory Valuation</h2>
                      <div style={{ padding: "24px", background: "#FFF3E0", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "0.9rem", color: "var(--cams-warning)", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase" }}>Total Stock Value</div>
                          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--cams-text)" }}>₹{inventoryReport.totalCapitalValue}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                           <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--cams-danger)", marginBottom: "4px" }}>{inventoryReport.criticalRisks} Critical Items</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
