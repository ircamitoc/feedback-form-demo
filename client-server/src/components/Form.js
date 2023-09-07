import React, { useReducer, useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../config";
import { RECAPTCHA_KEY } from "../recaptcha";
import FormField from "./FormField.js";

// Define your action types as constants
const UPDATE_FIELD = "UPDATE_FIELD";
const RESET_FORM = "RESET_FORM";

// Define your initial state
const initialState = {
  name: "",
  emailAddress: "",
  extraInfo: "",
  checkboxChecked: false,
};

// Define your reducer function
const formReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_FIELD:
      return { ...state, [action.field]: action.value };
    case RESET_FORM:
      return initialState;
    default:
      return state;
  }
};

function Form() {
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [captchaVisible, setCaptchaVisible] = useState(false);

  // Destructure formState to access form values
  const { name, emailAddress, extraInfo, checkboxChecked } = formState;

  // Define handleInputFocus and handleInputBlur functions here
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

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Update form state using the UPDATE_FIELD action
    dispatch({ type: UPDATE_FIELD, field: name, value });

    if (type === "checkbox") {
      dispatch({
        type: UPDATE_FIELD,
        field: "checkboxChecked",
        value: checked,
      });
    }
  };

  const allowedEmailDomains = [
    "gmail.com",
    "hotmail.com",
    "yahoo.com",
    "aol.com",
    "msn.com",
  ]; // Add your allowed domains here
  const MAX_CHARACTERS = 2000; // Define the maximum character limit
  const MAX_NAME = 30; // Define the maximum character list

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if all fields are filled and the checkbox is checked
    if (name && emailAddress && extraInfo && checkboxChecked) {
      setCaptchaVisible(true);
    } else {
      setCaptchaVisible(false);
    }
  }, [name, emailAddress, extraInfo, checkboxChecked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const namePattern = /^[A-Za-z\s]+$/;

    if (!name || !emailAddress || !extraInfo) {
      toast.error("Please fill out all required fields.");
      setSubmitting(false);
      return;
    } else if (!namePattern.test(name)) {
      toast.error("Name should contain only letters and spaces");
      setSubmitting(false);
      return;
    } else if (name.length > MAX_NAME) {
      toast.error(`Message must not exceed ${MAX_NAME} characters`);
      setSubmitting(false);
      return;
    } else if (!isValidEmail(emailAddress)) {
      toast.error("Invalid email address. Please check your email format.");
      setSubmitting(false);
      return;
    } else if (extraInfo.length > MAX_CHARACTERS) {
      toast.error(`Message must not exceed ${MAX_CHARACTERS} characters`);
      setSubmitting(false);
      return;
    }

    // Check the checkbox's checked property directly on the DOM element
    const checkbox = document.getElementById("termsConditions");

    if (!checkbox || !checkbox.checked) {
      toast.error("Please agree to the Terms and Conditions");
      setSubmitting(false);
      return;
    }

    if (!captchaVerified) {
      toast.error("Please verify the reCAPTCHA");
      setSubmitting(false);
      return;
    }

    try {
      const currentTimestamp = new Date().toString();
      const response = await axios.post(`${API_URL}/submitFormToNotion`, {
        name,
        emailAddress,
        extraInfo,
        Timestamp: currentTimestamp,
      });

      if (response.status === 200) {
        dispatch({ type: RESET_FORM });
        console.log("Success!");
        toast.success("Form submitted successfully");
      } else {
        toast.error("Form submission failed");
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        // Handle specific error cases
        const { status } = error.response;

        if (status === 429) {
          toast.error("429 - Too Many Requests. Please try again later.");
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      } else {
        // Handle other network or unexpected errors
        toast.error("Sorry, something went wrong. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Function to validate email address
  const isValidEmail = (email) => {
    const emailParts = email.split("@");
    if (emailParts.length !== 2) {
      return false; // Email should have exactly one "@" symbol
    }

    const domain = emailParts[1].toLowerCase();
    return allowedEmailDomains.includes(domain);
  };

  const [captchaVerified, setCaptchaVerified] = useState(false);

  const onChange = (value) => {
    // If value is null, it means the user hasn't verified the reCAPTCHA
    setCaptchaVerified(value !== null);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {/* Use formState values and handleFieldChange for form inputs */}
      <FormField
        label="Name"
        name="name"
        value={name}
        onChange={handleFieldChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      <FormField
        label="Email Address"
        name="emailAddress"
        value={emailAddress}
        onChange={handleFieldChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      <div className="input-wrap textarea w-100">
        <textarea
          name="extraInfo"
          autoComplete="off"
          className="contact-input"
          onChange={handleFieldChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          value={extraInfo}
        ></textarea>
        <label>Feedback</label>
        <i className="icon fa-solid fa-inbox"></i>
      </div>
      <div className="contact-buttons">
        <label className="check-container">
          <p>
            I have read and agreed to the{" "}
            <a href="###" target="_blank" rel="noopener noreferrer">
              Terms and Conditions
            </a>
            .
          </p>
          <input
            type="checkbox"
            id="termsConditions"
            name="checkboxChecked"
            checked={checkboxChecked}
            onChange={handleFieldChange}
          />
          <span className="checkmark"></span>
        </label>
      </div>
      {captchaVisible && (
        <div className="contact-buttons">
          <div className="recaptcha-container">
            <ReCAPTCHA sitekey={`${RECAPTCHA_KEY}`} onChange={onChange} />
          </div>
          <br />
        </div>
      )}
      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export default Form;
