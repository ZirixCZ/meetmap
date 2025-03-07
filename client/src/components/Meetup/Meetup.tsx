import { useNavigate } from "react-router-dom";
import { CrossBlack } from "../../svg";
import CustomButton from "../ui/AuthDialog/CustomButton";
import styles from "./Meetup.module.css";
import InputField from "../ui/AuthDialog/InputField";
import SelectField from "../ui/AuthDialog/SelectField";
import { useState } from "react";
import cx from "classnames";
import PlacesList from "./PlacesList";
import MeetupData from "../../types/meetupData";
import { LatLngExpression } from "leaflet";

interface Props {
  onSubmit: (data: MeetupData) => void;
  closeCallback: () => void;
  location: LatLngExpression | null;
}

const Meetup = (props: Props) => {
  const [phase, setPhase] = useState(0);
  const [invited1, setInvited1] = useState(false);
  const [invited2, setInvited2] = useState(false);

  const [meetupName, setMeetupName] = useState('');
  const [date, setDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [eventType, setEventType] = useState('');

  const handleInvite = (invitedSetter: React.Dispatch<React.SetStateAction<boolean>>, invited: boolean) => {
    invitedSetter(!invited);
  };

  console.log(props.location);

  return (
    <div className={cx(styles.container, {[styles.container3]: phase === 1, [styles.container4]: phase === 2, [styles.container5]: phase === 3})}>
      <div className={styles.header}>
        <h2>Nový meetup</h2>
        <button onClick={props.closeCallback}>
          <CrossBlack />
        </button>
      </div>
      {
        phase === 0 && (
          <>
            <InputField 
              type="text" 
              title="Jméno meetupu" 
              placeholder="Zadejte jméno..." 
              value={meetupName}
              onChange={(e) => setMeetupName(e.target.value)}
            />
            <div className={styles.content}>
              <InputField 
                type="date" 
                title="Kdy?" 
                placeholder="Zadejte datum..." 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className={styles.timeFields}>
                <InputField
                  type="time"
                  placeholder="Zadejte čas od..."
                  title="Od"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className={styles.timeField}
                  
                />
                <InputField
                  type="time"
                  placeholder="Zadejte čas do..."
                  title="Do"
                  value={toTime}
                  className={styles.timeField}
                  onChange={(e) => setToTime(e.target.value)}
                />
              </div>
            </div>
          </>
        )
      }
      {
        phase === 1 && (
          <div>
            <SelectField 
              title="Typ" 
              options={["Festivaly", "Divadla", "Kina", "Sport", "Ostatní"]} 
              placeholder="Typ" 
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            />
          </div>
        )
      }
      
        
      {
        phase === 2 && (
          <div>
            Pozvat přátele
            <div className={styles.gap}></div>
            <div className={styles.content}>
              <img src="/assets/mockpfp.jpg" alt="Profile" />
              <div className={styles.contentActions}>
                <h3>Matěj Tobiáš Moravec</h3>
                <a onClick={() => handleInvite(setInvited1, invited1)} className={styles.green}>{invited1 ? "pozvání odesláno" : "pozvat"}</a>
              </div>
            </div>
            <div className={styles.content}>
              <img src="/assets/mockpfp.jpg" alt="Profile" />
              <div className={styles.contentActions}>
                <h3>Tomáš Kalhous</h3>
                <a onClick={() => handleInvite(setInvited2, invited2)} className={styles.green}>{invited2 ? "pozvání odesláno" : "pozvat"}</a>
              </div>
            </div>
          </div>
        )
      }
      {
        phase === 3 && (
          <div>
            <PlacesList />
          </div>
        )
      }
      {phase === 2 ? <div className={styles.smGap}></div> : <div className={styles.gap}></div>} 
      <CustomButton
        size="small"
        onClick={phase !== 3 ? () => setPhase((prevPhase) => prevPhase + 1) : () => {props.onSubmit({meetupName, date, fromTime, toTime, eventType, location: props.location});
        props.closeCallback()}}
        text={phase !== 3 ? "Pokračovat" : "Dokončit"}
      />
    </div>
  );
};

export default Meetup;
