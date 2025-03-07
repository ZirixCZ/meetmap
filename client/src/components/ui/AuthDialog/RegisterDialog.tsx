import React, { useState } from "react";
import InputField from "./InputField";
import styles from "./AuthDialog.module.css";
import CustomButton from "./CustomButton";
import ProfilePicturePlaceholder from "./ProfilePicturePlaceholder";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../../Constants/constants";

const RegisterDialog = () => {
  const navigate = useNavigate();

  // Define state for each input field
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Hesla se neshodují.");
      return;
    }
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    
    const response = await fetch(apiUrl + "/users-create", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    })

    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      const errorData = await response.json();
      console.error("Registration failed:", errorData.message);
      alert("Registration failed: " + errorData.message
      );
    }

    navigate("/map");
  };

  return (
    <div className={styles.center}>
      <div className={styles["justify-center"]}>
        <h1 className={styles.heading}>
          Friends<span className={styles.hk}>HK</span>
        </h1>
        <ProfilePicturePlaceholder />
        <InputField
          type="text"
          placeholder="Zadejte vaše jméno..."
          title="Jméno"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <InputField
          type="email"
          placeholder="Zadejte email"
          title="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Zadejte heslo..."
          title="Heslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Zadejte heslo..."
          title="Heslo (znovu)"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <div className={styles.gap}></div>
        <CustomButton
          text="Zaregistrovat se"
          onClick={handleRegister}
        />
        <div className={styles.smallGap}></div>
      </div>
    </div>
  );
};

export default RegisterDialog;
