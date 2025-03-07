import React, { useState } from "react";
import InputField from "./InputField";
import styles from "./AuthDialog.module.css";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";

const AuthDialog = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
    // TODO: Add actual authentication logic here
  };

  return (
    <div className={styles.center}>
      <div className={styles["justify-center"]}>
        <h1 className={styles.heading}>
          Friend<span className={styles.hk}>Mapper</span>
        </h1>
        <InputField
          type="email"
          placeholder="Email"
          title="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Heslo"
          title="Heslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className={styles.gap}></div>
        <CustomButton text="Přihlásit se" onClick={handleLogin} />
        <div className={styles.smallGap}></div>
        <CustomButton
          text="Zaregistrovat"
          onClick={() => navigate("/auth/register")}
          backgroundColor="#F0EFFF"
          textColor="#1B1937"
          hoverColor="#DEDEEC"
        />
      </div>
    </div>
  );
};

export default AuthDialog;
