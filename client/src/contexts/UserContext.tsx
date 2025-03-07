import React, { createContext, useContext, ReactNode } from "react";
import type { User } from "../types/user";

interface UserContextProps {
  user: User;
}

const UserContext = createContext<UserContextProps>({
  user: {
    id: "",
    name: "",
    email: "",
    role: "",
    createdAt: "",
    updatedAt: "",
  },
});

interface UserProviderProps {
  user: User;
  children: ReactNode;
}

export function UserContextProvider({ user, children }: UserProviderProps) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context.user;
}
