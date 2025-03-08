import { useState, useEffect, useCallback } from "react";
import type { User } from "../types/user";
import { apiUrl } from "../Constants/constants";
import { useUser } from "../contexts/UserContext";
import MeetupData from "../types/meetupData";

interface UseFetchUsersReturn {
  meetups: MeetupData[] | null;
  refetch: () => void;
}

export function useGetMeetups(): UseFetchUsersReturn {
  const [meetups, setMeetups] = useState<MeetupData[] | null>(null);
  const { token } = useUser();

  const fetchMeetups = useCallback(() => {
    fetch(`${apiUrl}/get-meetups`, {
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
      .then((data: MeetupData[]) => {
        setMeetups(data);
      })
      .catch((error) => {
        console.error("Fetching users failed:", error);
        setMeetups(null);
      });
  }, [token]);

  useEffect(() => {
    fetchMeetups();
  }, [fetchMeetups]);

  return { meetups: meetups, refetch: fetchMeetups };
}
