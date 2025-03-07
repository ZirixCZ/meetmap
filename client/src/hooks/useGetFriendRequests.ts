import { useState, useEffect } from "react";
import type { User } from "../types/user";
import { apiUrl } from "../Constants/constants";

export function useGetFriendRequests(userID: string | null): User[] | null {
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    if (!userID) {
      setUsers(null);
      return;
    }

    fetch(`${apiUrl}/friendRequests`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network error");
        }
        return response.json();
      })
      .then((data: User[]) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error("Fetching users failed:", error);
        setUsers(null);
      });
  }, [userID]);

  return users;
}
