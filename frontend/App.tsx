/* ==========================================================================
   SECTION 1: IMPORTS & TYPES
   ========================================================================== */
import React, { useState, useEffect, useMemo } from "react";
import { Subscription, BillingCycle, InsightReport } from "./types";
import { MONTH_NAMES } from "./constants";
import Calendar from "./components/Calendar";
import SubscriptionModal from "./components/SubscriptionModal";
import Alert from "./components/Alert";
import { useAlert } from "./hooks/useAlert";
import {
  getSubscriptionInsights,
  subscriptionApi,
} from "./services/geminiService";

/* ==========================================================================
   SECTION 2: MAIN COMPONENT & STATE MANAGEMENT
   ========================================================================== */
const App: React.FC = () => {
  // -- Alert Management --
  const { alert, showError, showSuccess, showConfirm, closeAlert } = useAlert();

  // -- Data State --
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [insights, setInsights] = useState<InsightReport | null>(null);

  // -- UI/Navigation State --
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // -- Modal & Menu State --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New: Mobile Menu
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);

  // -- Async Status State --
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ==========================================================================
     SECTION 3: EFFECTS & DATA FETCHING
     ========================================================================== */
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await subscriptionApi.getAll();
      setSubscriptions(data);
    } catch (err) {
      setError("Failed to load subscriptions. Please check your connection.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setIsInsightLoading(true);
      const report = await getSubscriptionInsights(subscriptions);
      setInsights(report);
    } catch (err) {
      // Non-blocking error for insights
      console.error("Failed to load insights", err);
    } finally {
      setIsInsightLoading(false);
    }
  };

  /* ==========================================================================
     SECTION 4: COMPUTED VALUES (USEMEMO)
     ========================================================================== */
  // Calculate total monthly cost (normalizing yearly subs)
  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((acc, sub) => {
      return sub.cycle === BillingCycle.MONTHLY
        ? acc + sub.amount
        : acc + sub.amount / 12;
    }, 0);
  }, [subscriptions]);

  // Subscriptions for the selected calendar date
  const activeDaySubs = useMemo(() => {
    if (!selectedDate) return [];
    return subscriptions.filter(
      (s) => s.billing_date === selectedDate.getDate(),
    );
  }, [selectedDate, subscriptions]);

  // Global search filter
  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) return subscriptions;
    const query = searchQuery.toLowerCase();
    return subscriptions.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query),
    );
  }, [searchQuery, subscriptions]);

  // Category breakdown logic
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {};

    filteredSubscriptions.forEach((sub) => {
      if (!stats[sub.category]) {
        stats[sub.category] = { count: 0, total: 0 };
      }
      stats[sub.category].count += 1;
      stats[sub.category].total +=
        sub.cycle === BillingCycle.MONTHLY ? sub.amount : sub.amount / 12;
    });

    return Object.entries(stats)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [filteredSubscriptions]);

  // Filter list by selected category
  const categoryFilteredSubs = useMemo(() => {
    if (!selectedCategory) return [];
    return filteredSubscriptions.filter((s) => s.category === selectedCategory);
  }, [selectedCategory, filteredSubscriptions]);

  /* ==========================================================================
     SECTION 5: EVENT HANDLERS (CRUD & UI)
     ========================================================================== */
  // Date Navigation
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // CRUD Operations
  const handleAddSubscription = async (newSub: Omit<Subscription, "id">) => {
    try {
      await subscriptionApi.create(newSub);
      await loadSubscriptions();
      setIsModalOpen(false);
      showSuccess("Success", "Subscription added successfully!");
    } catch (err) {
      console.error(err);
      showError("Failed", "Failed to add subscription. Please try again.");
    }
  };

  const handleUpdateSubscription = async (
    id: string,
    updatedSub: Omit<Subscription, "id">,
  ) => {
    try {
      await subscriptionApi.update(id, updatedSub);
      await loadSubscriptions();
      setEditingSubscription(null);
      setIsModalOpen(false);
      showSuccess("Success", "Subscription updated successfully!");
    } catch (err) {
      console.error(err);
      showError("Failed", "Failed to update subscription. Please try again.");
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    showConfirm(
      "Delete Subscription",
      "Are you sure you want to delete this subscription? This action cannot be undone.",
      async () => {
        try {
          await subscriptionApi.delete(id);
          await loadSubscriptions();
          showSuccess("Deleted", "Subscription deleted successfully!");
        } catch (err) {
          console.error(err);
          showError("Failed", "Failed to delete subscription. Please try again.");
        }
      },
      "Delete",
      "Cancel",
    );
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  /* ==========================================================================
     SECTION 6: RENDER HELPERS (LOADING & ERROR)
     ========================================================================== */
  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f10] text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-[#1c1c1e] p-8 rounded-3xl border border-red-900/30 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
          </div>
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6 text-sm">{error}</p>
          <button
            onClick={loadSubscriptions}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium text-sm tracking-widest uppercase">
            Loading Data...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     SECTION 7: MAIN LAYOUT & RENDER
     ========================================================================== */
  return (
    <div className="min-h-screen bg-[#0f0f10] text-gray-100 flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* --- Mobile Sidebar Overlay --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR AREA --- */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-[#0f0f10]/95 lg:bg-transparent 
        backdrop-blur-xl lg:backdrop-blur-none border-r border-gray-800 
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="h-full flex flex-col p-6 overflow-y-auto scrollbar-hide">
          {/* Brand */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <i className="fa-solid fa-layer-group text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none">
                  SubTrack
                </h1>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  AI Powered
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-gray-400"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full bg-[#1c1c1e] border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          {/* Total Summary Card */}
          <div className="bg-gradient-to-br from-[#2c2c2e] to-[#1c1c1e] p-5 rounded-3xl mb-8 border border-gray-700/50 shadow-lg">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
              Total Monthly
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                ${monthlyTotal.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-400/10 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 min-h-0 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Categories
              </h2>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-[10px] text-orange-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-2">
              {categoryStats.length > 0 ? (
                categoryStats.map((stat) => (
                  <button
                    key={stat.category}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === stat.category
                          ? null
                          : stat.category,
                      )
                    }
                    className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all group ${
                      selectedCategory === stat.category
                        ? "bg-orange-500 text-white shadow-orange-500/20 shadow-md"
                        : "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold capitalize">
                        {stat.category}
                      </span>
                      <span
                        className={`text-[10px] ${selectedCategory === stat.category ? "text-orange-100" : "text-gray-500"}`}
                      >
                        {stat.count} items
                      </span>
                    </div>
                    <span className="text-xs font-bold">
                      ${stat.total.toFixed(2)}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-600 italic">
                  No categories found.
                </p>
              )}
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="mt-auto pt-6 border-t border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles text-orange-500"></i>{" "}
                AI Insights
              </h2>
              <button
                onClick={fetchInsights}
                disabled={isInsightLoading}
                className="text-gray-500 hover:text-white transition"
              >
                <i
                  className={`fa-solid fa-rotate-right ${isInsightLoading ? "animate-spin" : ""}`}
                ></i>
              </button>
            </div>

            {insights ? (
              <div className="bg-[#1c1c1e] p-4 rounded-2xl border border-gray-800">
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  {insights.summary}
                </p>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <i className="fa-solid fa-arrow-trend-up"></i>
                  <span>
                    Projected: ${insights.totalProjected.toLocaleString()}/yr
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={fetchInsights}
                className="w-full py-3 rounded-2xl border border-dashed border-gray-700 text-gray-500 text-xs hover:bg-[#1c1c1e] hover:text-orange-500 transition"
              >
                Generate Analysis
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Header */}
        <header className="px-6 py-5 border-b border-gray-800 flex items-center justify-between bg-[#0f0f10]/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-300 hover:text-white"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-white">
                {MONTH_NAMES[currentDate.getMonth()]}{" "}
                <span className="text-gray-500">
                  {currentDate.getFullYear()}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#1c1c1e] rounded-xl p-1 border border-gray-800">
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#2c2c2e] rounded-lg text-gray-400 hover:text-white transition"
              >
                <i className="fa-solid fa-chevron-left text-xs"></i>
              </button>
              <button
                onClick={goToToday}
                className="px-3 text-xs font-bold hover:bg-[#2c2c2e] rounded-lg text-gray-300 hover:text-white transition"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#2c2c2e] rounded-lg text-gray-400 hover:text-white transition"
              >
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black hover:bg-gray-200 font-bold py-2 px-4 rounded-xl text-sm transition flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>{" "}
              <span className="hidden sm:inline">Add New</span>
            </button>
          </div>
        </header>

        {/* Content Body: Calendar & Detail List */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Calendar View */}
          <section className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-hide">
            <Calendar
              currentDate={currentDate}
              onDateClick={setSelectedDate}
              selectedDate={selectedDate}
              subscriptions={filteredSubscriptions}
            />
          </section>

          {/* Details Panel (Right Side) */}
          <aside className="w-full lg:w-96 bg-[#161618] border-l border-gray-800 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-lg">
                  {selectedCategory
                    ? `${selectedCategory} Subscriptions`
                    : "Details"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedCategory
                    ? `All subscriptions in this category`
                    : selectedDate?.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                </p>
              </div>
              <span className="bg-gray-800 text-gray-300 text-[10px] px-2.5 py-1 rounded-full font-bold">
                {selectedCategory
                  ? categoryFilteredSubs.length
                  : activeDaySubs.length}{" "}
                SUBS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {(selectedCategory ? categoryFilteredSubs : activeDaySubs)
                .length > 0 ? (
                (selectedCategory ? categoryFilteredSubs : activeDaySubs).map(
                  (sub) => (
                    <div
                      key={sub.id}
                      className="group bg-[#1c1c1e] hover:bg-[#252527] p-4 rounded-2xl transition border border-transparent hover:border-gray-700"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                          style={{
                            backgroundColor: `${sub.color}20`,
                            color: sub.color,
                          }}
                        >
                          <i className={sub.icon}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm text-gray-200 truncate pr-2">
                              {sub.name}
                            </h4>
                            <span className="font-mono font-bold text-white">
                              ${sub.amount}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-3">
                            {sub.category} • {sub.cycle}{" "}
                            {selectedCategory &&
                              sub.billing_date &&
                              `• Day ${sub.billing_date}`}
                          </p>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(sub)}
                              className="flex-1 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-gray-300 text-[10px] font-bold py-1.5 rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubscription(sub.id)}
                              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold py-1.5 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <i className="fa-solid fa-mug-hot text-2xl text-gray-500"></i>
                  </div>
                  <p className="text-sm font-medium text-gray-400">
                    {selectedCategory
                      ? "No subscriptions in this category."
                      : "No payments due."}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedCategory
                      ? "Try selecting another category."
                      : "Enjoy your day!"}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* --- MODALS --- */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubscription(null);
        }}
        onAdd={handleAddSubscription}
        onUpdate={handleUpdateSubscription}
        editingSubscription={editingSubscription}
      />

      {/* --- CUSTOM ALERT --- */}
      <Alert
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        onClose={closeAlert}
      />
    </div>
  );
};

export default App;
