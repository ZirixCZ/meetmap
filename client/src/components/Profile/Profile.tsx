import { useNavigate } from "react-router-dom";
import { CrossBlack } from "../../svg";
import CustomButton from "../ui/AuthDialog/CustomButton";
import { useUser } from "../../contexts/UserContext";

import styles from "./Profile.module.css";
import { useRef, useState } from "react";
import { useFetchUsersByUsername } from "../../hooks/useFetchUsersByUsername";
import { User } from "../../types/user";

interface Props {
  closeCallback: VoidFunction;
}

const Profile = (props: Props) => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [searchedUsername, setSearchedUsername] = useState("");

  const searchedUsers = useFetchUsersByUsername(searchedUsername);

  const friendInputRef = useRef<HTMLInputElement>(null);

  console.log("searchedUsers", searchedUsers);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Profil</h2>
        <button onClick={props.closeCallback}>
          <CrossBlack />
        </button>
      </div>
      <div className={styles.content}>
        <img src="/assets/mockpfp.jpg" />
        <div className={styles.contentActions}>
          <h3>{user?.name ?? "Chyba"}</h3>
          <p>{user?.friendCount ?? 0} kamarádů.</p>
        </div>
      </div>
      <div className={styles.searchBarContainer}>
        <label className={styles.label}>Vyhledat uživatele</label>
        <input
          onChange={(e) => setSearchedUsername(e.target.value)}
          ref={friendInputRef}
          className={styles.input}
          type="text"
        />
        {searchedUsers && searchedUsers.length > 0
          ? searchedUsers.map((user: User) => (
              <div className={styles.fetchedUsersItemContainer}>
                <img src="/assets/user-plus-solid.svg" />
                <p>{user.username}</p>
              </div>
            ))
          : null}
      </div>
      <div className={styles.searchBarContainer}></div>
      <CustomButton
        className={styles.logoutButton}
        size="small"
        variant="secondary"
        onClick={() => navigate("/auth")}
        text="Odhlásit se"
      />
    </div>
  );
};

export default Profile;
