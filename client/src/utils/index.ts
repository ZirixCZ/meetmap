import L, { LatLngBounds, LatLngBoundsExpression } from "leaflet";
import baseIconUrl from "../assets/qm5.png";
import festivalIconUrl from "../assets/Festivaly.svg";
import theaterIconUrl from "../assets/Divadla.svg";
import cinemaIconUrl from "../assets/Kina.svg";
import sportIconUrl from "../assets/Sport.svg";
import gardenIconUrl from "../assets/Garden.png";
import libraryIconUrl from "../assets/libraryIcon.png";
import measurementStationIconUrl from "../assets/aq.png";

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

export const getIconByType = (type: string) => {
  switch (type) {
    case "KLUBY_FESTIVALY":
      return festivalIconUrl;
    case "DIVADLA_FILHARMONIE":
      return theaterIconUrl;
    case "KINA":
      return cinemaIconUrl;
    case "SPORT":
      return sportIconUrl;
    case "MĚŘÍCÍ STANICE":
      return measurementStationIconUrl;
    case "ZAHRADY":
      return gardenIconUrl;
    case "KNIHOVNY":
      return libraryIconUrl;
    default:
      return libraryIconUrl;
  }
};
