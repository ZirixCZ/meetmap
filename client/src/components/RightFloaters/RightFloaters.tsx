import { useRef, useState } from "react";
import { AddIcon, User } from "../../svg";
import Profile from "../Profile/Profile";
import styles from "./RightFloaters.module.css";
import Meetup from "../Meetup/Meetup";
import { useNavigate } from "react-router-dom";

const RightFloaters = () => {
  const [userOpen, setUserOpen] = useState(false);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const bookmarkButtonRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();

  const handleUserOpen = () => {
    setUserOpen((prev) => !prev);
  };

  const handleBookmarkOpen = () => {
    setBookmarkOpen((prev) => !prev);
  };

  const navigateToAdmin = () => {
    // TODO: check for admin role
    if (true) {
      navigate("/admin");
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={navigateToAdmin}>Admin</button>
      <button ref={bookmarkButtonRef} onClick={handleBookmarkOpen}>
        <AddIcon />
      </button>
      {bookmarkOpen && <Meetup closeCallback={handleBookmarkOpen} />}
      <button ref={userButtonRef} onClick={handleUserOpen}>
        <User />
      </button>
      {userOpen && <Profile closeCallback={handleUserOpen} />}
    </div>
  );
};

export default RightFloaters;
