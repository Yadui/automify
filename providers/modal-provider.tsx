"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface ModalProviderProps {
  children: React.ReactNode;
}

export type ModalData = {};

type ModalContextType = {
  data: ModalData;
  isOpen: boolean;
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => void;
  setClose: () => void;
};

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => {},
  setClose: () => {},
});

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>({});
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setOpen = async (
    modal: React.ReactNode,
    fetchData?: () => Promise<any>,
  ) => {
    if (modal) {
      if (fetchData) {
        setData({ ...data, ...(await fetchData()) } || {});
      }
      // Increment key to force remount of modal content
      setModalKey((prev) => prev + 1);
      setShowingModal(modal);
      setIsOpen(true);
    }
  };

  const setClose = () => {
    setIsOpen(false);
    setData({});
  };

  if (!isMounted) return null;

  return (
    <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }}>
      {children}
      {/* Key forces React to remount the entire modal tree, giving forms fresh hook state */}
      <div key={modalKey}>{showingModal}</div>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within the modal provider");
  }
  return context;
};

export default ModalProvider;
