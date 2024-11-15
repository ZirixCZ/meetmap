import React, {useContext} from "react";
import { type User } from "../../types/user";

interface UserContextValue {
    user: User;
    set: (user: User) => void;
}



const userContext = React.createContext<UserContextValue | null>({
    user: {
        id: "",
        name: "",
        email: "",
        role: "",
        createdAt: "",
        updatedAt: "",
    },
    set: () => {},
});

export const useUserContext = () => {
    const context = useContext(userContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserContextProvider");
    }
    return context;
};

export const UserContextProvider = userContext.Provider;