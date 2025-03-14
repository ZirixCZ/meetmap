import React, { useState, useRef } from "react";
import InputField from "./InputField";
import styles from "./AuthDialog.module.css";
import CustomButton from "./CustomButton";
import ProfilePicturePlaceholder from "./ProfilePicturePlaceholder";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../../Constants/constants";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { firebaseStorage } from "../../../Constants/firebase";
import Logo from "../../../assets/Group 41.png";

const RegisterDialog = () => {
  const navigate = useNavigate();
  // Use a ref to simulate clicking the hidden file input when user clicks the picture placeholder
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define state for input fields and file upload
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [downloadURL, setDownloadURL] = useState<string>("");
  const [Age, setAge] = useState(15);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      const tempUrl = URL.createObjectURL(selectedFile);
      setDownloadURL(tempUrl);
    }
  };

  const handleUpload = async (): Promise<string | void> => {
    if (!file) return;

    try {
      const dateNowUnix = Date.now();
      const storageRef = ref(
        firebaseStorage,
        `images/${dateNowUnix}_${file.name}`,
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progressPercent =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progressPercent);
          },
          (error) => reject(error),
          () => resolve(),
        );
      });

      const url = await getDownloadURL(uploadTask.snapshot.ref);
      setDownloadURL(url);
      console.log("File uploaded successfully:", url);
      return url;
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Hesla se neshodují.");
      return;
    }

    let imageUrl = "";
    if (file) {
      const resultUrl = await handleUpload();
      if (resultUrl) {
        imageUrl = resultUrl;
      }
    }

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Image Url:", imageUrl);

    const response = await fetch(apiUrl + "/users-create", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        username: name + Math.floor(Math.random() * 1000),
        displayName: name,
        password: password,
        profile_image_url: imageUrl,
        age: Age,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      alert("Registrace proběhla úspěšně.");
      navigate("/auth");
    } else {
      const errorData = await response.json();
      console.error("Registration failed:", errorData.message);
      alert("Nastala chyba při registraci: " + errorData.message);
    }
  };

  const handlePlaceholderClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.center}>
      <div className={styles["justify-center"]} style={{ width: "20rem" }}>
      <img src={Logo} alt="logo"  style={{width: 300, alignSelf: "center", marginTop: 100}}/>

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
        <ProfilePicturePlaceholder
          onClick={handlePlaceholderClick}
          imageUrl={downloadURL} // will show the user’s image if exists; otherwise, the add icon.
          label="Profilová fotka"
          className={styles.profilePicture}
          
        />
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
        />
        <InputField
          type="number"
          placeholder="Zadejte váš věk..."
          title="Věk"
          value={Age.toString()}
          onChange={(e) => setAge(parseInt(e.target.value) < 15 ? 15 : parseInt(e.target.value) > 130 ? 130 : parseInt(e.target.value))}
          
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
        <CustomButton text="Zaregistrovat se" onClick={handleRegister} />
        <div className={styles.smallGap}></div>
        <CustomButton
          text="Přihlásit se"
          onClick={() => navigate("/auth")}
          backgroundColor="#F0EFFF"
          textColor="#1B1937"
          hoverColor="#DEDEEC"
        />
        <div className={styles.smallGap}></div>
      </div>
    </div>
  );
};

export default RegisterDialog;
