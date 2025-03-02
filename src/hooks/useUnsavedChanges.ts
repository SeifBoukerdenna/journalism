// src/hooks/useUnsavedChanges.ts
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { showWarningToast } from "../utils/toastService";

interface UseUnsavedChangesOptions {
  message?: string;
  showToast?: boolean;
}

/**
 * Custom hook to handle unsaved changes
 * @param hasUnsavedChanges Boolean indicating if there are unsaved changes
 * @param options Configuration options
 * @returns Object with functions to save, discard, and check changes
 */
const useUnsavedChanges = (
  hasUnsavedChanges: boolean,
  options: UseUnsavedChangesOptions = {}
) => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    message = "You have unsaved changes. Are you sure you want to leave?",
    showToast = true,
  } = options;

  // Handle navigation attempt when there are unsaved changes
  const handleNavigation = useCallback(
    (path: string) => {
      if (hasUnsavedChanges) {
        // Store destination and show confirmation dialog
        setDestination(path);
        setShowConfirmation(true);

        if (showToast) {
          showWarningToast("You have unsaved changes", {
            title: "Confirm Navigation",
            duration: 3000,
          });
        }
        return false; // Prevent immediate navigation
      }

      // No unsaved changes, proceed with navigation
      navigate(path);
      return true;
    },
    [hasUnsavedChanges, navigate, showToast]
  );

  // Confirm navigation after user confirms
  const confirmNavigation = useCallback(() => {
    if (destination) {
      navigate(destination);
      setDestination(null);
      setShowConfirmation(false);
    }
  }, [destination, navigate]);

  // Cancel navigation attempt
  const cancelNavigation = useCallback(() => {
    setDestination(null);
    setShowConfirmation(false);
  }, []);

  // Set up window beforeunload event listener to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  return {
    handleNavigation,
    confirmNavigation,
    cancelNavigation,
    showConfirmation,
    destination,
  };
};

export default useUnsavedChanges;
