import { useState, useEffect } from "react";
import type { User } from "../types/user";
import { apiUrl } from "../Constants/constants";

export function useFetchUsersByUsername(username: string): User[] | null {
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    if (!username) {
      setUsers(null);
      return;
    }

    fetch(`${apiUrl}/users?username=${username}`)
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
  }, [username]);

  return users;
}
