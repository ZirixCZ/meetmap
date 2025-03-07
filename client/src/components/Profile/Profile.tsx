import { useNavigate } from "react-router-dom";
import { CrossBlack } from "../../svg";
import CustomButton from "../ui/AuthDialog/CustomButton";
import { useUser } from "../../contexts/UserContext";

import styles from "./Profile.module.css";

interface Props {
  closeCallback: VoidFunction;
}

const Profile = (props: Props) => {
  const navigate = useNavigate();
  const user = useUser();

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
          <h3>{user.name}</h3>
          <p>24 kamarádů</p>
        </div>
      </div>
      <CustomButton
        size="small"
        variant="secondary"
        onClick={() => navigate("/auth")}
        text="Odhlásit se"
      />
    </div>
  );
};

export default Profile;
