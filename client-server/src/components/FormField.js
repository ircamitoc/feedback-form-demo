import React, { forwardRef } from "react";

const FormField = forwardRef(
  ({ label, name, value, onChange, onFocus, onBlur }, ref) => {
    return (
      <div className="input-wrap">
        <input
          type="text"
          className="contact-input"
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          ref={ref} // Pass the ref here
        />
        <label>{label}</label>
        <i className="icon fa-solid fa-inbox"></i>
      </div>
    );
  }
);

export default FormField;
