import React, { useState, useEffect } from "react";
import { BillingCycle, Subscription } from "../types";
import { parseSmartAdd } from "../services/geminiService";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sub: Omit<Subscription, "id">) => void;
  onUpdate?: (id: string, sub: Omit<Subscription, "id">) => void;
  editingSubscription?: Subscription | null;
}

// Icon mapping by category
const ICON_BY_CATEGORY: Record<string, string> = {
  Entertainment: "fa-solid fa-film",
  Streaming: "fa-solid fa-play",
  Music: "fa-solid fa-music",
  Software: "fa-solid fa-computer",
  Cloud: "fa-solid fa-cloud",
  Office: "fa-solid fa-file-text",
  Design: "fa-solid fa-palette",
  Health: "fa-solid fa-heart",
  Fitness: "fa-solid fa-dumbbell",
  Gaming: "fa-solid fa-gamepad",
  Social: "fa-solid fa-share-nodes",
  Education: "fa-solid fa-book",
  Shopping: "fa-solid fa-shopping-bag",
  News: "fa-solid fa-newspaper",
  Productivity: "fa-solid fa-list-check",
  VPN: "fa-solid fa-shield",
  Storage: "fa-solid fa-database",
  Communication: "fa-solid fa-comments",
  General: "fa-solid fa-cube",
};

const CATEGORY_OPTIONS = Object.keys(ICON_BY_CATEGORY);

const COLOR_PALETTE = [
  "#FF6B6B", // Red
  "#FF8E72", // Orange-Red
  "#FF7F50", // Coral
  "#FFB84D", // Gold
  "#FFD93D", // Yellow
  "#6BCB77", // Green
  "#4D96FF", // Blue
  "#6C5CE7", // Purple
  "#A29BFE", // Light Purple
  "#FD79A8", // Pink
];

const SubscriptionModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  editingSubscription,
}) => {
  const [smartInput, setSmartInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    billingDate: "1",
    cycle: BillingCycle.MONTHLY,
    category: "Entertainment",
    color: "#ff7f50",
    icon: "fa-solid fa-film",
  });

  useEffect(() => {
    if (editingSubscription) {
      setFormData({
        name: editingSubscription.name,
        amount: editingSubscription.amount.toString(),
        billingDate: editingSubscription.billing_date.toString(),
        cycle: editingSubscription.cycle,
        category: editingSubscription.category,
        color: editingSubscription.color,
      });
    } else {
      setFormData({
        name: "",
        amount: "",
        billingDate: "1",
        cycle: BillingCycle.MONTHLY,
        category: "Entertainment",
        color: "#ff7f50",
        icon: "fa-solid fa-film",
      });
    }
    setSmartInput("");
    setAiError(null);
    setAiSuccess(false);
  }, [editingSubscription, isOpen]);

  if (!isOpen) return null;

  const handleSmartAdd = async () => {
    if (!smartInput.trim()) {
      setAiError("Please enter a subscription description");
      return;
    }
    setIsAiLoading(true);
    setAiError(null);
    setAiSuccess(false);

    try {
      const result = await parseSmartAdd(smartInput);
      
      if (result && typeof result === "object") {
        const typedResult = result as any;
        const selectedCategory = typedResult.category || "General";
        setFormData({
          name: typedResult.name || "",
          amount: typedResult.amount?.toString() || "",
          billingDate:
            typedResult.billing_date?.toString() ||
            typedResult.billingDate?.toString() ||
            "1",
          cycle:
            typedResult.cycle === "YEARLY"
              ? BillingCycle.YEARLY
              : BillingCycle.MONTHLY,
          category: selectedCategory,
          color: "#ff7f50",
          icon: ICON_BY_CATEGORY[selectedCategory] || ICON_BY_CATEGORY.General,
        });
        setSmartInput("");
        setAiSuccess(true);
        setTimeout(() => setAiSuccess(false), 3000);
      } else {
        setAiError("Could not parse the subscription. Try a different format.");
      }
    } catch (error) {
      console.error("Smart Add error:", error);
      setAiError(
        error instanceof Error
          ? error.message
          : "Failed to parse subscription. Please try again."
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      billing_date: parseInt(formData.billingDate),
      cycle: formData.cycle,
      category: formData.category,
      icon: formData.icon,
      color: formData.color,
    };

    if (editingSubscription && onUpdate) {
      onUpdate(editingSubscription.id, newData);
    } else {
      onAdd(newData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1c1c1e] w-full max-w-md rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {editingSubscription ? "Edit Subscription" : "Add Subscription"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="mb-6 space-y-2">
            <label className="text-xs text-gray-400 font-bold uppercase">
              Smart Magic Add (AI)
            </label>
            <div className="flex gap-2">
              <input
                value={smartInput}
                onChange={(e) => setSmartInput(e.target.value)}
                placeholder="e.g. Netflix 15.99 every 15th"
                disabled={!!editingSubscription}
                className="flex-1 bg-[#2c2c2e] border border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 ring-orange-500 outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSmartAdd}
                disabled={isAiLoading || !!editingSubscription}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
              >
                {isAiLoading ? (
                  <i className="fa-solid fa-spinner animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                )}
              </button>
            </div>
            {aiError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5 flex-shrink-0"></i>
                <p className="text-xs text-red-400">{aiError}</p>
              </div>
            )}
            {aiSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2">
                <i className="fa-solid fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0"></i>
                <p className="text-xs text-emerald-400">Subscription parsed successfully! Review and adjust if needed.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase">
                  Service Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#2c2c2e] border border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-1 ring-orange-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase">
                  Amount ($)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full bg-[#2c2c2e] border border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-1 ring-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase">
                  Billing Day
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="31"
                  value={formData.billingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, billingDate: e.target.value })
                  }
                  className="w-full bg-[#2c2c2e] border border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-1 ring-orange-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase">
                  Cycle
                </label>
                <select
                  value={formData.cycle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cycle: e.target.value as BillingCycle,
                    })
                  }
                  className="w-full bg-[#2c2c2e] border border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-1 ring-orange-500 outline-none"
                >
                  <option value={BillingCycle.MONTHLY}>Monthly</option>
                  <option value={BillingCycle.YEARLY}>Yearly</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-orange-500/20"
              >
                {editingSubscription
                  ? "Update Subscription"
                  : "Create Subscription"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
