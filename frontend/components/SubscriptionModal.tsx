import React, { useState } from "react";
import { BillingCycle, Subscription } from "../types";
import { parseSmartAdd } from "../services/geminiService";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sub: Omit<Subscription, "id">) => void;
}

const SubscriptionModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [smartInput, setSmartInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    billingDate: "1",
    cycle: BillingCycle.MONTHLY,
    category: "Entertainment",
    color: "#ff7f50",
  });

  if (!isOpen) return null;

  const handleSmartAdd = async () => {
    if (!smartInput.trim()) return;
    setIsAiLoading(true);
    const result = await parseSmartAdd(smartInput);
    if (result) {
      setFormData({
        name: result.name || "",
        amount: result.amount?.toString() || "",
        billingDate:
          result.billing_date?.toString() ||
          result.billingDate?.toString() ||
          "1",
        cycle:
          result.cycle === "YEARLY"
            ? BillingCycle.YEARLY
            : BillingCycle.MONTHLY,
        category: result.category || "General",
        color: "#ff7f50",
      });
      setSmartInput("");
    }
    setIsAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      amount: parseFloat(formData.amount),
      billing_date: parseInt(formData.billingDate),
      cycle: formData.cycle,
      category: formData.category,
      icon: "fa-solid fa-cube",
      color: formData.color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1c1c1e] w-full max-w-md rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add Subscription</h2>
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
                className="flex-1 bg-[#2c2c2e] border border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 ring-orange-500 outline-none"
              />
              <button
                onClick={handleSmartAdd}
                disabled={isAiLoading}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition disabled:opacity-50"
              >
                {isAiLoading ? (
                  <i className="fa-solid fa-spinner animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                )}
              </button>
            </div>
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
                Create Subscription
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
