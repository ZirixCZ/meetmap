import { Cross, CrossBlack } from "../../../svg";
import { Marker } from "../../../types";
import CustomButton from "../../ui/AuthDialog/CustomButton";

import styles from "./SidebarInfo.module.css";

interface Props {
  marker: Marker;
  closeCallback: VoidFunction;
  createMeetupCallback: (marker: Marker) => void;
}

const SidebarInfo = (props: Props) => {
  return (
    <div className={styles.container} onScroll={(e) => e.stopPropagation()}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>{props.marker.Name}</h1>
          <button onClick={props.closeCallback}>
            <CrossBlack />
          </button>
        </div>
        <p>{props.marker.Address}</p>
        {props.marker.Accessibility ? (
          <CustomButton
            text="Bezbariérový přístup"
            size="small"
            variant="third"
            onClick={() => {}}
          />
        ) : (
          <></>
        )}
        <div className={styles.description}>
        <p>{props.marker.Description}</p>
        </div>
        
        <div className={styles.buttons}>
          <CustomButton
            onClick={() => {}}
            variant="primary"
            size="small"
            text="Program"
          ></CustomButton>
          <CustomButton
            onClick={() => props.createMeetupCallback(props.marker)}
            variant="primary"
            size="small"
            text="Vytvořit meetup"
          ></CustomButton>
          <CustomButton
            onClick={() => {}}
            variant="primary"
            size="small"
            text="Like"
          ></CustomButton>
          <CustomButton
            onClick={() => {}}
            variant="primary"
            size="small"
            text="Webové stránky"
          ></CustomButton>
        </div>
      </div>
    </div>
  );
};

export default SidebarInfo;
