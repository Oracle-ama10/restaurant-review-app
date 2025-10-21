// frontend/src/App.jsx
import { useEffect, useState } from "react";
import RestaurantList from "./components/RestaurantList";
import RestaurantDetail from "./components/RestaurantDetail";
import FilterPanel from "./components/FilterPanel";
import SearchBar from "./components/SearchBar";
import "./App.css";

function App() {
    const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

    // ฟิลเตอร์หลัก (ควบคุมที่ App)
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        minRating: "",
        priceRange: "",
        sortBy: "", // เผื่อไว้ให้ FilterPanel ใช้
    });

    // เดบาวน์ช่องค้นหา
    const [searchInput, setSearchInput] = useState("");
    useEffect(() => {
        const t = setTimeout(() => {
            setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
        }, 500);
        return () => clearTimeout(t);
    }, [searchInput]);

    const handleFilterChange = (partial) =>
        setFilters((prev) => ({ ...prev, ...partial }));

    // ===== Stats (โชว์ที่ Header) =====
    const [stats, setStats] = useState(null);
    const [statsErr, setStatsErr] = useState("");
    useEffect(() => {
        const controller = new AbortController();
        const API =
            (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
            (typeof process !== "undefined" && process.env?.VITE_API_URL) ||
            "http://localhost:3000/api";

        (async () => {
            try {
                setStatsErr("");
                const res = await fetch(`${API}/stats`, { signal: controller.signal });
                const data = await res.json();
                if (!res.ok || !data?.success) {
                    throw new Error(data?.message || "โหลดสถิติไม่สำเร็จ");
                }
                setStats(data.data);
            } catch (e) {
                if (e.name !== "AbortError") setStatsErr(e.message || "โหลดสถิติไม่สำเร็จ");
            }
        })();

        return () => controller.abort();
    }, []);

    return (
        <div className="app">
            {/* ===== Header / Hero ===== */}
            <header className="app-header" role="banner" aria-label="หัวข้อแอป">
                <h1>🍜 Restaurant Review</h1>
                <p>ค้นหาและรีวิวร้านอาหารโปรดของคุณ</p>

                {/* สถิติแบบ badge เข้าธีม */}
                <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {stats ? (
                        <>
                            <span className="badge">ร้านทั้งหมด: {stats.totalRestaurants ?? 0}</span>
                            <span className="badge">รีวิวทั้งหมด: {stats.totalReviews ?? 0}</span>
                            <span className="badge">เรตติ้งเฉลี่ย: {stats.averageRating ?? 0}</span>
                        </>
                    ) : statsErr ? (
                        <span className="badge">สถิติชั่วคราวไม่พร้อมใช้งาน</span>
                    ) : (
                        <span className="badge">กำลังโหลดสถิติ…</span>
                    )}
                </div>
            </header>

            {/* ===== Main ===== */}
            <main className="app-main" role="main">
                {selectedRestaurantId ? (
                    <RestaurantDetail
                        restaurantId={selectedRestaurantId}
                        onBack={() => setSelectedRestaurantId(null)}
                    />
                ) : (
                    <>
                        {/* รายการร้าน */}
                        <section aria-label="รายการร้านอาหาร">
                            <RestaurantList
                                filters={filters}
                                onSelectRestaurant={(id) => setSelectedRestaurantId(id)}
                            />
                        </section>
                    </>
                )}
            </main>

            {/* ===== Footer ===== */}
            <footer className="app-footer" role="contentinfo">
                <p>&copy; 2024 Restaurant Review App | สร้างด้วย React + Express</p>
            </footer>
        </div>
    );
}

export default App;