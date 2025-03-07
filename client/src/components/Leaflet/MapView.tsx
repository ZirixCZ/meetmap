import React, { useEffect, useRef } from "react";
import L, { LatLngBounds, LatLngBoundsExpression } from "leaflet";
import { TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { Marker as MarkerType, MarkerUpdateOptions } from "../../types";

import baseIconUrl from "../../assets/qm5.png";
import festivalIconUrl from "../../assets/Festivaly.svg";
import theaterIconUrl from "../../assets/Divadla.svg";
import cinemaIconUrl from "../../assets/Kina.svg";
import sportIconUrl from "../../assets/Sport.svg";
import measurementStationIconUrl from "../../assets/aq.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const createIcon = (iconUrl: string) => {
  return L.icon({
    iconUrl,
    iconSize: [40, 40], // Adjust based on desired icon size
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    shadowSize: [41, 41],
  });
};

interface Props {
  markers: MarkerType[] | null;
  updateMarkers: (options: MarkerUpdateOptions, debounce?: number) => void;
  handleClick: (marker: MarkerType) => void;
}

const MapView = (props: Props) => {
  const map = useMap();
  const isResizeMoveRef = useRef(false);

  const getIconByType = (type: string) => {
    switch (type) {
      case "KLUBY_FESTIVALY":
        return createIcon(festivalIconUrl);
      case "DIVADLA_FILHARMONIE":
        return createIcon(theaterIconUrl);
      case "KINA":
        return createIcon(cinemaIconUrl);
      case "SPORT":
        return createIcon(sportIconUrl);
      case "MĚŘÍCÍ STANICE":
        return createIcon(measurementStationIconUrl);
      default:
        return createIcon(baseIconUrl);
    }
  };

  useEffect(() => {
    if (!props.markers?.length) {
      console.log("no markers");
      props.updateMarkers({ bounds: new LatLngBounds([[0, 0], [100, 90]]), zoom: 1 }, 0);
      return;
    }

    const bounds: LatLngBoundsExpression = props.markers.map((marker) => [
      marker.lat!,
      marker.lng!,
    ]);

    if (bounds?.length) {
      map.fitBounds(bounds);
    }
  }, [map]);

  return (
    <div>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        
      />
      {props?.markers?.map((marker, index) => (
        <Marker
          icon={getIconByType(marker.Type)}
          key={index}
          position={[marker.lat!, marker.lng!]}
          eventHandlers={{
            click: () => {
              props.handleClick(marker);
            },
          }}
        >
          <Popup>{marker.Type === "MĚŘÍCÍ STANICE" ? "Měřící stanice":marker.Name}</Popup>
        </Marker>
      ))}
    </div>
  );
};

export default MapView;
