import React from "react";

// New styles to make the placeholder look modern and clickable
const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "start",
    justifyContent: "start",
    gap: "10px",
    cursor: "pointer", // Make the entire container clickable
    margin: "20px 0",
  },
  circle: {
    
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "#f0f0ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    border: "2px dashed #6C63FF",
  },
  plusIcon: {
    fontSize: "36px",
    color: "#6C63FF",
  },
  label: {
    fontSize: "16px",
    fontWeight: "bold" as "bold",
    color: "#333333",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as "cover",
  },
};

interface ProfilePicturePlaceholderProps {
  label?: string;
  circleColor?: string;
  iconColor?: string;
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
}

const ProfilePicturePlaceholder = (props: ProfilePicturePlaceholderProps) => {
  const {
    label = "Profilová fotka",
    circleColor = "#f0f0ff",
    iconColor = "#6C63FF",
    imageUrl,
    onClick,
    className,
  } = props;

  return (
    <div style={{ ...styles.container, ...(className ? { className } : {}) }} onClick={onClick}>
      <span style={styles.label}>{label}</span>
      <div style={{ ...styles.circle, backgroundColor: circleColor }}>
        {imageUrl ? (
          <img src={imageUrl} alt="Profile" style={styles.image} />
        ) : (
          <span
            className="material-icons"
            style={{ ...styles.plusIcon, color: iconColor }}
          >
            +
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfilePicturePlaceholder;
