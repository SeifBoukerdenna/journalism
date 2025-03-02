// src/hooks/useModal.ts
import { useState, useCallback } from "react";

type ModalId = string;

interface UseModalResult {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

/**
 * Custom hook for managing modal state
 * @param initialState The initial state of the modal (open or closed)
 * @returns Object with modal state and control functions
 */
export const useModal = (initialState: boolean = false): UseModalResult => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return { isOpen, openModal, closeModal, toggleModal };
};

/**
 * Custom hook for managing multiple modals
 * @returns Object with modal state and control functions
 */
export const useModals = () => {
  const [openModals, setOpenModals] = useState<Set<ModalId>>(new Set());

  const isModalOpen = useCallback(
    (modalId: ModalId) => openModals.has(modalId),
    [openModals]
  );

  const openModal = useCallback((modalId: ModalId) => {
    setOpenModals((prev) => {
      const newSet = new Set(prev);
      newSet.add(modalId);
      return newSet;
    });
  }, []);

  const closeModal = useCallback((modalId: ModalId) => {
    setOpenModals((prev) => {
      const newSet = new Set(prev);
      newSet.delete(modalId);
      return newSet;
    });
  }, []);

  const toggleModal = useCallback((modalId: ModalId) => {
    setOpenModals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modalId)) {
        newSet.delete(modalId);
      } else {
        newSet.add(modalId);
      }
      return newSet;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setOpenModals(new Set());
  }, []);

  return {
    isModalOpen,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
  };
};

export default useModal;
