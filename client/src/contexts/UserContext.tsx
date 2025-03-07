import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import type { User } from "../types/user";

interface UserContextProps {
  user: User | null;
  setUser: (user: User) => void;
  token: string | null;
  setToken: (token: string) => void;
}

const UserContext = createContext<UserContextProps>({
  user: {
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
  const [userState, setUserState] = useState<User | null>(user);
  const [tokenState, setTokenState] = useState<string | null>(token);

  function setUser(newUser: User) {
    window.localStorage.setItem("user", JSON.stringify(newUser));
    console.log({ user: newUser["user"] });
    setUserState({ user: newUser["user"] });
  }

  function setToken(newToken: string) {
    window.localStorage.setItem("token", newToken);
    setTokenState(newToken);
  }

  useEffect(() => {
    if (!user) {
      const userString = window.localStorage.getItem("user");
      console.log("setting user in use effect", userString);
      if (userString) {
        setUserState({ user: JSON.parse(userString) });
      }
    }

    if (!token) {
      const tokenString = window.localStorage.getItem("token");
      if (tokenString) {
        setTokenState(tokenString);
      }
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ user: userState, setUser, token: tokenState, setToken }}
    >
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
