import React, { createContext, useContext, useState, ReactNode } from "react";

interface RightCornerDialogContextProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const RightCornerDialogContext = createContext<
  RightCornerDialogContextProps | undefined
>(undefined);

interface RightCornerDialogProviderProps {
  children: ReactNode;
}

export const RightCornerDialogProvider = ({
  children,
}: RightCornerDialogProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <RightCornerDialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </RightCornerDialogContext.Provider>
  );
};

export const useRightCornerDialog = () => {
  const context = useContext(RightCornerDialogContext);
  if (!context) {
    throw new Error(
      "useRightCornerDialog must be used within a RightCornerDialogProvider.",
    );
  }
  return context;
};
