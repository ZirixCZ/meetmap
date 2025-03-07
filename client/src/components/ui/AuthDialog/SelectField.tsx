import React from 'react';
import styles from './SelectField.module.css';
import cx from 'classnames';

interface SelectProps {
  placeholder: string;
  title: string | undefined;
  options: string[];  // Array of options for the select dropdown
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectField = (props: SelectProps) => {
  return (
    <div className={cx(styles.fieldContainer, styles.text)}>
      <p>
        {props.title ?? props.placeholder}
      </p>
      <select className={styles.select}>
        <option value="" disabled selected hidden>
          {props.placeholder} {/* Placeholder for the select */}
        </option>
        {props.options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
