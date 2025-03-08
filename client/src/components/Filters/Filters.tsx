import { useEffect, useState } from "react";
import { Camera, Castle, Garden, Palete, Song, StrongMan } from "../../svg";
import { MarkerType } from "../../types";
import { useLeafletContext } from "../Leaflet/context/LeafletContext";
import Selector from "./components/Selector";
import styles from "./Filters.module.css";

const Filters = () => {
  const { filterMarkers } = useLeafletContext();

  const [selectors, setSelectors] = useState([
    { selected: true, name: "Vše", icon: null, deseletsAll: true, key: "all" },
    {
      selected: false,
      name: "Festivaly",
      icon: <Song />,
      key: "KLUBY_FESTIVALY",
    },
    {
      selected: false,
      name: "Divadla",
      icon: <Palete />,
      key: "DIVADLA_FILHARMONIE",
    },
    { selected: false, name: "Kina", icon: <Camera />, key: "KINA" },
    { selected: false, name: "Sport", icon: <StrongMan />, key: "SPORT" },
    { selected: false, name: "Zahrady", icon: <>🌳</>, key: "ZAHRADY" },
  ]);

  const handleChange = (index: number) => {
    setSelectors((prevSelectors) => {
      const isDeselectAllSelected = prevSelectors[index]?.deseletsAll;

      return prevSelectors.map((selector, i) => {
        if (isDeselectAllSelected) {
          return {
            ...selector,
            selected: i === index,
          };
        } else {
          return {
            ...selector,
            selected:
              i === index
                ? !selector.selected
                : selector.deseletsAll
                  ? false
                  : selector.selected,
          };
        }
      });
    });
  };

  useEffect(() => {
    const isAnySelected = selectors.some((selector) => selector.selected);
    if (!isAnySelected) {
      setSelectors((prev) => {
        return prev.map((selector, index) => {
          if (index === 0) {
            return {
              ...selector,
              selected: true,
            };
          } else {
            return {
              ...selector,
              selected: false,
            };
          }
        });
      });
    }

    const activeKeys: MarkerType[] = selectors
      .filter((selector) => selector.selected && selector.key !== "all")
      .map((selector) => selector.key as MarkerType);

    filterMarkers(activeKeys);
  }, [selectors]);

  return (
    <div className={styles.container}>
      <div className={styles.filterContainer}>
        {selectors.map((selector, index) => (
          <Selector
            key={index}
            index={index}
            selected={selector.selected}
            handleChange={handleChange}
          >
            <>
              {selector.icon}
              {selector.icon && <span className={styles.gap}></span>}
              {selector.name}
            </>
          </Selector>
        ))}
      </div>
    </div>
  );
};

export default Filters;
