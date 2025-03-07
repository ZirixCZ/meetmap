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

import airPollution from "../../../assets/airpollution.json";
import aqHourlyIndexTypeTranslation from "../../../assets/airtype.json";
import { AirPollutionFeature, AQ_Hourly_Index_Translation } from "../../../types/airpollution";


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
          const indexTranslations = aqHourlyIndexTypeTranslation as AQ_Hourly_Index_Translation[];
       
          const mutatedData2 = airPollution.features.map((item) => {
            const coordinates = item.geometry.coordinates as [number, number];
            return {
              name: item.properties.name,
              lat: coordinates[1],
              lng: coordinates[0],
              Pollution: indexTranslations.find((item2) => item2.index_code == item.properties.measurement.AQ_hourly_index)?.description_cs,
              Type: "MĚŘÍCÍ STANICE",
              ...item,
            };});



          setFetchedMarkers([...mutatedData, ...mutatedData2]);
          setMarkers([...mutatedData, ...mutatedData2]);
            const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const toRad = (value: number) => (value * Math.PI) / 180;
            const R = 6371; // Radius of the Earth in km
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distance in km
            };

            mutatedData.forEach((marker: Marker) => {
            let nearestPollution = null;
            let minDistance = Infinity;

            mutatedData2.forEach((pollutionMarker) => {
              const distance = getDistance(
              marker.lat!,
              marker.lng!,
              pollutionMarker.lat,
              pollutionMarker.lng,
              );

              if (distance < minDistance) {
              minDistance = distance;
              nearestPollution = pollutionMarker.Pollution;
              }
            });

            marker.Pollution = nearestPollution;
            });

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
