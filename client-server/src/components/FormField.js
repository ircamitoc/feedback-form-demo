// components/FormField.js
import React from "react";

function FormField({ label, name, value, onChange, onFocus, onBlur }) {
  const isNotEmpty = value !== ""; // Check if the input has a value

  const handleInputFocus = (e) => {
    e.currentTarget.closest(".input-wrap").classList.add("focus");
    e.currentTarget.closest(".input-wrap").classList.add("not-empty");
  };

  const handleInputBlur = (e) => {
    if (e.currentTarget.value === "") {
      e.currentTarget.closest(".input-wrap").classList.remove("not-empty");
    }
    e.currentTarget.closest(".input-wrap").classList.remove("focus");
  };

  return (
    <div className={`input-wrap w-100 ${isNotEmpty ? "not-empty" : ""}`}>
      <input
        className="contact-input"
        autoComplete="off"
        name={name}
        type="text"
        onChange={onChange}
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
