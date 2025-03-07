import React, { useState } from "react";
import InputField from "./InputField";
import styles from "./AuthDialog.module.css";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { apiUrl } from "../../../Constants/constants";

const AuthDialog = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const user = useUser();

  const handleLogin = async () => {
    console.log("Email:", email);
    console.log("Password:", password);

    const response = await fetch(apiUrl + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      user.setUser(data.user);
      navigate("/map");
    } else {
      const errorData = await response.json();
      console.error("Login failed:", errorData.message);
      alert("Login failed: " + errorData.message);
    }
    
    user.setUser({
      id: "1",
      name: "Test",
      email: email,
      role: "user",
      createdAt: "",
      updatedAt: "",
    });
      

    // 
    //ODO: Add actual authentication logic here
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
