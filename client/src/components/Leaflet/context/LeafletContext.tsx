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
import {
  AirPollutionFeature,
  AQ_Hourly_Index_Translation,
} from "../../../types/airpollution";
import useGetGardens from "../../../hooks/useGetGardens";

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
        .then(async (json) => {
          // Fetch garden data
          const gardenResponse = await fetch(
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
          const gardenData = await gardenResponse.json();
          console.log("gardens", gardenData);

          const librariesResponse = await fetch(
            "https://api.golemio.cz/v2/municipallibraries?latlng=50.124935%2C14.457204&range=50000&offset=0&updatedSince=2019-05-18T07%3A38%3A37.000Z",
            {
              method: "GET",
              headers: {
                accept: "application/json; charset=utf-8",
                "X-Access-Token":
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzQwNiwiaWF0IjoxNzQxMzczMjYyLCJleHAiOjExNzQxMzczMjYyLCJpc3MiOiJnb2xlbWlvIiwianRpIjoiNWNlZjM0MTEtZDg5NC00ZDZlLWIxNDktNmQ5N2Q1ZTI3ZjZkIn0.JluCYgI0jkJNSbKiY-FhLKzCL33KqrfPEJU3Da4ZUaQ",
              },
            },
          );
          const librariesData = await librariesResponse.json();
          console.log("libraries", librariesData);

          // Mutate first fetched places (json from first fetch).
          const mutatedData = json.map((item: any) => ({
            // Converting to Marker shape – using placeholders when needed.
            Name: item.name || "Není k dispozici název",
            Description: item.description || "Není k dispozici popis",
            Accessibility:
              item.Accessibility != null ? Boolean(item.Accessibility) : false,
            AccessibilityNote: "N/A",
            Capacity: item.Capacity || 0,
            CapacityNote: "N/A",
            Phones: "N/A",
            Email: "N/A",
            Web: item.url || "N/A",
            Okres: "N/A",
            Obce: "N/A",
            Address:
              item.address && item.address.address_formatted
                ? item.address.address_formatted
                : "N/A",
            lat: item.Point ? item.Point.Lat : null,
            lng: item.Point ? item.Point.Lon : null,
            Type: "PLACE",
            Pollution: "N/A",
            ...item,
          }));

          const indexTranslations =
            aqHourlyIndexTypeTranslation as AQ_Hourly_Index_Translation[];

          // Mutate air pollution data.
          const mutatedData2 = airPollution.features.map((item) => {
            const coordinates = item.geometry.coordinates as [number, number];
            return {
              Name: item.properties.name || "No Name",
              Description: "Měřící stanice kvality ovzduší",
              Accessibility: false,
              AccessibilityNote: "N/A",
              Capacity: 0,
              CapacityNote: "N/A",
              Phones: "N/A",
              Email: "N/A",
              Web: "N/A",
              Okres: "N/A",
              Obce: "N/A",
              Address: "N/A",
              lat: coordinates[1],
              lng: coordinates[0],
              Pollution:
                indexTranslations.find(
                  (item2) =>
                    item2.index_code ==
                    item.properties.measurement.AQ_hourly_index,
                )?.description_cs || "N/A",
              Type: "MĚŘÍCÍ STANICE",
              ...item,
            };
          });

          // Mutate garden data.
          const mutatedGardenData = gardenData.features.map((feature: any) => {
            const coordinates = feature.geometry.coordinates as [
              number,
              number,
            ];
            return {
              Name: feature.properties.name || "Není k dispozici název",
              Description:
                feature.properties.description || "Není k dispozici popis",
              Accessibility:
                feature.properties.Accessibility != null
                  ? Boolean(feature.properties.Accessibility)
                  : false,
              AccessibilityNote: feature.properties.accessibilityNote || "N/A",
              Capacity: feature.properties.Capacity || 0,
              CapacityNote: feature.properties.CapacityNote || "N/A",
              Phones: "N/A",
              Email: "N/A",
              Web: feature.properties.url || "N/A",
              Okres: "N/A",
              Obce: "N/A",
              Address:
                feature.properties.address &&
                feature.properties.address.address_formatted
                  ? feature.properties.address.address_formatted
                  : "N/A",
              lat: coordinates[1] || 0,
              lng: coordinates[0] || 0,
              Type: "ZAHRADY",
              Pollution: "N/A",
            };
          });

          // Mutate municipal libraries data.
          const mutatedLibraryData = librariesData.features.map(
            (feature: any) => {
              const coordinates = feature.geometry.coordinates as [
                number,
                number,
              ];
              return {
                Name: feature.properties.name || "Není k dispozici název",
                Description: "Městská knihovna",
                Accessibility: false,
                AccessibilityNote: "N/A",
                Capacity: 0,
                CapacityNote: "N/A",
                Phones: feature.properties.telephone || "N/A",
                Email: feature.properties.email || "N/A",
                Web: feature.properties.web || "N/A",
                Okres: "N/A",
                Obce: "N/A",
                Address:
                  feature.properties.address &&
                  feature.properties.address.address_formatted
                    ? feature.properties.address.address_formatted
                    : "N/A",
                lat: coordinates[1] || 0,
                lng: coordinates[0] || 0,
                Type: "KNIHOVNY",
                Pollution: "N/A",
              };
            },
          );

          // Combine all markers into one array.
          const markersToBePolluted = [
            ...mutatedData,
            ...mutatedData2,
            ...mutatedGardenData,
            ...mutatedLibraryData,
          ];

          // Example code to update pollution for places

          const getDistance = (
            lat1: number,
            lon1: number,
            lat2: number,
            lon2: number,
          ) => {
            const toRad = (value: number) => (value * Math.PI) / 180;
            const R = 6371; // Radius of the Earth in km
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distance in km
          };

          // Example: for each place (mutatedData items), find the nearest pollution sensor.
          markersToBePolluted.forEach((marker: Marker) => {
            let nearestPollution: string | null = null;
            let minDistance = Infinity;

            mutatedData2.forEach((pollutionMarker) => {
              if (marker.lat != null && marker.lng != null) {
                const distance = getDistance(
                  marker.lat,
                  marker.lng,
                  pollutionMarker.lat,
                  pollutionMarker.lng,
                );

                if (distance < minDistance) {
                  minDistance = distance;
                  nearestPollution = pollutionMarker.Pollution;
                }
              }
              if (minDistance > 50) {
                nearestPollution = "neměřeno";
              }
            });

            marker.Pollution = nearestPollution;
          });
          setFetchedMarkers([...markersToBePolluted, ...mutatedData2]);
          setMarkers([...markersToBePolluted, ...mutatedData2]);
          
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
      setMarkers,
      updateMarkersDebounce,
      filterMarkers,
    ],
  );

  return (
    <LeafletContext.Provider value={value}>
      {props.children}
    </LeafletContext.Provider>
  );
};
