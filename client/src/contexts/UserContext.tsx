import React, { createContext, useContext, ReactNode } from "react";
import type { User } from "../types/user";

interface UserContextProps {
  user: User | null;
  setUser: (user: User) => void;
  token: string | null;
  setToken: (token: string) => void;
}

const UserContext = createContext<UserContextProps>({
  user: {
    id: "",
    username: "",
    name: "",
    email: "",
    role: "",
    createdAt: "",
    updatedAt: "",
    friendCount: 0,
  },
  setUser: () => {},
  token: "",
  setToken: () => {},
});

interface UserProviderProps {
  user: User | null;
  children: ReactNode;
  token: string | null;
}

export function UserContextProvider({
  user,
  children,
  token,
}: UserProviderProps) {
  function setUser(newUser: User) {
    user = newUser;
  }

  function setToken(newToken: string) {
    token = newToken;
  }

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
}
