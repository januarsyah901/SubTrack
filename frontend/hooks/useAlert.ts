import { useState, useCallback } from "react";
import { AlertConfig, AlertType } from "../components/Alert";

export interface AlertState extends AlertConfig {
  isOpen: boolean;
}

const initialState: AlertState = {
  isOpen: false,
  type: "info",
  title: "",
  message: "",
};

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>(initialState);

  const showAlert = useCallback(
    (config: Omit<AlertConfig, "isOpen">) => {
      setAlert({
        ...config,
        isOpen: true,
      });
    },
    [],
  );

  const showSuccess = useCallback((title: string, message: string) => {
    showAlert({
      type: "success",
      title,
      message,
      confirmText: "OK",
    });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string) => {
    showAlert({
      type: "error",
      title,
      message,
      confirmText: "OK",
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string) => {
    showAlert({
      type: "warning",
      title,
      message,
      confirmText: "OK",
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string) => {
    showAlert({
      type: "info",
      title,
      message,
      confirmText: "OK",
    });
  }, [showAlert]);

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void | Promise<void>,
      confirmText = "Confirm",
      cancelText = "Cancel",
    ) => {
      showAlert({
        type: "confirm",
        title,
        message,
        confirmText,
        cancelText,
        onConfirm,
      });
    },
    [showAlert],
  );

  const closeAlert = useCallback(() => {
    setAlert(initialState);
  }, []);

  return {
    alert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    closeAlert,
  };
};
