import { useNavigate } from "react-router-dom";
import { CrossBlack } from "../../svg";
import CustomButton from "../ui/AuthDialog/CustomButton";
import { useUser } from "../../contexts/UserContext";

import styles from "./Profile.module.css";
import { useRef, useState } from "react";
import { useFetchUsersByUsername } from "../../hooks/useFetchUsersByUsername";
import { useGetFriendRequests } from "../../hooks/useGetFriendRequests";
import { User } from "../../types/user";
import { apiUrl } from "../../Constants/constants";
import { useGetFriends } from "../../hooks/useGetFriends";

interface Props {
  closeCallback: VoidFunction;
}

const Profile = (props: Props) => {
  const navigate = useNavigate();
  const { user, token } = useUser();

  const [searchedUsername, setSearchedUsername] = useState("");

  const { users: searchedUsers, refetch } =
    useFetchUsersByUsername(searchedUsername);
  const { friendRequests, refetch: refetchFriendRequests } =
    useGetFriendRequests(user?.user.id ?? null);
  const { users: friends, refetch: refetchFriends } = useGetFriends();
  console.log(friendRequests, "friend requests");

  const friendInputRef = useRef<HTMLInputElement>(null);

  console.log("searchedUsers", searchedUsers);

  const friendRequestSendHandler = async (user: User) => {
    const response = await fetch(`${apiUrl}/add-friend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        id: user.user.id,
      }),
    });

    if (response.ok) {
      console.log("Friend request sent");
      refetch();
      refetchFriends();
    } else {
      console.error("Friend request failed");
    }
  };

  const friendRequestAcceptHandler = async (user: User) => {
    const response = await fetch(`${apiUrl}/accept-friend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        id: user.user.id,
      }),
    });

    if (response.ok) {
      console.log("Friend request accepted");
      refetchFriendRequests();
      refetchFriends();
    } else {
      console.error("Friend request failed");
    }
  };

  const friendRequestDeclineHandler = async (user: User) => {
    const response = await fetch(`${apiUrl}/decline-friend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        id: user.user.id,
      }),
    });

    if (response.ok) {
      console.log("Friend request declined");
      refetchFriendRequests();
      refetchFriends();
    } else {
      console.error("Friend request failed");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Profil</h2>
        <button onClick={props.closeCallback}>
          <CrossBlack />
        </button>
      </div>
      <div className={styles.content}>
        <img src={user?.user.profile_image_url} />
        <div className={styles.contentActions}>
          <h3>{user?.user.username ?? "Chyba"}</h3>
          <p>{user?.user.friendCount ?? 0} přátel.</p>
        </div>
      </div>
      <div className={styles.searchBarContainer}>
        {friends && <label className={styles.label}>Přátelé</label>}
        {friends && friends.length > 0
          ? friends.map((user: User) => (
              <div className={styles.fetchedUsersItemContainer}>
                <img src={user.user.profile_image_url} />
                <p>{user.user.username}</p>
              </div>
            ))
          : null}

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
                <img src={user.user.profile_image_url} />
                <p>{user.user.username}</p>
                {user.relationship === "NONE" ? (
                  <img
                    onClick={() => friendRequestSendHandler(user)}
                    src="/assets/user-plus-solid.svg"
                  />
                ) : user.relationship === "PENDING" ? (
                  <img src="/assets/envelope.svg" />
                ) : user.relationship === "ACCEPTED" ? (
                  <img src="/assets/user-group-solid.svg" />
                ) : null}
              </div>
            ))
          : null}
      </div>
      {friendRequests && friendRequests.length > 0 ? (
        <>
          <p className={styles.label}>Žádosti o přátelství</p>
          {friendRequests.map((friendRequestUser: User) => (
            <div className={styles.fetchedUsersItemContainer}>
              <img src={friendRequestUser.user.profile_image_url} />
              <p>{friendRequestUser.user?.username}</p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginLeft: "auto",
                  paddingRight: "0.5rem",
                }}
              >
                <img
                  onClick={() => friendRequestDeclineHandler(friendRequestUser)}
                  src="/assets/decline.svg"
                  style={{ cursor: "pointer" }}
                />
                <img
                  onClick={() => friendRequestAcceptHandler(friendRequestUser)}
                  src="/assets/approve.svg"
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
          ))}
        </>
      ) : null}
      <div className={styles.logoutButtonContainer}>
        <CustomButton
          className={styles.logoutButton}
          size="small"
          variant="secondary"
          onClick={() => navigate("/auth")}
          text="Odhlásit se"
        />
      </div>
    </div>
  );
};

export default Profile;
