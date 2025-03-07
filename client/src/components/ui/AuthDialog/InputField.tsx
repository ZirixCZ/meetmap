import React from "react";
import styles from "./InputField.module.css";
import cx from "classnames";

interface InputProps {
  type: string;
  placeholder: string;
  title?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const InputField: React.FC<InputProps> = ({ type, placeholder, title, value, onChange, className }) => {
  return (
    <div className={cx(styles.fieldContainer, styles.text, className)}>
      <p>{title ?? placeholder}</p>
      <input
        type={type}
        placeholder={placeholder}
        className={styles.input}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default InputField;
