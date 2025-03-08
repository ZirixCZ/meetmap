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
import { useGetFriends } from "../../hooks/useGetFriends";
import { User } from "../../types/user";

interface Props {
  onSubmit: (data: MeetupData) => void;
  closeCallback: () => void;
  location: LatLngExpression | null;
}

const Meetup = (props: Props) => {
  const { users: friends, refetch: refetchFriends } = useGetFriends();

  const [phase, setPhase] = useState(0);
  const [invited, setInvited] = useState<boolean[]>([]);

  const [meetupName, setMeetupName] = useState("");
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [eventType, setEventType] = useState("");
  const [minimumAge, setMinimumAge] = useState(18);
  const [maximumAge, setMaximumAge] = useState(100);
  const [meetupDesc, setMeetupDesc] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [allowUnverifiedUsers, setAllowUnverifiedUsers] = useState(false);

  const handleInvite = (
    invitedSetter: React.Dispatch<React.SetStateAction<boolean>>,
    invited: boolean,
  ) => {
    invitedSetter(!invited);
  };

  console.log(props.location);

  return (
    <div
      className={cx(styles.container, {
        [styles.container3]: phase === 1,
        [styles.container4]: phase === 2,
        [styles.container5]: phase === 3,
      })}
    >
      <div className={styles.header}>
        <h2>Nový meetup</h2>
        <button onClick={props.closeCallback}>
          <CrossBlack />
        </button>
      </div>
      {phase === 0 && (
        <>
          <InputField
            type="text"
            title="Jméno meetupu"
            placeholder="Zadejte jméno..."
            value={meetupName}
            onChange={(e) => setMeetupName(e.target.value)}
          />
          <InputField
            type="textarea"
            title="Popis meetupu"
            placeholder="Zadejte popis..."
            value={meetupDesc}
            onChange={(e) => setMeetupDesc(e.target.value)}
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
                onChange={(e) => setToTime(e.target.value)}
                className={styles.timeField}
              />
            </div>
          </div>
        </>
      )}
      {phase === 1 && (
        <div>
          <SelectField
            title="Typ"
            options={["Festivaly", "Divadla", "Kina", "Sport", "Ostatní"]}
            placeholder="Typ"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          />
        </div>
      )}
      {phase === 3 && (
        <div>
          Pozvat přátele
          <div className={styles.gap}></div>
          <div className={styles.content}>
            {/* You can add the invitation list or PlacesList component here */}

            {friends && friends.length > 0
              ? friends.map((user: User) => (
                  <div className={styles.friendRowContainer}>
                    <div className={styles.imgTextWrapper}>
                      <img src={user.user.profile_image_url} />
                      <p>{user.user.username}</p>
                    </div>
                    <img
                      className={styles.inviteImg}
                      src="../../assets/invite.svg"
                    />
                  </div>
                ))
              : null}
          </div>
        </div>
      )}
      {phase === 2 && (
        <div>
          <InputField
            type="number"
            title="Minimální věk"
            placeholder="Zadejte minimální věk..."
            value={minimumAge.toString()}
            onChange={(e) =>
              setMinimumAge((prev) =>
                parseInt(e.target.value) < 0 ||
                parseInt(e.target.value) > maximumAge
                  ? prev
                  : parseInt(e.target.value),
              )
            }
          />
          <InputField
            type="number"
            title="Maximální věk"
            placeholder="Zadejte maximální věk..."
            value={maximumAge.toString()}
            onChange={(e) =>
              setMaximumAge((prev) =>
                parseInt(e.target.value) < 0 ||
                parseInt(e.target.value) < minimumAge
                  ? prev
                  : parseInt(e.target.value),
              )
            }
          />
          <InputField
            type="checkbox"
            title="Veřejný meetup"
            placeholder="Veřejný meetup"
            value={isPublic.toString()}
            onChange={(e) => setIsPublic(e.target.value === "true")}
            className={styles.checkbox}
          />
          <InputField
            type="checkbox"
            title="Povolit neověřené uživatele"
            placeholder="Povolit neověřené uživatele"
            value={allowUnverifiedUsers.toString()}
            onChange={(e) => setAllowUnverifiedUsers(e.target.value === "true")}
            className={styles.checkbox}
          />
        </div>
      )}
      {phase === 2 ? (
        <div className={styles.smGap}></div>
      ) : (
        <div className={styles.gap}></div>
      )}
      <CustomButton
        size="small"
        onClick={
          phase !== 3
            ? () => setPhase((prevPhase) => prevPhase + 1)
            : () => {
                props.onSubmit({
                  meetupName,
                  meetupDesc,
                  minimumAge,
                  maximumAge,
                  isPublic,
                  allowUnverifiedUsers,
                  invited: [],
                  date,
                  fromTime,
                  toTime,
                  eventType,
                  location: props.location,
            
                });
                props.closeCallback();
              }
        }
        text={phase !== 3 ? "Pokračovat" : "Dokončit"}
      />
    </div>
  );
};

export default Meetup;
