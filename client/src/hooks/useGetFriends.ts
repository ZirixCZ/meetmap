import { useState, useEffect, useCallback } from "react";
import type { User } from "../types/user";
import { apiUrl } from "../Constants/constants";
import { useUser } from "../contexts/UserContext";

interface UseFetchUsersReturn {
  users: User[] | null;
  refetch: () => void;
}

export function useGetFriends(): UseFetchUsersReturn {
  const [users, setUsers] = useState<User[] | null>(null);
  const { token } = useUser();

  const fetchUsers = useCallback(() => {
    fetch(`${apiUrl}/get-friends`, {
      method: "GET",
      headers: {
        Authorization: `${token}`,
      },
    })
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
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, refetch: fetchUsers };
}
