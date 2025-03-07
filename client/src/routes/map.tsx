import { useContext } from "react";
import Filters from "../components/Filters/Filters";
import Leaflet from "../components/Leaflet";
import RightFloaters from "../components/RightFloaters/RightFloaters";

import styles from "./map.module.css";


const MapRoute = () => {



 

  return (
    <div className={styles.container}>
      <Filters />
      <RightFloaters />
      <Leaflet />
    </div>
  );
};

export default MapRoute;
