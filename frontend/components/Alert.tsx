import React from "react";

export type AlertType = "success" | "error" | "warning" | "info" | "confirm";

export interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertProps extends AlertConfig {
  isOpen: boolean;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({
  isOpen,
  type,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: "fa-circle-check",
      color: "emerald",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-500",
    },
    error: {
      icon: "fa-triangle-exclamation",
      color: "red",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-500",
    },
    warning: {
      icon: "fa-exclamation",
      color: "amber",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-500",
    },
    info: {
      icon: "fa-circle-info",
      color: "blue",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-500",
    },
    confirm: {
      icon: "fa-question-circle",
      color: "orange",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      textColor: "text-orange-500",
    },
  };

  const config = typeConfig[type];
  const isConfirmType = type === "confirm";

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`${config.bgColor} w-full max-w-sm rounded-3xl overflow-hidden border ${config.borderColor} shadow-2xl`}>
        <div className="p-6">
          {/* Icon & Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor} border ${config.borderColor}`}>
              <i className={`fa-solid ${config.icon} ${config.textColor} text-xl`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-lg ${config.textColor}`}>{title}</h3>
            </div>
          </div>

          {/* Message */}
          <p className="text-gray-300 text-sm leading-relaxed mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            {isConfirmType && (
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition ${
                type === "error"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : type === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : type === "warning"
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : type === "confirm"
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
