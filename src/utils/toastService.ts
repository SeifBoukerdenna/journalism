// src/utils/toastService.ts

type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  title?: string;
  duration?: number;
  onClose?: () => void;
}

/**
 * Shows a toast notification
 * @param message The main message to display
 * @param type The type of toast (success, error, warning, info)
 * @param options Additional options for the toast
 */
export const showToast = (
  message: string,
  type: ToastType = "info",
  options: ToastOptions = {}
) => {
  const { title, duration = 5000, onClose } = options;

  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", "alert");

  let icon = "";
  switch (type) {
    case "success":
      icon = "check_circle";
      break;
    case "error":
      icon = "error";
      break;
    case "warning":
      icon = "warning";
      break;
    default:
      icon = "info";
      break;
  }

  toast.innerHTML = `
    <span class="material-icons toast-icon">${icon}</span>
    <div class="toast-content">
      ${title ? `<div class="toast-title">${title}</div>` : ""}
      <div class="toast-message">${message}</div>
    </div>
    <button class="btn-icon toast-close" aria-label="Close notification">
      <span class="material-icons">close</span>
    </button>
  `;

  container.appendChild(toast);

  // Add event listener to close button
  const closeBtn = toast.querySelector(".toast-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeToast(toast, container);
      if (onClose) onClose();
    });
  }

  // Auto remove after duration
  setTimeout(() => {
    closeToast(toast, container);
    if (onClose) onClose();
  }, duration);

  return toast;
};

/**
 * Shorthand method for success toasts
 */
export const showSuccessToast = (
  message: string,
  options: ToastOptions = {}
) => {
  return showToast(message, "success", options);
};

/**
 * Shorthand method for error toasts
 */
export const showErrorToast = (message: string, options: ToastOptions = {}) => {
  return showToast(message, "error", options);
};

/**
 * Shorthand method for warning toasts
 */
export const showWarningToast = (
  message: string,
  options: ToastOptions = {}
) => {
  return showToast(message, "warning", options);
};

/**
 * Closes a toast with animation
 */
const closeToast = (toast: HTMLElement, container: HTMLElement) => {
  toast.style.opacity = "0";
  toast.style.transform = "translateX(100%)";
  toast.style.transition = "all 0.3s ease";

  setTimeout(() => {
    if (toast.parentNode === container) {
      container.removeChild(toast);
    }
  }, 300);
};

/**
 * Clear all toasts
 */
export const clearAllToasts = () => {
  const container = document.getElementById("toast-container");
  if (!container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};
