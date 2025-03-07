import {
  useContext,
  createContext,
  useState,
  ReactNode,
  useMemo,
  useRef,
  useEffect,
} from "react";
import type { Marker, MarkerType, MarkerUpdateOptions } from "../../../types";

interface LeafletContextType {
  markers: Marker[];
  setMarkers: (markers: Marker[]) => void;
  updateMarkersDebounce: (
    options: MarkerUpdateOptions,
    debounce?: number,
  ) => void;
  filterMarkers: (keys: MarkerType[]) => void;
}

interface LeafletProviderProps {
  children: ReactNode;
}

const LeafletContext = createContext<LeafletContextType | undefined>(undefined);

export const useLeafletContext = () => {
  const context = useContext(LeafletContext);
  if (!context) {
    throw new Error("useLeafletContext must be used within a LeafletProvider");
  }
  return context;
};

export const LeafletProvider = (props: LeafletProviderProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [fetchedMarkers, setFetchedMarkers] = useState<Marker[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const updateMarkers = (options: MarkerUpdateOptions) => {
    console.log("in fetch options: ", options);

    const NorthWestLat = options.bounds.getNorth();
    const NorthWestLng = options.bounds.getWest();
    const SouthEastLat = options.bounds.getSouth();
    const SouthEastLng = options.bounds.getEast();
    const north_west = {
      lat: NorthWestLat,
      lon: NorthWestLng,
    };
    const south_east = {
      lat: SouthEastLat,
      lon: SouthEastLng,
    };

    try {
      fetch("https://nku.cznavody19.tk/places", {
        method: "POST",
        body: JSON.stringify({
          north_west,
          south_east,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          const mutatedData = json.map((item: any) => {
            return {
              name: item.name,
              lat: item.Point.Lat,
              lng: item.Point.Lon,
              Accessibility: Boolean(item?.Accessibility),
              ...item,
            };
          });
          setFetchedMarkers(mutatedData);
          setMarkers(mutatedData);
        });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updateMarkersDebounce = (
    options: MarkerUpdateOptions,
    debounce?: number,
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      updateMarkers(options);
    }, debounce ?? 1000);
  };

  const filterMarkers = (keys: MarkerType[]) => {
    if (!keys?.length) {
      setIsFiltered(false);
      return;
    }

    const clonedFetchedMarkers = [...fetchedMarkers];
    const filtered = clonedFetchedMarkers.filter((marker) =>
      keys.includes(marker.Type),
    );
    setIsFiltered(true);
    setMarkers(filtered);
  };

  const value = useMemo(
    () => ({
      markers: isFiltered ? markers : fetchedMarkers,
      setMarkers,
      updateMarkersDebounce,
      filterMarkers,
    }),
    [
      markers,
      fetchedMarkers,
      isFiltered,
      setIsFiltered,
      setMarkers,
      updateMarkersDebounce,
    ],
  );

  return (
    <LeafletContext.Provider value={value}>
      {props.children}
    </LeafletContext.Provider>
  );
};
