import { useEffect, useState } from "react";

const useGetGardens = () => {
  const [gardens, setGardens] = useState([]);

  const fetchGardens = async () => {
    try {
      const response = await fetch(
        "https://api.golemio.cz/v2/gardens?latlng=50.124935%2C14.457204&range=50000&offset=0",
        {
          method: "GET",
          headers: {
            accept: "application/json; charset=utf-8",
            "X-Access-Token":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzQwNiwiaWF0IjoxNzQxMzczMjYyLCJleHAiOjExNzQxMzczMjYyLCJpc3MiOiJnb2xlbWlvIiwianRpIjoiNWNlZjM0MTEtZDg5NC00ZDZlLWIxNDktNmQ5N2Q1ZTI3ZjZkIn0.JluCYgI0jkJNSbKiY-FhLKzCL33KqrfPEJU3Da4ZUaQ",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGardens(data);
    } catch (error) {
      console.error("Error fetching gardens:", error);
    }
  };

  useEffect(() => {
    fetchGardens();
  }, []);

  return { gardens, refetch: fetchGardens };
};

export default useGetGardens;
