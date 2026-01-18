import React, { useState, useEffect, useMemo } from "react";
import { Subscription, BillingCycle, InsightReport } from "./types";
import { MONTH_NAMES } from "./constants";
import Calendar from "./components/Calendar";
import SubscriptionModal from "./components/SubscriptionModal";
import {
  getSubscriptionInsights,
  subscriptionApi,
} from "./services/geminiService";

const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insights, setInsights] = useState<InsightReport | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subscriptions on mount
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
      setError("Failed to load subscriptions");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Totals
  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((acc, sub) => {
      if (sub.cycle === BillingCycle.MONTHLY) return acc + sub.amount;
      return acc + sub.amount / 12;
    }, 0);
  }, [subscriptions]);

  const activeDaySubs = useMemo(() => {
    if (!selectedDate) return [];
    return subscriptions.filter(
      (s) => s.billing_date === selectedDate.getDate(),
    );
  }, [selectedDate, subscriptions]);

  const fetchInsights = async () => {
    try {
      setIsInsightLoading(true);
      const report = await getSubscriptionInsights(subscriptions);
      setInsights(report);
    } catch (err) {
      setError("Failed to load insights");
      console.error(err);
    } finally {
      setIsInsightLoading(false);
    }
  };

  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleAddSubscription = async (newSub: Omit<Subscription, "id">) => {
    try {
      setError(null);
      await subscriptionApi.create(newSub);
      await loadSubscriptions();
    } catch (err) {
      setError("Failed to add subscription");
      console.error(err);
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      setError(null);
      await subscriptionApi.delete(id);
      await loadSubscriptions();
    } catch (err) {
      setError("Failed to delete subscription");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-gray-100 flex flex-col lg:flex-row">
      {/* Sidebar: Analytics & Insights */}
      <aside className="w-full lg:w-80 glass-panel lg:h-screen p-6 overflow-y-auto border-r border-gray-800 scrollbar-hide">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <i className="fa-solid fa-calendar-check text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight">SubTrack AI</h1>
        </div>

        <div className="bg-[#2c2c2e] p-5 rounded-3xl mb-6 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">
            Monthly Average
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">
              ${monthlyTotal.toFixed(2)}
            </span>
            <span className="text-xs text-green-400 font-medium">
              +2.5% vs last mo
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">
              AI Insights
            </h2>
            <button
              onClick={fetchInsights}
              disabled={isInsightLoading}
              className="text-xs text-orange-500 hover:text-orange-400 transition flex items-center gap-1 font-bold"
            >
              {isInsightLoading ? (
                <i className="fa-solid fa-spinner animate-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-sparkles"></i> Refresh
                </>
              )}
            </button>
          </div>

          {insights ? (
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                <p className="text-xs leading-relaxed text-orange-100/80">
                  {insights.summary}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase">
                  Saving Tips
                </p>
                {insights.savingsOpportunities.map((tip, i) => (
                  <div
                    key={i}
                    className="flex gap-2 text-xs text-gray-300 items-start"
                  >
                    <i className="fa-solid fa-check text-green-500 mt-0.5"></i>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-800">
                <p className="text-[10px] font-bold text-gray-500 uppercase">
                  Projected Yearly
                </p>
                <p className="text-xl font-bold text-white">
                  ${insights.totalProjected.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fa-solid fa-wand-magic-sparkles text-3xl text-gray-700 mb-3 block"></i>
              <p className="text-xs text-gray-500">
                Click refresh to get AI-powered budget analysis.
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 text-[10px] text-gray-600 font-medium border-t border-gray-800">
          <p>© 2024 SubTrack AI. Secure billing tracker.</p>
        </div>
      </aside>

      {/* Main Content: Calendar */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {MONTH_NAMES[currentDate.getMonth()]}, {currentDate.getFullYear()}
            </h2>
            <div className="flex bg-[#1c1c1e] rounded-xl p-1 border border-gray-800">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-[#2c2c2e] rounded-lg transition"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                onClick={goToToday}
                className="px-3 text-xs font-bold hover:bg-[#2c2c2e] rounded-lg transition uppercase"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-[#2c2c2e] rounded-lg transition"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 mr-4 text-[10px] font-bold text-gray-500 tracking-widest uppercase">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>{" "}
                Monthly
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>{" "}
                Yearly
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-2xl transition shadow-lg shadow-orange-500/20 flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add New</span>
            </button>
          </div>
        </header>

        <section className="flex-1 px-6 pb-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:max-w-3xl">
            <Calendar
              currentDate={currentDate}
              onDateClick={setSelectedDate}
              selectedDate={selectedDate}
              subscriptions={subscriptions}
            />
          </div>

          <div className="lg:w-80 flex flex-col gap-6">
            <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-gray-800 flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">
                  Payments:{" "}
                  {selectedDate?.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                <span className="bg-orange-500/20 text-orange-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                  {activeDaySubs.length} Items
                </span>
              </div>

              {activeDaySubs.length > 0 ? (
                <div className="space-y-4 overflow-y-auto max-h-[500px] scrollbar-hide">
                  {activeDaySubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="group relative flex items-center gap-4 p-3 hover:bg-[#2c2c2e] rounded-2xl transition border border-transparent hover:border-gray-700"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800">
                        <i
                          className={`${sub.icon} text-xl`}
                          style={{ color: sub.color }}
                        ></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{sub.name}</h4>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                          {sub.cycle}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">
                          ${sub.amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => deleteSubscription(sub.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition text-[10px] uppercase font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center text-gray-600">
                  <i className="fa-solid fa-calendar-xmark text-4xl mb-4 opacity-20"></i>
                  <p className="text-sm font-medium">No bills for this date.</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-xl shadow-purple-900/10">
              <h4 className="font-bold text-white mb-2">Pro Plan Benefit</h4>
              <p className="text-xs text-indigo-100/70 mb-4 leading-relaxed">
                Unlock advanced charts and automatic bill scanning with our Pro
                version.
              </p>
              <button className="w-full bg-white text-indigo-700 text-xs font-black py-3 rounded-2xl hover:bg-indigo-50 transition uppercase tracking-widest">
                Upgrade Now
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Toolbar for Mobile */}
        <div className="lg:hidden p-4 glass-panel border-t border-gray-800 flex justify-around items-center sticky bottom-0">
          <button className="text-orange-500">
            <i className="fa-solid fa-calendar text-xl"></i>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
          <button className="text-gray-500">
            <i className="fa-solid fa-chart-pie text-xl"></i>
          </button>
        </div>
      </main>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSubscription}
      />
    </div>
  );
};

export default App;
