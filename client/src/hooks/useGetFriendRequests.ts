import { useState, useEffect, useCallback } from "react";
import type { User } from "../types/user";
import { apiUrl } from "../Constants/constants";
import { useUser } from "../contexts/UserContext";

interface FriendRequestsReturn {
  friendRequests: User[] | null;
  refetch: () => void;
}

export function useGetFriendRequests(
  userID: string | null,
): FriendRequestsReturn {
  const [users, setUsers] = useState<User[] | null>(null);
  const { token } = useUser();

  const fetchFriendRequests = useCallback(() => {
    if (!userID) {
      setUsers(null);
      return;
    }

    fetch(`${apiUrl}/friend-requests`, {
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
        console.error("Fetching friend requests failed:", error);
        setUsers(null);
      });
  }, [userID, token]);

  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  return { friendRequests: users, refetch: fetchFriendRequests };
}
