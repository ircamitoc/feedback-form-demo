import React, { useState } from "react";

function FormField({ label, name, value, onChange }) {
  // State to track whether the input is focused or has content
  const [isFocused, setIsFocused] = useState(false);

  // Function to handle input focus
  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  // Function to handle input change
  const handleInputChange = (e) => {
    onChange(e); // Propagate the change event
  };

  return (
    <div
      className={`input-wrap w-100 ${
        isFocused || value ? "not-empty focus" : ""
      }`}
    >
      <input
        className="contact-input"
        autoComplete="off"
        name={name}
        type="text"
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        value={value}
      />
      <label>{label}</label>
      <i
        className={`icon fa-solid fa-${
          name === "name" ? "address-card" : "envelope"
        }`}
      ></i>
    </div>
  );
}

export default FormField;
